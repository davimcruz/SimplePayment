import { NextApiRequest, NextApiResponse } from "next"

import { verifyToken } from "../middleware/jwt-auth"

import prisma from "@/lib/prisma"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const tokenValid = await verifyToken({ req } as any)
  if (!tokenValid) {
    return res.status(401).json({ message: "Não autorizado" })
  }

  try {
    const incomes = await prisma.transacoes.findMany({
      where: {
        tipo: "receita",
      },
    })

    res.status(200).json(incomes)
  } catch (error) {
    console.error("Erro ao buscar receitas:", error)
    res.status(500).json({ error: "Erro ao buscar receitas." })
  } finally {
    await prisma.$disconnect()
  }
}
