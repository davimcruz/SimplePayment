import { NextApiRequest, NextApiResponse } from "next"
import { transacoes } from "@prisma/client"
import { verifyTokenFromRequest } from "@/pages/api/middleware/jwt-auth"
import { parseCookies } from "nookies"
import prisma from "@/lib/prisma"
import redis from "@/lib/redis"

export async function getTransactions(userId: number): Promise<transacoes[]> {
  const cacheKey = `transactions:user:${userId}`

  const cachedTransactions = await redis.get(cacheKey)
  if (cachedTransactions) {
    return JSON.parse(cachedTransactions)
  }

  const transactions = await prisma.transacoes.findMany({
    where: {
      userId: userId,
    },
  })

  await redis.set(cacheKey, JSON.stringify(transactions), "EX", 60 * 60)

  return transactions
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    const tokenValid = verifyTokenFromRequest(req as any)
    if (!tokenValid) {
      res.status(401).json({ error: "Não autorizado" })
      return
    }

    const cookies = parseCookies({ req })
    const userId = Number(cookies.userId)

    if (!userId || isNaN(userId)) {
      throw new Error("ID de usuário inválido ou não encontrado nos cookies.")
    }

    const transactions = await getTransactions(userId)
    res.status(200).json(transactions)
  } catch (error) {
    console.error("Erro ao buscar transações:", error)
    res.status(500).json({ error: "Erro ao buscar transações" })
  } finally {
    if (process.env.NODE_ENV === "development") {
      await prisma.$disconnect()
    }
  }
}
