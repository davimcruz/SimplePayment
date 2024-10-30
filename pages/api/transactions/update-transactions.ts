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

    const tokenValid = verifyTokenFromRequest(req as any)
  if (!tokenValid) {
    return res.status(401).json({ error: "Não autorizado" })
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" })
  }

  const { transactionId, ...updateFields } = req.body

  if (!transactionId) {
    return res.status(400).json({ error: "transactionId é obrigatório" })
  }

  try {
    const currentTransaction = await prisma.transacoes.findUnique({
      where: { transactionId },
      include: {
        parcelas: true,
      },
    })

    if (!currentTransaction) {
      return res.status(404).json({ error: "Transação não encontrada" })
    }

    const updates: any = {}

    if ("nome" in updateFields) {
      updates.nome = updateFields.nome
    }
    if ("tipo" in updateFields) {
      updates.tipo = updateFields.tipo
    }
    if ("fonte" in updateFields) {
      updates.fonte = updateFields.fonte
    }
    if ("detalhesFonte" in updateFields) {
      updates.detalhesFonte = updateFields.detalhesFonte || null
    }
    if ("data" in updateFields) {
      updates.data = updateFields.data
    }
    if ("valor" in updateFields) {
      const valorFloat =
        typeof updateFields.valor === "number"
          ? updateFields.valor
          : parseFloat(updateFields.valor)
      updates.valor = valorFloat

      if (currentTransaction.parcelas.length > 0) {
        const valorParcelaNovo = valorFloat / currentTransaction.parcelas.length

        await prisma.parcelas.updateMany({
          where: { transacaoId: transactionId },
          data: {
            valorParcela: valorParcelaNovo,
          },
        })

        const faturaIds = [
          ...new Set(
            currentTransaction.parcelas
              .map((parcela) => parcela.faturaId)
              .filter((id): id is string => id !== null)
          ),
        ]

        for (const faturaId of faturaIds) {
          const totalParcelas = await prisma.parcelas.aggregate({
            where: { faturaId },
            _sum: {
              valorParcela: true,
            },
          })

          await prisma.faturas.update({
            where: { faturaId },
            data: { valorTotal: totalParcelas._sum.valorParcela || 0 },
          })
        }
      }
    }
    if ("cardId" in updateFields) {
      const cartao = await prisma.cartoes.findUnique({
        where: { cardId: updateFields.cardId },
      })
      if (!cartao) {
        return res.status(400).json({ error: "Cartão não encontrado" })
      }
      updates.cardId = updateFields.cardId
    }

    if (Object.keys(updates).length === 0) {
      return res.status(200).json({ message: "Nenhuma alteração detectada" })
    }

    const updatedTransaction = await prisma.transacoes.update({
      where: { transactionId },
      data: updates,
    })

    const invalidateCaches = async () => {
      const cacheKeyUserFlow = `userFlow:${updatedTransaction.userId}:${anoAtual}`
      const cacheKeyTransactions = `transactions:user:${updatedTransaction.userId}`

      if (redis) {
        await Promise.all([
          redis.del(cacheKeyUserFlow),
          redis.del(cacheKeyTransactions),
          invalidateSummaryCache(updatedTransaction.userId),
          atualizarFluxoReal(updatedTransaction.userId).then(() =>
            compararFluxos(updatedTransaction.userId)
          ),
        ])
      } else {
        await Promise.all([
          invalidateSummaryCache(updatedTransaction.userId),
          atualizarFluxoReal(updatedTransaction.userId).then(() =>
            compararFluxos(updatedTransaction.userId)
          ),
        ])
      }
    }

    invalidateCaches().catch((err) =>
      console.error(
        "Erro ao invalidar caches, atualizar fluxo real e fazer comparações:",
        err
      )
    )

    res.status(200).json({ success: true })
  } catch (error) {
    console.error("Erro ao processar a requisição:", error)
    return res.status(500).json({ error: "Erro ao processar a requisição" })
  }
}
