import prisma from "@/lib/prisma"
import { DespesaFixaInput } from "@/lib/validation"
import { atualizarFluxoReal } from "@/utils/cashflow/flowReal"

class CostsService {
  async criar(userId: number, dados: DespesaFixaInput) {
    const valorCorrigido = Number((dados.valor / 10).toFixed(2))
    
    if (dados.formaPagamento === 'credito' && dados.cardId) {
      const cartao = await prisma.cartoes.findFirst({
        where: { 
          cardId: dados.cardId,
          userId 
        }
      })
      if (!cartao) {
        throw new Error("[ERRO] Cartão não encontrado ou não pertence ao usuário")
      }
    }

    const { cardId, ...dadosSemCard } = dados
    const despesaFixa = await prisma.costs.create({
      data: {
        userId,
        ...dadosSemCard,
        valor: valorCorrigido,
        cardId: dados.formaPagamento === 'credito' ? dados.cardId : null
      },
    })

    await this.gerarTransacoesFuturas(despesaFixa)
    await atualizarFluxoReal(userId)

    return despesaFixa
  }

  private async gerarTransacoesFuturas(despesaFixa: any) {
    const dataInicio = new Date(despesaFixa.dataInicio)
    const dataFim = despesaFixa.dataFim ? new Date(despesaFixa.dataFim) : null
    const anoAtual = new Date().getFullYear()
    const fimAno = new Date(anoAtual, 11, 31)

    let dataAtual = dataInicio
    const transacoes = []

    while (dataAtual <= (dataFim || fimAno)) {
      const mes = dataAtual.getMonth() + 1
      const ano = dataAtual.getFullYear()
      const diaVencimento = new Date(ano, mes - 1, despesaFixa.diaVencimento)

      const transacao = {
        userId: despesaFixa.userId,
        nome: despesaFixa.nome,
        tipo: "despesa",
        fonte: despesaFixa.formaPagamento,
        detalhesFonte: despesaFixa.categoria,
        data: `${despesaFixa.diaVencimento.toString().padStart(2, "0")}-${mes.toString().padStart(2, "0")}-${ano}`,
        valor: despesaFixa.valor,
        costId: despesaFixa.id,
        cardId: despesaFixa.formaPagamento === 'credito' ? despesaFixa.cardId : null,
      }

      transacoes.push(transacao)

      if (despesaFixa.formaPagamento === 'credito' && despesaFixa.cardId) {
        const fatura = await prisma.faturas.upsert({
          where: {
            cardId_mes_ano: {
              cardId: despesaFixa.cardId,
              mes: mes,
              ano: ano
            }
          },
          create: {
            cardId: despesaFixa.cardId,
            mes: mes,
            ano: ano,
            valorTotal: despesaFixa.valor,
            vencimento: diaVencimento,
            pago: false
          },
          update: {
            valorTotal: {
              increment: despesaFixa.valor
            }
          }
        })

        const transacaoCriada = await prisma.transacoes.create({
          data: transacao
        })

        await prisma.parcelas.create({
          data: {
            transacaoId: transacaoCriada.transactionId,
            cardId: despesaFixa.cardId,
            faturaId: fatura.faturaId,
            valorParcela: despesaFixa.valor,
            mes: mes,
            ano: ano,
            pago: false
          }
        })
      } else {
        await prisma.transacoes.create({
          data: transacao
        })
      }

      dataAtual.setMonth(dataAtual.getMonth() + 1)
    }
  }

  async listar(userId: number) {
    return prisma.costs.findMany({
      where: {
        userId,
        status: "ativa",
      },
      include: {
        cartao: true
      },
      orderBy: { dataCriacao: "desc" },
    })
  }

  async atualizar(id: string, dados: Partial<DespesaFixaInput>) {
    const dadosAtualizados = {
      ...dados,
      valor: dados.valor ? Number((dados.valor / 10).toFixed(2)) : undefined
    }

    if (dados.formaPagamento === 'credito' && dados.cardId) {
      const cost = await prisma.costs.findUnique({
        where: { id },
        select: { userId: true }
      })
      
      const cartao = await prisma.cartoes.findFirst({
        where: { 
          cardId: dados.cardId,
          userId: cost?.userId 
        }
      })
      
      if (!cartao) {
        throw new Error("[ERRO] Cartão não encontrado ou não pertence ao usuário")
      }
    }

    const { cardId, ...dadosSemCard } = dadosAtualizados
    const despesaFixa = await prisma.costs.update({
      where: { id },
      data: {
        ...dadosSemCard,
        cardId: dados.formaPagamento === 'credito' ? dados.cardId : null
      },
    })

    await this.gerarTransacoesFuturas(despesaFixa)
    return despesaFixa
  }

  async cancelar(id: string) {
    const despesa = await prisma.costs.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!despesa) {
      throw new Error("[ERRO] Despesa fixa não encontrada")
    }

    const result = await prisma.costs.update({
      where: { id },
      data: {
        status: "cancelada",
        dataFim: new Date(),
      },
    })

    await atualizarFluxoReal(despesa.userId)

    return result
  }

  async excluir(id: string) {
    const despesa = await prisma.costs.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        diaVencimento: true,
        formaPagamento: true,
        cardId: true,
        valor: true
      }
    })

    if (!despesa) {
      throw new Error("[ERRO] Despesa fixa não encontrada")
    }

    const hoje = new Date()
    const diaAtual = hoje.getDate()
    const mesAtual = hoje.getMonth() + 1
    const anoAtual = hoje.getFullYear()

    const excluirDesdeEsteMes = diaAtual < despesa.diaVencimento

    await prisma.$transaction(async (tx) => {
      if (despesa.formaPagamento === 'credito' && despesa.cardId) {
        const parcelas = await tx.parcelas.findMany({
          where: {
            transacao: {
              costId: despesa.id
            },
            OR: [
              {
                AND: [
                  { ano: anoAtual },
                  excluirDesdeEsteMes 
                    ? { mes: { gte: mesAtual } }
                    : { mes: { gt: mesAtual } }
                ]
              },
              { ano: { gt: anoAtual } }
            ]
          },
          include: {
            faturas: true
          }
        })

        for (const parcela of parcelas) {
          if (parcela.faturas) {
            await tx.faturas.update({
              where: { faturaId: parcela.faturas.faturaId },
              data: {
                valorTotal: {
                  decrement: parcela.valorParcela
                }
              }
            })
          }
        }

        await tx.parcelas.deleteMany({
          where: {
            transacao: {
              costId: despesa.id
            },
            OR: [
              {
                AND: [
                  { ano: anoAtual },
                  excluirDesdeEsteMes 
                    ? { mes: { gte: mesAtual } }
                    : { mes: { gt: mesAtual } }
                ]
              },
              { ano: { gt: anoAtual } }
            ]
          }
        })
      }

      const dataBase = excluirDesdeEsteMes
        ? `${despesa.diaVencimento.toString().padStart(2, "0")}-${mesAtual.toString().padStart(2, "0")}-${anoAtual}`
        : `${despesa.diaVencimento.toString().padStart(2, "0")}-${(mesAtual + 1).toString().padStart(2, "0")}-${anoAtual}`

      await tx.transacoes.deleteMany({
        where: {
          costId: despesa.id,
          OR: [
            {
              data: {
                gte: dataBase
              }
            },
            {
              AND: [
                { data: { contains: `-${anoAtual}` } },
                { data: { gt: dataBase } }
              ]
            },
            {
              data: {
                contains: `-${anoAtual + 1}`
              }
            }
          ]
        }
      })

      await tx.costs.update({
        where: { id: despesa.id },
        data: {
          status: "cancelada",
          dataFim: excluirDesdeEsteMes
            ? new Date(anoAtual, mesAtual - 1, despesa.diaVencimento)
            : new Date(anoAtual, mesAtual, despesa.diaVencimento)
        }
      })
    })

    await atualizarFluxoReal(despesa.userId)

    return { message: "Despesa fixa excluída com sucesso" }
  }
}

export default new CostsService()
