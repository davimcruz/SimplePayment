import prisma from "@/lib/prisma"
import redis from "@/lib/cache/redis"

class BillService {
  // Serviço de criação de faturas
  async deleteBill(faturaId: string) {
    return await prisma.$transaction(async (prisma) => {
      const parcelas = await prisma.parcelas.findMany({
        where: { faturaId },
        select: { transacaoId: true, parcelaId: true },
      })

      // Obtenção do ID da transação (feito para deletar a respectiva transação vinculada à fatura)
      const transacaoIds = parcelas.map((parcela) => parcela.transacaoId)

      // Deletar parcelas
      await prisma.parcelas.deleteMany({
        where: { faturaId },
      })

      // Deletar transação (vinculada à fatura)
      await prisma.transacoes.deleteMany({
        where: { transactionId: { in: transacaoIds } },
      })

      // Deletar fatura
      await prisma.faturas.delete({
        where: { faturaId },
      })
    })
  }

  // Serviço de obtenção de faturas
  async getBill(cardId: string) {
    return await prisma.faturas.findMany({
      where: {
        cardId: cardId,
        pago: false,
      },
      // Incluir a obtenção de parcelas juntamente com a fatura (futuramente util para eliminar o get-parcels)
      include: {
        parcelas: true,
      },
      orderBy: [{ ano: "asc" }, { vencimento: "asc" }],
    })
  }

  // Serviço de obtenção de parcelas (estritamente ligado as faturas)
  async getParcels(faturaId: string) {
    return await prisma.parcelas.findMany({
      where: { faturaId },
      select: {
        parcelaId: true,
        valorParcela: true,
        mes: true,
        ano: true,
        // Obter também dados da transação daquela parcela
        transacao: {
          select: {
            nome: true,
            tipo: true,
            fonte: true,
          },
        },
      },
    })
  }

  // Serviço de pagamento de faturas
  async payBill(faturaId: string) {
    const fatura = await prisma.faturas.findUnique({
      where: { faturaId },
    })

    if (!fatura) {
      throw new Error("[ERRO] Fatura não encontrada.")
    }

    const transacoesAssociadas = await prisma.transacoes.findMany({
      where: {
        parcelas: {
          some: {
            faturaId,
          },
        },
      },
      include: {
        parcelas: true,
      },
    })

    if (!transacoesAssociadas || transacoesAssociadas.length === 0) {
      throw new Error("[ERRO] Nenhuma transação associada à fatura.")
    }

    // Obter transação associada ao userId encontrado
    const userId = transacoesAssociadas[0].userId

    await prisma.$transaction([
      prisma.faturas.update({
        where: { faturaId },
        // Definir no banco booleano como true (1)
        data: { pago: true },
      }),
      prisma.parcelas.updateMany({
        where: { faturaId },
        // Definir no banco booleano como true (1)
        data: { pago: true },
      }),
    ])

    // Invalidação do cache do Redis para transactions
    const cacheKey = `transactions:user:${userId}`
    await redis.del(cacheKey)

    return userId
  }
}

export default new BillService()
