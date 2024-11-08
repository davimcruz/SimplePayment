import prisma from "@/lib/prisma"
import { BigNumber } from 'bignumber.js'
import { sharedMemoryCache } from '@/lib/cache/sharedCache'
import { Prisma } from '@prisma/client'

interface FlowComparison {
  userId: number
  mes: number
  ano: number
  saldoRealizado: number
  saldoOrcado: number
  gapMoney: number
  gapPercentage: number
  status: 'deficit' | 'excedente' | 'neutro'
}

export async function compararFluxos(userId: number) {
  const anoAtual = new Date().getFullYear()
  const cacheKey = `local_comparison:${userId}:${anoAtual}`

  // Usar o cache compartilhado
  const cachedData = sharedMemoryCache.get(cacheKey)
  if (cachedData) {
    return cachedData
  }

  // Busca os orçamentos em uma única query otimizada
  const orcamentos = await prisma.orcamento.findMany({
    where: {
      userId,
      ano: anoAtual,
    },
    orderBy: {
      mes: 'asc',
    },
    select: {
      userId: true,
      mes: true,
      ano: true,
      receitaOrcada: true,
      despesaOrcada: true,
      receitaRealizada: true,
      despesaRealizada: true,
    }
  })

  if (orcamentos.length === 0) {
    throw new Error("Nenhum orçamento encontrado para o usuário.")
  }

  // Processa em lotes para melhor performance
  const BATCH_SIZE = 100
  const comparisons: FlowComparison[] = []
  let saldoOrcadoAnterior = new BigNumber(0)
  let saldoRealizadoAnterior = new BigNumber(0)

  for (let i = 0; i < orcamentos.length; i += BATCH_SIZE) {
    const batch = orcamentos.slice(i, i + BATCH_SIZE)
    
    batch.forEach((orcamento) => {
      // Usa BigNumber para precisão em cálculos financeiros
      const receitaRealizada = new BigNumber(orcamento.receitaRealizada || 0)
      const despesaRealizada = new BigNumber(orcamento.despesaRealizada || 0)
      const receitaOrcada = new BigNumber(orcamento.receitaOrcada || 0)
      const despesaOrcada = new BigNumber(orcamento.despesaOrcada || 0)

      // Calcula saldos do mês
      const saldoRealizadoMes = receitaRealizada.minus(despesaRealizada)
      const saldoOrcadoMes = receitaOrcada.minus(despesaOrcada)

      // Acumula saldos
      const saldoRealizado = saldoRealizadoAnterior.plus(saldoRealizadoMes)
      const saldoOrcado = saldoOrcadoAnterior.plus(saldoOrcadoMes)

      // Calcula gaps
      const gapMoney = saldoRealizado.minus(saldoOrcado)
      const gapPercentage = saldoOrcado.isZero() 
        ? new BigNumber(0)
        : gapMoney.dividedBy(saldoOrcado.abs())

      // Determina status
      let status: 'deficit' | 'excedente' | 'neutro'
      if (gapMoney.isGreaterThan(0)) {
        status = 'excedente'
      } else if (gapMoney.isLessThan(0)) {
        status = 'deficit'
      } else {
        status = 'neutro'
      }

      comparisons.push({
        userId: orcamento.userId,
        mes: orcamento.mes,
        ano: orcamento.ano,
        saldoRealizado: saldoRealizado.toNumber(),
        saldoOrcado: saldoOrcado.toNumber(),
        gapMoney: gapMoney.toNumber(),
        gapPercentage: gapPercentage.toNumber(),
        status
      })

      // Atualiza saldos anteriores
      saldoRealizadoAnterior = saldoRealizado
      saldoOrcadoAnterior = saldoOrcado
    })
  }

  // Atualiza em transação
  await prisma.$transaction(
    comparisons.map((comparison) =>
      prisma.orcamento.update({
        where: {
          userId_mes_ano: {
            userId: comparison.userId,
            mes: comparison.mes,
            ano: comparison.ano,
          },
        },
        data: {
          saldoRealizado: comparison.saldoRealizado,
          saldoOrcado: comparison.saldoOrcado,
          gapMoney: comparison.gapMoney,
          gapPercentage: comparison.gapPercentage,
          status: comparison.status,
        },
      })
    ),
    {
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
    }
  )

  // Armazena no cache compartilhado
  sharedMemoryCache.set(cacheKey, comparisons)

  return comparisons
}
