import prisma from "@/lib/prisma"

export async function compararFluxos(userId: number) {
  const anoAtual = new Date().getFullYear()
  const mesAtual = new Date().getMonth() + 1

  // Busca os orçamentos do usuário para o ano atual
  const orcamentos = await prisma.orcamento.findMany({
    where: {
      userId,
      ano: anoAtual,
    },
    orderBy: {
      mes: 'asc',
    },
  })

  if (orcamentos.length === 0) {
    throw new Error("Nenhum orçamento encontrado para o usuário.")
  }

  let saldoOrcadoAnterior = 0
  let saldoRealizadoAnterior = 0

  const atualizacoes = orcamentos.map((orcamento) => {
    const receitaRealizada = orcamento.receitaRealizada || 0
    const despesaRealizada = orcamento.despesaRealizada || 0

    // Cálculo do saldo realizado para o mês atual
    const saldoRealizado = saldoRealizadoAnterior + (receitaRealizada - despesaRealizada)

    const receitaOrcada = orcamento.receitaOrcada || 0
    const despesaOrcada = orcamento.despesaOrcada || 0

    // Cálculo do saldo orçado para o mês atual
    const saldoOrcado = saldoOrcadoAnterior + (receitaOrcada - despesaOrcada)

    // Cálculo da diferença em dinheiro e porcentagem
    const gapMoney = saldoRealizado - saldoOrcado
    const gapPercentage = saldoOrcado !== 0 ? (gapMoney / Math.abs(saldoOrcado)) : 0 
    // Não precisa mutiplicar por 100, o front já faz isso

    // Determinação do status com base no gapMoney
    let status: 'deficit' | 'excedente' | 'neutro'
    if (gapMoney > 0) {
      status = 'excedente'
    } else if (gapMoney < 0) {
      status = 'deficit'
    } else {
      status = 'neutro'
    }

    // Atualiza os saldos anteriores para o próximo mês
    saldoOrcadoAnterior = saldoOrcado
    saldoRealizadoAnterior = saldoRealizado

    // Retorna a atualização do orçamento
    return prisma.orcamento.update({
      where: {
        userId_mes_ano: {
          userId: orcamento.userId,
          mes: orcamento.mes,
          ano: orcamento.ano,
        },
      },
      data: {
        saldoRealizado,
        saldoOrcado,
        gapMoney,
        gapPercentage,
        status,
      },
    })
  })

  // Executa as atualizações em uma transação
  try {
    await prisma.$transaction(atualizacoes)
  } catch (error) {
    console.error("Erro ao atualizar os orçamentos:", error)
    throw new Error("Falha ao atualizar os fluxos de caixa. Tente novamente mais tarde.")
  }

  // Busca os fluxos atualizados para o usuário
  const fluxoAtualizado = await prisma.orcamento.findMany({
    where: {
      userId,
      ano: anoAtual,
      mes: { gte: mesAtual },
    },
    orderBy: { mes: 'asc' },
  })

  return fluxoAtualizado
}
