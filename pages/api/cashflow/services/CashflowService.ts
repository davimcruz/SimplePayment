import { memoize } from "lodash"
import NodeCache from "node-cache"
import prisma from "@/lib/prisma"
import redis from "@/lib/cache/redis"
import { monthNames } from "@/utils/monthNames"
import { atualizarFluxoReal } from "@/utils/cashflow/flowReal"
import { compararFluxos } from "@/utils/cashflow/flowComparisons"
import { realocarFluxo } from "@/utils/cashflow/flowBudget"

class CashflowService {
  private memoryCache: NodeCache
  private readonly CACHE_TTL = {
    SHORT: 60 * 5, // 5 minutos
    MEDIUM: 60 * 60, // 1 hora
    LONG: 60 * 60 * 24, // 24 horas
  }

  constructor() {
    // Inicializa o cache em memória
    this.memoryCache = new NodeCache({
      stdTTL: this.CACHE_TTL.SHORT,
      checkperiod: 120,
    })
  }

  // Métodos auxiliares para gerenciar cache em memória
  private async getMemoryCache(key: string): Promise<string | null> {
    const value = this.memoryCache.get<string>(key)
    return value || null
  }

  private async setMemoryCache(
    key: string,
    value: string,
    ttl: number
  ): Promise<void> {
    this.memoryCache.set(key, value, ttl)
  }

  // Serviço de obtenção de fluxo de caixa do usuário
  async getFlow(userId: number) {
    const currentYear = new Date().getFullYear()
    const cacheKey = `userFlow:${userId}:${currentYear}`

    try {
      // Sistema de cache em camadas (Isso tá muito rápido)
      // 1. Verifica cache em memória (mais rápido)
      const memoryCache = await this.getMemoryCache(cacheKey)
      if (memoryCache) return JSON.parse(memoryCache)

      // 2. Verifica cache no Redis
      const redisCache = await redis.get(cacheKey)
      if (redisCache) {
        // Atualiza cache em memória
        await this.setMemoryCache(cacheKey, redisCache, this.CACHE_TTL.SHORT)
        return JSON.parse(redisCache)
      }

      // 3. Busca do banco de dados
      const flows = await prisma.orcamento.findMany({
        where: {
          userId,
          ano: currentYear,
        },
        select: {
          mes: true,
          ano: true,
          receitaOrcada: true,
          despesaOrcada: true,
          saldoOrcado: true,
          receitaRealizada: true,
          despesaRealizada: true,
          saldoRealizado: true,
          gapMoney: true,
          gapPercentage: true,
          status: true,
        },
      })

      // 4. Prepara dados para cache
      const flowsWithMonthNames = this.prepareFlowsForCache(flows)

      // 5. Armazena em ambos os caches
      const flowsString = JSON.stringify(flowsWithMonthNames)
      await Promise.all([
        this.setMemoryCache(cacheKey, flowsString, this.CACHE_TTL.SHORT),
        redis.set(cacheKey, flowsString, "EX", this.CACHE_TTL.MEDIUM),
      ])

      return flowsWithMonthNames
    } catch (error) {
      console.error(
        `[ERRO] Falha ao obter fluxo para usuário ${userId}:`,
        error
      )
      throw new Error("Falha ao recuperar dados de fluxo")
    }
  }

  // Preparação de dados com memoização
  private prepareFlowsForCache = (flows: any[]): any[] => {
    const memoizedFunction = memoize((flowArray: any[]) => {
      return flowArray.map((flow) => ({
        ...flow,
        nome: monthNames[flow.mes - 1],
        status: flow.status || "neutro",
      }))
    })

    return memoizedFunction(flows)
  }

  // Método para limpar o cache
  async invalidateCache(userId: number): Promise<void> {
    const currentYear = new Date().getFullYear()
    const cacheKey = `userFlow:${userId}:${currentYear}`

    await Promise.all([this.memoryCache.del(cacheKey), redis.del(cacheKey)])
  }

  // Verifica se já existe fluxo para o usuário/ano
  async checkExistingFlow(userId: number, year: number) {
    const existingFlow = await prisma.orcamento.findFirst({
      where: { userId, ano: year },
    })
    return !!existingFlow
  }

  // Cria novo fluxo
  async createFlow(userId: number, validMonths: [string, any][], year: number) {
    await prisma.$transaction(
      validMonths.map(([mes, valores]) =>
        prisma.orcamento.create({
          data: {
            userId,
            mes: Number(mes),
            ano: year,
            receitaOrcada: valores.receitaOrcada,
            despesaOrcada: valores.despesaOrcada,
          },
        })
      )
    )

    await this.processFlow(userId)
  }

  // Atualiza fluxo existente
  async updateFlow(
    userId: number,
    flow: { [key: string]: { receitaOrcada: number; despesaOrcada: number } }
  ) {
    const year = new Date().getFullYear()

    try {
      // Atualiza os valores orçados
      await prisma.$transaction(
        Object.entries(flow).map(([mes, valores]) =>
          prisma.orcamento.update({
            where: {
              userId_mes_ano: {
                userId,
                mes: Number(mes),
                ano: year,
              },
            },
            data: {
              receitaOrcada: valores.receitaOrcada,
              despesaOrcada: valores.despesaOrcada,
              status: "neutro",
            },
          })
        )
      )

      // Processa o fluxo atualizado
      await this.processFlow(userId)

      // Invalida o cache
      await this.invalidateCache(userId)
    } catch (error) {
      console.error("[ERRO] Falha ao atualizar fluxo:", error)
      throw new Error("Falha ao atualizar o fluxo de caixa")
    }
  }

  // Processa o fluxo (atualiza real, compara e realoca)
  private async processFlow(userId: number) {
    try {
      // Atualiza valores realizados
      await atualizarFluxoReal(userId)

      // Compara orçado vs realizado
      await compararFluxos(userId)

      // Realoca saldos
      await realocarFluxo(userId)
    } catch (error) {
      console.error("[ERRO] Falha ao processar fluxo:", error)
      throw new Error("Falha ao processar o fluxo de caixa")
    }
  }
}

export default new CashflowService()
