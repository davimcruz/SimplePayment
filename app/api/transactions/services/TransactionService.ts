import prisma from "@/lib/prisma"
import { v4 as uuidv4 } from "uuid"
import redis from "@/lib/cache/redis"
import { parse, format } from "date-fns"
import { invalidateSummaryCache } from "@/lib/invalidateSummaryCache"
import { atualizarFluxoReal } from "@/utils/cashflow/flowReal"
import { compararFluxos } from "@/utils/cashflow/flowComparisons"
import { transacoes, parcelas as ParcelasType } from "@prisma/client"
import NodeCache from "node-cache"
import { sharedMemoryCache } from '@/lib/cache/sharedCache'

interface CreateTransactionDTO {
  nome: string
  tipo: string
  fonte: string
  detalhesFonte?: string
  data: string
  valor: number
  cardId?: string
}

interface CreateTransactionResponse {
  success: boolean
  transactionId: string
}

interface DeleteTransactionResponse {
  success: boolean
  message?: string
}

interface MonthlyComparison {
  [key: string]: {
    income: number
    expense: number
  }
}

interface UpdateTransactionDTO {
  nome?: string
  tipo?: string
  fonte?: string
  detalhesFonte?: string | null
  data?: string
  valor?: number | string
  cardId?: string | null
}

// Cache em memória com TTL de 5 minutos e checagem a cada 1 minuto
const memoryCache = new NodeCache({
  stdTTL: 300,
  checkperiod: 60,
  useClones: false,
})

interface CachedTransaction extends transacoes {
  timestamp: number
}

interface CacheKeys {
  transactions: string
  userFlow: string
  cashFlow: string
  summary: string
  localCashFlow: string
  localComparison: string
  localBudget: string
  localRealFlow: string
  localProjectedFlow: string
}

interface TableTransaction {
  transactionId: string
  nome: string
  tipo: string
  fonte: string
  detalhesFonte: string | null
  data: string | null
  valor: number
}

class TransactionService {
  private readonly REDIS_TTL = 3600
  private readonly CACHE_KEY_PREFIX = "transactions:user:"
  private readonly STALE_TIME = 5 * 60 * 1000 // 5 minutos

  private getCacheKeys(userId: number): CacheKeys {
    const anoAtual = new Date().getFullYear()
    return {
      transactions: `${this.CACHE_KEY_PREFIX}${userId}`,
      userFlow: `userFlow:${userId}:${anoAtual}`,
      cashFlow: `userFlow:${userId}:${anoAtual}`,
      summary: `summary:${userId}:${anoAtual}`,
      localCashFlow: `cashFlow:${userId}:${anoAtual}`,
      localComparison: `comparison:${userId}:${anoAtual}`,
      localBudget: `budget:${userId}:${anoAtual}`,
      localRealFlow: `realFlow:${userId}:${anoAtual}`,
      localProjectedFlow: `projectedFlow:${userId}:${anoAtual}`
    }
  }

  private async invalidateAllCaches(userId: number, waitForCompletion: boolean = false): Promise<void> {
    const cacheKeys = this.getCacheKeys(userId)

    // Invalidar userFlow imediatamente - isso é crítico
    await redis.del(cacheKeys.userFlow)
    console.log(`[Cache] UserFlow invalidado para usuário ${userId}`)

    // Resto das invalidações pode ser em background
    const invalidationPromise = (async () => {
      // Invalidar outros caches Redis
      await Promise.all([
        redis.del(cacheKeys.transactions),
        redis.del(cacheKeys.cashFlow),
        redis.del(cacheKeys.summary)
      ])

      // Limpar cache de transações
      memoryCache.del(cacheKeys.transactions)

      // Atualizar fluxos
      try {
        await invalidateSummaryCache(userId)
        await atualizarFluxoReal(userId)
        await compararFluxos(userId)
        
        console.log(`[Cache] Demais caches invalidados e fluxos atualizados para usuário ${userId}`)
      } catch (error) {
        console.error('[Cache] Erro ao atualizar fluxos após invalidação:', error)
      }
    })()

    if (waitForCompletion) {
      await invalidationPromise
    } else {
      invalidationPromise.catch(error => {
        console.error('[Cache] Erro na invalidação em background:', error)
      })
    }
  }

  private async invalidateCriticalCaches(userId: number): Promise<void> {
    const cacheKeys = this.getCacheKeys(userId)
    
    // Invalidar caches críticos em paralelo
    await Promise.all([
      redis.del(cacheKeys.userFlow),
      redis.del(cacheKeys.summary),
      invalidateSummaryCache(userId)
    ])
  }

  async create(
    dto: CreateTransactionDTO,
    userId: number
  ): Promise<CreateTransactionResponse> {
    try {
      const transactionId = uuidv4()
      const formattedDate = this.formatTransactionDate(dto.data)
      const cacheKeys = this.getCacheKeys(userId)

      // Transação e invalidação crítica em paralelo
      await Promise.all([
        prisma.transacoes.create({
          data: {
            transactionId,
            nome: dto.nome,
            tipo: dto.tipo,
            fonte: dto.fonte,
            detalhesFonte: dto.detalhesFonte || null,
            data: formattedDate,
            valor: dto.valor,
            usuarios: {
              connect: { id: userId },
            },
            cartoes: dto.cardId
              ? {
                  connect: { cardId: dto.cardId },
                }
              : undefined,
          },
        }),
        this.invalidateCriticalCaches(userId)
      ])

      // Cache local imediato
      memoryCache.del(cacheKeys.transactions)
      
      // Resto em background
      setImmediate(() => {
        Promise.all([
          atualizarFluxoReal(userId),
          compararFluxos(userId)
        ]).catch(error => {
          console.error('[Cache] Erro na atualização em background:', error)
        })
      })

      return { success: true, transactionId }
    } catch (error) {
      console.error("Erro ao criar transação:", error)
      throw error
    }
  }

  private formatTransactionDate(data: string): string {
    if (/^\d{2}-\d{2}-\d{4}$/.test(data)) {
      const parsedDate = parse(data, "dd-MM-yyyy", new Date())
      return format(parsedDate, "dd-MM-yyyy")
    }

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(data)) {
      return format(new Date(data), "dd-MM-yyyy")
    }

    throw new Error("[ERRO] Formato de data inválido")
  }

  async getTransactions(userId: number): Promise<transacoes[]> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${userId}`

    try {
      // Tentar cache em memória primeiro
      const memCached = memoryCache.get<CachedTransaction[]>(cacheKey)
      if (memCached) {
        // Se o cache não está obsoleto, retorna imediatamente
        if (Date.now() - memCached[0]?.timestamp <= this.STALE_TIME) {
          return memCached
        }
        // Se está obsoleto, atualiza em background e retorna o cache atual
        this.fetchAndCacheTransactions(userId).catch(console.error)
        return memCached
      }

      // Tentar cache Redis
      const redisCached = await redis.get(cacheKey)
      if (redisCached) {
        const parsedData = JSON.parse(redisCached)
        this.setMemoryCache(cacheKey, parsedData)
        return parsedData
      }

      // Se não há cache, busca do banco
      return await this.fetchAndCacheTransactions(userId)
    } catch (error) {
      console.error("Erro ao buscar transações:", error)
      
      // Em caso de erro, tenta usar cache obsoleto
      const staleCached = memoryCache.get<CachedTransaction[]>(cacheKey)
      if (staleCached) {
        console.log("Usando dados em cache obsoletos devido a erro")
        return staleCached
      }

      throw new Error("[ERRO] Falha ao buscar transações")
    }
  }

  // Simplificando também o fetchAndCacheTransactions
  private async fetchAndCacheTransactions(userId: number): Promise<transacoes[]> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${userId}`

    const transactions = await prisma.transacoes.findMany({
      where: { userId },
      orderBy: { data: "desc" },
    })

    const transactionsWithTimestamp = transactions.map(t => ({
      ...t,
      timestamp: Date.now()
    }))

    // Atualizar caches em paralelo
    await Promise.all([
      this.setMemoryCache(cacheKey, transactionsWithTimestamp),
      this.setRedisCache(cacheKey, transactions)
    ])

    return transactions
  }

  private setMemoryCache(key: string, data: any): void {
    memoryCache.set(key, data)
  }

  private async setRedisCache(key: string, data: any): Promise<void> {
    await redis.setex(key, this.REDIS_TTL, JSON.stringify(data))
  }

  async delete(transactionId: string): Promise<DeleteTransactionResponse> {
    const currentTransaction = await prisma.transacoes.findUnique({
      where: { transactionId },
    })

    if (!currentTransaction) {
      throw new Error("[ERRO] Transação não encontrada")
    }

    const userId = currentTransaction.userId
    const cacheKeys = this.getCacheKeys(userId)

    // Usar transação do Prisma para garantir atomicidade
    await prisma.$transaction(async (tx) => {
      // Deletar parcelas
      await tx.parcelas.deleteMany({
        where: { transacaoId: transactionId },
      })

      // Atualizar ou deletar faturas
      const parcelas = await tx.parcelas.findMany({
        where: { transacaoId: transactionId },
      })

      const faturasToCheck = new Set(parcelas.map((parcela) => parcela.faturaId))

      for (const faturaId of faturasToCheck) {
        if (!faturaId) continue

        const outrasParcelas = await tx.parcelas.findMany({
          where: { faturaId },
        })

        if (outrasParcelas.length === 0) {
          await tx.faturas.delete({
            where: { faturaId },
          })
        } else {
          const novoValorTotal = outrasParcelas.reduce(
            (total, parcela) => total + parcela.valorParcela,
            0
          )
          await tx.faturas.update({
            where: { faturaId },
            data: { valorTotal: novoValorTotal },
          })
        }
      }

      // Deletar a transação
      await tx.transacoes.delete({
        where: { transactionId },
      })
    })

    // Invalidação crítica e cache local em paralelo
    await Promise.all([
      this.invalidateCriticalCaches(userId),
      memoryCache.del(cacheKeys.transactions)
    ])

    // Resto em background
    setImmediate(() => {
      Promise.all([
        atualizarFluxoReal(userId),
        compararFluxos(userId)
      ]).catch(error => {
        console.error('[Cache] Erro na atualização em background:', error)
      })
    })

    return {
      success: true,
      message: "[SUCESSO] Transação deletada com sucesso",
    }
  }

  async getComparison(userId: number): Promise<MonthlyComparison> {
    if (!userId || isNaN(userId)) {
      throw new Error("[ERRO] ID de usuário inválido")
    }

    const transactions = await this.getTransactions(userId)

    if (!transactions) {
      throw new Error("[ERRO] Falha ao buscar transações")
    }

    const monthlyTransactions: MonthlyComparison = {}

    transactions.forEach((transaction) => {
      const [day, month, year] = transaction.data?.split("-") || []

      const dateKey = `01-${month}-${year}`

      if (!monthlyTransactions[dateKey]) {
        monthlyTransactions[dateKey] = { income: 0, expense: 0 }
      }

      const value = transaction.valor ?? 0

      if (transaction.tipo === "receita") {
        monthlyTransactions[dateKey].income += value
      } else if (transaction.tipo === "despesa") {
        monthlyTransactions[dateKey].expense += value
      }
    })

    return monthlyTransactions
  }

  async getTransactionsTable(userId: number): Promise<TableTransaction[]> {
    if (!userId || isNaN(userId)) {
      throw new Error("[ERRO] ID de usuário inválido")
    }

    const cacheKey = `${this.CACHE_KEY_PREFIX}table:${userId}`
    
    try {
      // Tentar cache em memória primeiro
      const memCached = memoryCache.get<TableTransaction[]>(cacheKey)
      if (memCached) {
        return memCached
      }

      // Buscar do banco
      const transactions = await prisma.transacoes.findMany({
        where: { userId },
        include: {
          cartoes: {
            select: {
              nomeCartao: true,
            },
          },
        },
        orderBy: {
          data: 'desc'
        },
      })

      const table = transactions.map((transaction) => ({
        transactionId: transaction.transactionId,
        nome: transaction.nome,
        tipo: transaction.tipo,
        fonte: transaction.fonte,
        detalhesFonte:
          transaction.fonte === "cartao-credito"
            ? transaction.cartoes?.nomeCartao || null
            : transaction.detalhesFonte || null,
        data: transaction.data || null,
        valor: transaction.valor ? Number(transaction.valor) : 0,
      }))

      memoryCache.set(cacheKey, table, 300) 

      return table
    } catch (error) {
      console.error("[ERRO] Falha ao buscar tabela de transações:", error)
      throw error
    }
  }

  async updateTransaction(
    transactionId: string, 
    updateFields: Partial<UpdateTransactionDTO>
  ): Promise<transacoes> {
    const currentTransaction = await prisma.transacoes.findUnique({
      where: { transactionId },
      include: { parcelas: true }
    })

    if (!currentTransaction) {
      throw new Error("[ERRO] Transação não encontrada")
    }

    const updates: Partial<transacoes> = {}

    if ("nome" in updateFields) updates.nome = updateFields.nome!
    if ("tipo" in updateFields) updates.tipo = updateFields.tipo!
    if ("fonte" in updateFields) updates.fonte = updateFields.fonte!
    if ("detalhesFonte" in updateFields) updates.detalhesFonte = updateFields.detalhesFonte
    if ("data" in updateFields) updates.data = updateFields.data
    
    if ("valor" in updateFields && updateFields.valor !== undefined) {
      const valorFloat = typeof updateFields.valor === "number" 
        ? updateFields.valor 
        : parseFloat(String(updateFields.valor))
      
      updates.valor = valorFloat

      if (currentTransaction.parcelas?.length > 0) {
        await this.updateParcelas(transactionId, valorFloat, currentTransaction.parcelas)
      }
    }

    if ("cardId" in updateFields) {
      if (updateFields.cardId) {
        const cartao = await prisma.cartoes.findUnique({
          where: { cardId: updateFields.cardId }
        })
        if (!cartao) {
          throw new Error("[ERRO] Cartão não encontrado")
        }
      }
      updates.cardId = updateFields.cardId
    }

    if (Object.keys(updates).length === 0) {
      throw new Error("[AVISO] Nenhuma alteração detectada")
    }

    const updatedTransaction = await prisma.transacoes.update({
      where: { transactionId },
      data: updates
    })

    const cacheKeys = this.getCacheKeys(currentTransaction.userId)
    
    // Invalidação crítica imediata
    await Promise.all([
      redis.del(cacheKeys.userFlow),
      redis.del(cacheKeys.transactions),
      redis.del(cacheKeys.summary),
      invalidateSummaryCache(currentTransaction.userId),
      memoryCache.del(cacheKeys.transactions)
    ])

    // Atualizações em background
    setImmediate(() => {
      Promise.all([
        atualizarFluxoReal(currentTransaction.userId),
        compararFluxos(currentTransaction.userId)
      ]).catch(error => {
        console.error('[Cache] Erro na atualização em background:', error)
      })
    })

    return updatedTransaction
  }

  private async updateParcelas(
    transactionId: string, 
    novoValor: number, 
    parcelas: ParcelasType[]
  ): Promise<void> {
    const valorParcelaNovo = novoValor / parcelas.length

    await prisma.parcelas.updateMany({
      where: { transacaoId: transactionId },
      data: { valorParcela: valorParcelaNovo }
    })

    const faturaIds = [...new Set(
      parcelas
        .map(parcela => parcela.faturaId)
        .filter((id): id is string => id !== null)
    )]

    for (const faturaId of faturaIds) {
      const totalParcelas = await prisma.parcelas.aggregate({
        where: { faturaId },
        _sum: { valorParcela: true }
      })

      await prisma.faturas.update({
        where: { faturaId },
        data: { valorTotal: totalParcelas._sum.valorParcela || 0 }
      })
    }
  }
}

export default new TransactionService()
