import prisma from "@/lib/prisma"
import { BigNumber } from "bignumber.js"
import { v4 as uuidv4 } from "uuid"
import { parse, format } from "date-fns"
import redis from "@/lib/cache/redis"
import { invalidateSummaryCache } from "@/lib/invalidateSummaryCache"
import { atualizarFluxoReal } from "@/utils/cashflow/flowReal"
import { compararFluxos } from "@/utils/cashflow/flowComparisons"
import { Prisma } from "@prisma/client"
import { sharedMemoryCache } from "@/lib/cache/sharedCache"

interface CreateParcelDTO {
  userId: number
  cardId: string
  nome: string
  tipo: string
  fonte: string
  detalhesFonte?: string
  data: string
  valor: number
  numeroParcelas: number
}

interface PrepareParcelOperationsParams {
  userId: number
  cardId: string
  nome: string
  tipo: string
  fonte: string
  detalhesFonte?: string
  valorParcela: number
  grupoParcelamentoId: string
  mesInicial: number
  anoInicial: number
  formattedDate: string
  vencimento: number
  numeroParcelas: number
}

interface ParcelOperationsParams {
  parcelaTransactionId: string
  grupoParcelamentoId: string
  nome: string
  tipo: string
  fonte: string
  detalhesFonte?: string
  dataParcela: string
  valorParcela: number
  userId: number
  cardId: string
  mesParcela: number
  anoParcela: number
  vencimento: number
  parcelaNumero: number
}

class ParcelService {
  private readonly CACHE_TTL = 3600
  private readonly MAX_BATCH_SIZE = 100

  async createParcels(dto: CreateParcelDTO) {
    this.validateCreateParcelDTO(dto)

    const cartao = await this.getCardWithCache(dto.cardId)
    if (!cartao) throw new Error("[ERRO] Cartão não encontrado")

    const formattedDate = this.formatTransactionDate(dto.data)
    const grupoParcelamentoId = uuidv4()
    const valorParcela = this.calculateParcelValue(
      dto.valor,
      dto.numeroParcelas
    )

    const { mesInicial, anoInicial } = this.calculateInitialDate(
      formattedDate,
      cartao.vencimento
    )

    const operations = await this.prepareParcelOperations({
      ...dto,
      grupoParcelamentoId,
      valorParcela,
      mesInicial,
      anoInicial,
      formattedDate,
      vencimento: cartao.vencimento,
    })

    for (let i = 0; i < operations.length; i += this.MAX_BATCH_SIZE) {
      const batch = operations.slice(i, i + this.MAX_BATCH_SIZE)
      await prisma.$transaction(batch)
    }

    this.invalidateUserCaches(dto.userId).catch(console.error)

    return { success: true, grupoParcelamentoId }
  }

  private async createParcelOperations({
    parcelaTransactionId,
    grupoParcelamentoId,
    nome,
    tipo,
    fonte,
    detalhesFonte,
    dataParcela,
    valorParcela,
    userId,
    cardId,
    mesParcela,
    anoParcela,
    vencimento,
    parcelaNumero,
  }: ParcelOperationsParams): Promise<Prisma.PrismaPromise<any>[]> {
    const operations: Prisma.PrismaPromise<any>[] = []

    operations.push(
      prisma.transacoes.create({
        data: {
          transactionId: parcelaTransactionId,
          grupoParcelamentoId,
          nome: `${nome} (${parcelaNumero}° Parcela)`,
          tipo,
          fonte,
          detalhesFonte: detalhesFonte || null,
          data: dataParcela,
          valor: valorParcela,
          usuarios: { connect: { id: userId } },
          cartoes: { connect: { cardId } },
        },
      })
    )

    const fatura = await this.getOrCreateFatura(
      cardId,
      mesParcela,
      anoParcela,
      vencimento
    )

    operations.push(
      prisma.parcelas.create({
        data: {
          transacaoId: parcelaTransactionId,
          cardId,
          faturaId: fatura.faturaId,
          valorParcela,
          mes: mesParcela,
          ano: anoParcela,
          pago: false,
        },
      })
    )

    operations.push(
      prisma.faturas.update({
        where: { faturaId: fatura.faturaId },
        data: { valorTotal: { increment: valorParcela } },
      })
    )

    return operations
  }

  private validateCreateParcelDTO(dto: CreateParcelDTO) {
    if (dto.numeroParcelas <= 0 || dto.numeroParcelas > 24) {
      throw new Error("[ERRO] Número de parcelas inválido")
    }
    if (dto.valor <= 0) {
      throw new Error("[ERRO] Valor deve ser positivo")
    }
  }

  private async getCardWithCache(cardId: string) {
    const cacheKey = `card:${cardId}`
    const cachedCard = await redis.get(cacheKey)

    if (cachedCard) {
      return JSON.parse(cachedCard)
    }

    const card = await prisma.cartoes.findUnique({
      where: { cardId },
      select: { vencimento: true },
    })

    if (card) {
      await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(card))
    }

    return card
  }

  private calculateParcelValue(valor: number, numeroParcelas: number): number {
    return new BigNumber(valor)
      .dividedBy(numeroParcelas)
      .decimalPlaces(2)
      .toNumber()
  }

  private async prepareParcelOperations(params: PrepareParcelOperationsParams) {
    const operations: Prisma.PrismaPromise<any>[] = []

    for (let i = 0; i < params.numeroParcelas; i++) {
      const { mesParcela, anoParcela, dataParcela } = this.calculateParcelDate(
        i,
        params.mesInicial,
        params.anoInicial,
        params.vencimento,
        params.formattedDate
      )

      const parcelaTransactionId = uuidv4()

      const parcelOperations = await this.createParcelOperations({
        parcelaTransactionId,
        grupoParcelamentoId: params.grupoParcelamentoId,
        nome: params.nome,
        tipo: params.tipo,
        fonte: params.fonte,
        detalhesFonte: params.detalhesFonte,
        dataParcela,
        valorParcela: params.valorParcela,
        userId: params.userId,
        cardId: params.cardId,
        mesParcela,
        anoParcela,
        vencimento: params.vencimento,
        parcelaNumero: i + 1,
      })

      operations.push(...parcelOperations)
    }

    return operations
  }

  private formatTransactionDate(data: string): string {
    if (/^\d{2}-\d{2}-\d{4}$/.test(data)) {
      const parsedDate = parse(data, "dd-MM-yyyy", new Date())
      return format(parsedDate, "dd-MM-yyyy")
    }

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(data)) {
      return format(new Date(data), "dd-MM-yyyy")
    }

    throw new Error("Formato de data inválido")
  }

  private calculateInitialDate(formattedDate: string, vencimento: number) {
    const dataTransacao = parse(formattedDate, "dd-MM-yyyy", new Date())
    const mesInicial = dataTransacao.getMonth() + 1
    const anoInicial = dataTransacao.getFullYear()
    const hoje = new Date()

    if (hoje.getMonth() + 1 === mesInicial && hoje.getDate() > vencimento) {
      return {
        mesInicial: (mesInicial % 12) + 1,
        anoInicial: mesInicial === 12 ? anoInicial + 1 : anoInicial,
      }
    }

    return { mesInicial, anoInicial }
  }

  private async getOrCreateFatura(
    cardId: string,
    mes: number,
    ano: number,
    vencimento: number
  ) {
    let fatura = await prisma.faturas.findFirst({
      where: { cardId, mes, ano },
    })

    if (!fatura || fatura.pago) {
      const vencimentoData = new Date(ano, mes - 1, vencimento)
      fatura = await prisma.faturas.create({
        data: {
          cardId,
          mes,
          ano,
          valorTotal: 0,
          vencimento: vencimentoData,
        },
      })
    }

    return fatura
  }

  private async invalidateUserCaches(userId: number) {
    const anoAtual = new Date().getFullYear()
    const cacheKeys = {
      userFlow: `userFlow:${userId}:${anoAtual}`,
      transactions: `transactions:user:${userId}`,
      summary: `summary:${userId}`,
      monthlyTransactions: `monthlyTransactions:${userId}`,
      monthlyBalance: `monthlyBalance:${userId}`,
    }

    // Invalidação crítica imediata
    await Promise.all([
      redis.del(cacheKeys.userFlow),
      redis.del(cacheKeys.transactions),
      redis.del(cacheKeys.summary),
      redis.del(cacheKeys.monthlyTransactions),
      redis.del(cacheKeys.monthlyBalance),
      invalidateSummaryCache(userId),
      sharedMemoryCache.del(cacheKeys.transactions)
    ])

    // Atualizações em background
    setImmediate(async () => {
      try {
        await atualizarFluxoReal(userId)
        await compararFluxos(userId)
      } catch (error) {
        console.error('[Cache] Erro na atualização em background:', error)
      }
    })
  }

  private calculateParcelDate(
    parcelaIndex: number,
    mesInicial: number,
    anoInicial: number,
    vencimento: number,
    dataTransacao: string
  ): { mesParcela: number; anoParcela: number; dataParcela: string } {
    let mesParcela = ((mesInicial - 1 + parcelaIndex) % 12) + 1
    let anoParcela =
      anoInicial + Math.floor((mesInicial - 1 + parcelaIndex) / 12)

    const [diaOriginal] = dataTransacao.split("-")
    const dataParcela = `${diaOriginal}-${String(mesParcela).padStart(
      2,
      "0"
    )}-${anoParcela}`

    return { mesParcela, anoParcela, dataParcela }
  }
}

export default new ParcelService()
