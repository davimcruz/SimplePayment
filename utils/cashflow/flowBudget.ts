import prisma from "@/lib/prisma"
import { BigNumber } from 'bignumber.js'
import NodeCache from 'node-cache'
import { Prisma } from '@prisma/client'
const cache = new NodeCache({ stdTTL: 300 }) // 5 minutos de cache

interface FluxoMes {
  userId: number
  mes: number
  ano: number
  receitaOrcada: number | null
  despesaOrcada: number | null
  saldoOrcado: number | null
}

export async function realocarFluxo(userId: number) {
  const anoAtual = new Date().getFullYear()
  const cacheKey = `reallocation:${userId}:${anoAtual}`
  
  try {
    // Verifica cache do redis
    const cachedResult = cache.get<FluxoMes[]>(cacheKey)
    if (cachedResult) {
      console.log('Retornando resultado do cache', { userId })
      return cachedResult
    }

    // Buscar fluxos em lotes
    const fluxos = await prisma.orcamento.findMany({
      where: {
        userId,
        ano: anoAtual,
      },
      orderBy: { mes: "asc" },
      select: {
        userId: true,
        mes: true,
        ano: true,
        receitaOrcada: true,
        despesaOrcada: true,
        saldoOrcado: true,
      }
    })

    if (fluxos.length === 0) {
      throw new Error("Nenhum fluxo de caixa encontrado para o usuário.")
    }

    // Processa em lotes de 100 (é tipo paginação, mas eu achei por batchs mais rápido)
    const BATCH_SIZE = 100
    let saldoAnterior = new BigNumber(0)
    const fluxoRealocado: FluxoMes[] = []

    for (let i = 0; i < fluxos.length; i += BATCH_SIZE) {
      const batch = fluxos.slice(i, i + BATCH_SIZE)
      
      batch.forEach((mes) => {
        const receitaOrcada = new BigNumber(mes.receitaOrcada ?? 0)
        const despesaOrcada = new BigNumber(mes.despesaOrcada ?? 0)
        
        const novoSaldoOrcado = saldoAnterior
          .plus(receitaOrcada)
          .minus(despesaOrcada)
        
        fluxoRealocado.push({
          ...mes,
          saldoOrcado: novoSaldoOrcado.toNumber()
        })
        
        saldoAnterior = novoSaldoOrcado
      })
    }

    // Atualiza em transação com retry
    await retry(async () => {
      await prisma.$transaction(
        fluxoRealocado.map((mes) =>
          prisma.orcamento.update({
            where: {
              userId_mes_ano: {
                userId: mes.userId,
                mes: mes.mes,
                ano: mes.ano,
              },
            },
            data: {
              saldoOrcado: mes.saldoOrcado,
            },
          })
        ),
        {
          isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted // Nível de isolamento explícito
        }
      )
    }, {
      retries: 3,
      minTimeout: 1000,
      maxTimeout: 5000
    })

    // Armazena no cache
    cache.set(cacheKey, fluxoRealocado)
    
    console.log('Realocação concluída com sucesso', {
      userId,
      totalMeses: fluxoRealocado.length
    })

    return fluxoRealocado
  } catch (error) {
    console.error('Erro na realocação de fluxo:', error)
    throw new Error("Falha ao atualizar os fluxos de caixa.")
  }
}

// Função auxiliar para retry
async function retry<T>(
  fn: () => Promise<T>,
  options: {
    retries: number
    minTimeout: number
    maxTimeout: number
  }
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= options.retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === options.retries) break
      
      const timeout = Math.min(
        Math.round(
          Math.random() * (options.maxTimeout - options.minTimeout) + 
          options.minTimeout
        ),
        options.maxTimeout
      )
      
      await new Promise(resolve => setTimeout(resolve, timeout))
    }
  }
  
  throw lastError!
}
