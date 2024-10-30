import prisma from "@/lib/prisma"

export async function atualizarFluxoReal(userId: number) {
  const anoAtual = new Date().getFullYear()
  const mesAtual = new Date().getMonth() + 1

  // Busca as transações do usuário para o ano atual
  const transacoes = await prisma.transacoes.findMany({
    where: {
      userId,
      data: {
        endsWith: `-${anoAtual}`,
      },
    },
    select: {
      tipo: true,
      valor: true,
      data: true,
    },
  })

  // Totaliza receitas e despesas por mês
  const totaisPorMes: { [key: number]: { receita: number; despesa: number } } = {}

  transacoes.forEach((transacao) => {
    if (transacao.data === null) return
    const [dia, mes, ano] = transacao.data.split("-").map(Number)
    if (ano !== anoAtual) return

    // Inicializa o objeto para o mês se não existir (visto que nem todos os meses são preenchidos)
    if (!totaisPorMes[mes]) {
      totaisPorMes[mes] = { receita: 0, despesa: 0 }
    }

    // Acumula receitas e despesas
    if (transacao.tipo === "receita") {
      totaisPorMes[mes].receita += transacao.valor
    } else if (transacao.tipo === "despesa") {
      totaisPorMes[mes].despesa += transacao.valor
    }
  })

  let saldoAnterior = 0
  const atualizacoes = []

  // Busca os meses existentes no orçamento
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

  // Atualiza os saldos realizados para cada mês
  for (const { mes } of mesesExistentes) {
    const { receita = 0, despesa = 0 } = totaisPorMes[mes] || {}
    const saldoMesAtual = receita - despesa
    const saldoRealizado = saldoAnterior + saldoMesAtual

    atualizacoes.push(
      prisma.orcamento.update({
        where: {
          userId_mes_ano: {
            userId,
            mes,
            ano: anoAtual,
          },
        },
        data: {
          receitaRealizada: receita,
          despesaRealizada: despesa,
          saldoRealizado,
        },
      })
    )

    saldoAnterior = saldoRealizado // Atualiza o saldo anterior para o próximo mês 
  }

  // Executa as atualizações em uma transação
  try {
    await prisma.$transaction(atualizacoes)
  } catch (error) {
    console.error("Erro ao atualizar os saldos:", error)
    throw new Error("Falha ao atualizar os fluxos de caixa.")
  }

  // Busca os fluxos atualizados
  const fluxoAtualizado = await prisma.orcamento.findMany({
    where: {
      userId,
      ano: anoAtual,
      mes: { gte: mesAtual },
    },
    orderBy: { mes: "asc" },
  })

  return fluxoAtualizado
}
