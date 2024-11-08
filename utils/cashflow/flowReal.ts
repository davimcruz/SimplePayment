import prisma from "@/lib/prisma"
import { BigNumber } from 'bignumber.js'
import { sharedMemoryCache } from '@/lib/cache/sharedCache'
import { Prisma } from '@prisma/client'

interface FlowReal {
  userId: number
  mes: number
  ano: number
  receitaRealizada: number
  despesaRealizada: number
  saldoRealizado: number
}

export async function atualizarFluxoReal(userId: number) {
  const anoAtual = new Date().getFullYear()
  const cacheKey = `local_cashFlow:${userId}:${anoAtual}`

  // Usar o cache compartilhado
  const cachedData = sharedMemoryCache.get(cacheKey)
  if (cachedData) {
    return cachedData
  }

  // Busca as transações em uma única query otimizada
  const transacoes = await prisma.transacoes.findMany({
    where: {
      userId,
      AND: [
        { data: { not: null } },
        { data: { endsWith: `-${anoAtual}` } }
      ]
    },
    select: {
      tipo: true,
      valor: true,
      data: true,
    }
  })

  // Inicializa mapa de totais por mês
  const totaisPorMes = new Map<number, { 
    receita: BigNumber
    despesa: BigNumber 
  }>()

  // Processa transações
  for (const transacao of transacoes) {
    // Valida o formato da data (dd-mm-yyyy)
    if (!transacao.data?.match(/^\d{2}-\d{2}-\d{4}$/)) {
      console.warn('Formato de data inválido:', transacao.data)
      continue // Pula transações com formato inválido
    }

    const [dia, mes, ano] = transacao.data.split("-").map(Number)
    
    // Validação adicional dos valores
    if (isNaN(mes) || mes < 1 || mes > 12 || ano !== anoAtual) {
      console.warn('Data inválida:', { dia, mes, ano })
      continue
    }
    
    if (!totaisPorMes.has(mes)) {
      totaisPorMes.set(mes, { 
        receita: new BigNumber(0), 
        despesa: new BigNumber(0) 
      })
    }

    const totais = totaisPorMes.get(mes)!
    const valor = new BigNumber(transacao.valor)

    if (transacao.tipo === "receita") {
      totais.receita = totais.receita.plus(valor)
    } else if (transacao.tipo === "despesa") {
      totais.despesa = totais.despesa.plus(valor)
    }
  }

  // Busca meses existentes no orçamento
  const mesesExistentes = await prisma.orcamento.findMany({
    where: {
      userId,
      ano: anoAtual,
    },
    select: {
      mes: true,
    },
    orderBy: {
      mes: "asc",
    },
  })

  // Prepara atualizações
  let saldoAnterior = new BigNumber(0)
  const atualizacoes: FlowReal[] = []

  for (const { mes } of mesesExistentes) {
    const totais = totaisPorMes.get(mes) || { 
      receita: new BigNumber(0), 
      despesa: new BigNumber(0) 
    }

    const saldoMesAtual = totais.receita.minus(totais.despesa)
    const saldoRealizado = saldoAnterior.plus(saldoMesAtual)

    atualizacoes.push({
      userId,
      mes,
      ano: anoAtual,
      receitaRealizada: totais.receita.toNumber(),
      despesaRealizada: totais.despesa.toNumber(),
      saldoRealizado: saldoRealizado.toNumber()
    })

    saldoAnterior = saldoRealizado
  }

  // Atualiza em transação
  await prisma.$transaction(
    atualizacoes.map((atualizacao) =>
      prisma.orcamento.update({
        where: {
          userId_mes_ano: {
            userId: atualizacao.userId,
            mes: atualizacao.mes,
            ano: atualizacao.ano,
          },
        },
        data: {
          receitaRealizada: atualizacao.receitaRealizada,
          despesaRealizada: atualizacao.despesaRealizada,
          saldoRealizado: atualizacao.saldoRealizado,
        },
      })
    ),
    {
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted
    }
  )

  // Armazenar no cache compartilhado
  sharedMemoryCache.set(cacheKey, atualizacoes)

  return atualizacoes
}
