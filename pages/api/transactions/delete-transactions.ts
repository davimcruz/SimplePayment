import { NextApiRequest, NextApiResponse } from "next"
import { verifyTokenFromRequest } from "@/pages/api/middleware/jwt-auth"
import prisma from "@/lib/prisma"
import { invalidateSummaryCache } from "@/lib/invalidateSummaryCache"
import { atualizarFluxoReal } from "@/utils/cashflow/flowReal"
import { compararFluxos } from "@/utils/cashflow/flowComparisons"
import redis from "@/lib/redis"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const anoAtual = new Date().getFullYear()

  console.log("Recebendo requisição:", req.method, req.body)

    const tokenValid = verifyTokenFromRequest(req as any)
  if (!tokenValid) {
    return res.status(401).json({ error: "Não autorizado" })
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" })
  }

  const { transactionId } = req.body

  if (!transactionId || typeof transactionId !== "string") {
    return res.status(400).json({ error: "Transaction ID inválido" })
  }

  console.log("Transaction ID recebido:", transactionId)

  try {
    const currentTransaction = await prisma.transacoes.findUnique({
      where: { transactionId },
    })

    if (!currentTransaction) {
      return res.status(404).json({ error: "Transação não encontrada" })
    }

    const userId = currentTransaction.userId

    const parcelas = await prisma.parcelas.findMany({
      where: { transacaoId: transactionId },
    })

    const faturasToCheck = new Set(parcelas.map((parcela) => parcela.faturaId))

    await prisma.parcelas.deleteMany({
      where: { transacaoId: transactionId },
    })

    console.log("Parcelas deletadas para a transação:", transactionId)

    for (const faturaId of faturasToCheck) {
      if (!faturaId) continue

      const outrasParcelas = await prisma.parcelas.findMany({
        where: { faturaId },
      })

      if (outrasParcelas.length === 0) {
        await prisma.faturas.delete({
          where: { faturaId },
        })
        console.log("Fatura excluída:", faturaId)
      } else {
        const novoValorTotal = outrasParcelas.reduce(
          (total, parcela) => total + parcela.valorParcela,
          0
        )
        await prisma.faturas.update({
          where: { faturaId },
          data: { valorTotal: novoValorTotal },
        })
        console.log("Fatura atualizada:", faturaId)
      }
    }

    await prisma.transacoes.delete({
      where: { transactionId },
    })

    console.log("Transação deletada com sucesso:", transactionId)

    const invalidateCaches = async () => {
      const cacheKeyUserFlow = `userFlow:${userId}:${anoAtual}`
      const cacheKeyTransactions = `transactions:user:${userId}`

      await Promise.all([
        redis.del(cacheKeyUserFlow),
        redis.del(cacheKeyTransactions),
        invalidateSummaryCache(userId),
        atualizarFluxoReal(userId).then(() => compararFluxos(userId)),
      ])
      console.log(
        "Caches invalidados, fluxo real atualizado e comparações feitas para o usuário:",
        userId
      )
    }

    invalidateCaches().catch((err) =>
      console.error(
        "Erro ao invalidar caches, atualizar fluxo real e fazer comparações:",
        err
      )
    )

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar a transação:", error)
    return res.status(500).json({ error: "Erro ao processar a requisição" })
  }
}
