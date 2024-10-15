import { NextApiRequest, NextApiResponse } from "next"
import { verifyToken } from "../middleware/jwt-auth"
import prisma from "@/lib/prisma"
import { monthNames } from "@/utils/monthNames"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método não permitido" })
  }

  try {
    if (!await verifyToken({ req } as any)) {
      return res.status(401).json({ message: "Não autorizado" })
    }

    const userId = parseUserId(req.query.userId)
    if (userId === null) {
      return res.status(400).json({ message: "UserId não fornecido ou inválido" })
    }

    const { anoAtual, mesAtual } = getCurrentDateInfo()
    const flows = await getFlows(userId, anoAtual, mesAtual)

    const response = formatFlows(flows)

    return res.status(200).json({
      message: "Fluxo de caixa obtido com sucesso",
      flows: response,
    })
  } catch (error) {
    console.error("Erro ao obter fluxo de caixa:", error)
    return res.status(500).json({
      message: "Erro ao obter fluxo de caixa",
      error: error instanceof Error ? error.message : "Erro interno do servidor",
    })
  }
}

function parseUserId(userId: string | string[] | undefined): number | null {
  if (!userId || Array.isArray(userId)) return null
  const parsed = Number(userId)
  return isNaN(parsed) ? null : parsed
}

function getCurrentDateInfo() {
  const now = new Date()
  return {
    anoAtual: now.getFullYear(),
    mesAtual: now.getMonth() + 1 
  }
}

async function getFlows(userId: number, ano: number, mesInicial: number) {
  return prisma.orcamento.findMany({
    where: {
      userId,
      ano,
      mes: { gte: mesInicial }
    },
    orderBy: { mes: "asc" },
  })
}

function formatFlows(flows: any[]) {
  return flows.map((flow) => ({
    mes: flow.mes,
    nome: monthNames[flow.mes - 1] ?? 'Desconhecido',
    receita: Number((flow.receita ?? 0).toFixed(2)),
    despesa: Number((flow.despesa ?? 0).toFixed(2)),
    saldo: Number((flow.saldo ?? 0).toFixed(2)),
    status: flow.status ?? 'neutro'
  }))
}
