import prisma from "@/lib/prisma"

export async function realocarFluxo(userId: number) {
  const anoAtual = new Date().getFullYear()
  
  const fluxos = await prisma.orcamento.findMany({
    where: {
      userId,
      ano: anoAtual,
    },
    orderBy: { mes: "asc" },
  })

  console.log('=== INÍCIO REALOCAÇÃO DE FLUXO ===')
  console.log('Fluxos encontrados:', fluxos)

  if (fluxos.length === 0) {
    throw new Error("Nenhum fluxo de caixa encontrado para o usuário.")
  }

  let saldoAnterior = 0

  const fluxoRealocado = fluxos.map((mes) => {
    const receitaOrcada = mes.receitaOrcada ?? 0
    const despesaOrcada = mes.despesaOrcada ?? 0
    
    console.log(`\nCálculo para o mês ${mes.mes}:`)
    console.log(`Saldo Anterior: ${saldoAnterior}`)
    console.log(`Receita Orçada: ${receitaOrcada}`)
    console.log(`Despesa Orçada: ${despesaOrcada}`)
    
    const novoSaldoOrcado = saldoAnterior + (receitaOrcada - despesaOrcada)
    console.log(`Novo Saldo Orçado: ${novoSaldoOrcado}`)
    
    saldoAnterior = novoSaldoOrcado

    return {
      ...mes,
      saldoOrcado: novoSaldoOrcado,
    }
  })

  try {
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
      )
    )
    console.log('Transação concluída com sucesso')
  } catch (error) {
    console.error('Erro na transação:', error)
    throw new Error("Falha ao atualizar os fluxos de caixa.")
  }

  return fluxoRealocado
}
