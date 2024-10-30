import prisma from "@/lib/prisma"
import redis from "@/lib/redis" 
import { monthNames } from "@/utils/monthNames"
import { atualizarFluxoReal } from "@/utils/cashflow/flowReal"
import { compararFluxos } from "@/utils/cashflow/flowComparisons"
import { realocarFluxo } from "@/utils/cashflow/flowBudget"

const anoAtual = new Date().getFullYear()

class CashflowService {
  // Serviço de criação de fluxos de caixa
  async createFlow(
    userId: number,
    validMonths: [string, { receitaOrcada: number; despesaOrcada: number } ][],
    anoAtual: number,
  ) {
    const flowData = validMonths.map(
      ([mes, { receitaOrcada, despesaOrcada }]) => ({
        userId,
        mes: Number(mes),
        ano: anoAtual,
        receitaOrcada,
        despesaOrcada,
        saldoOrcado: 0,
        status: "neutro",
      })
    )

    await prisma.orcamento.createMany({ data: flowData })
  }

  // Serviço de obtenção de fluxo de caixa do usuário
  async getFlow(userId: number) {
    const cacheKey = `userFlow:${userId}:${anoAtual}`

    // Verifica se os fluxos estão no cache
    const cachedFlows = await redis.get(cacheKey)
    if (cachedFlows) {
      console.log(`[SUCESSO] Fluxos recuperados do cache para o usuário ${userId}`)
      return JSON.parse(cachedFlows)
    }

    // Busca no banco de dados se não estiver no cache
    const flows = await prisma.orcamento.findMany({
      where: { userId },
    })

    // Atualiza os fluxos (daria para otimizar com algum sistema de gerenciamento de filas)
    await atualizarFluxoReal(userId)
    await compararFluxos(userId)
    await realocarFluxo(userId)

    // Busca fluxos atualizados
    const updatedFlows = await prisma.orcamento.findMany({
      where: { userId },
    })

    // Adiciona nome do mês aos fluxos
    const flowsWithMonthNames = updatedFlows.map(flow => ({
      ...flow,
      nome: monthNames[flow.mes - 1], // Meses são 0 indexados
    }))

    // Armazena no Redis
    await redis.set(cacheKey, JSON.stringify(flowsWithMonthNames), "EX", 60 * 60 * 24) // 24 horas de cache
    console.log(`[SUCESSO] Fluxos armazenados no cache para o usuário ${userId}`)

    return flowsWithMonthNames
  }

  // Serviço de atualização de fluxo de caixa
  async updateFlow(userId: number, flow: Record<string, { receitaOrcada: number; despesaOrcada: number }>) {
    await prisma.$transaction(
      Object.entries(flow).map(([mes, { receitaOrcada, despesaOrcada }]) =>
        prisma.orcamento.update({
          where: {
            userId_mes_ano: {
              userId,
              mes: Number(mes),
              ano: anoAtual,
            },
          },
          data: {
            receitaOrcada,
            despesaOrcada,
          },
        })
      )
    )

    // Invalida o cache do usuário
    const cacheKey = `userFlow:${userId}:${anoAtual}`
    await redis.del(cacheKey)
    console.log(`[SUCESSO] Cache invalidado para a chave: ${cacheKey}`)
  }

  // Verifica se já existe um fluxo criado para o user
  async checkExistingFlow(userId: number, ano: number) {
    return await prisma.orcamento.findFirst({
      where: {
        userId,
        ano,
      },
    })
  }
}

export default new CashflowService()
