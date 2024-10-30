import prisma from "@/lib/prisma"

export async function realocarFluxo(userId: number) {
  const anoAtual = new Date().getFullYear()
  const mesAtual = new Date().getMonth() + 1 

  // Busca os fluxos de caixa do usuário para o ano atual e meses futuros
  const fluxoAtual = await prisma.orcamento.findMany({
    where: {
      userId,
      ano: anoAtual,
      mes: { gte: mesAtual },
    },
    orderBy: { mes: "asc" },
  })


  if (fluxoAtual.length === 0) {
    throw new Error("Nenhum fluxo de caixa encontrado para o usuário.")
  }

  let saldoAnterior = 0

  // Mapeia os fluxos para calcular o novo saldo orçado
  const fluxoRealocado = fluxoAtual.map((mes) => {
    const receitaOrcada = mes.receitaOrcada ?? 0
    const despesaOrcada = mes.despesaOrcada ?? 0

    // Calcula o novo saldo orçado
    const novoSaldoOrcado = saldoAnterior + (receitaOrcada - despesaOrcada)
    saldoAnterior = Number(novoSaldoOrcado.toFixed(2)) // Atualiza o saldo anterior

    return {
      ...mes,
      saldoOrcado: saldoAnterior,
    }
  })

  // Atualiza os fluxos no banco de dados em uma transação
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
            status: mes.status, 
          },
        })
      )
    )
  } catch (error) {
    throw new Error("Falha ao atualizar os fluxos de caixa. Tente novamente mais tarde.")
  }

  return fluxoRealocado
}
