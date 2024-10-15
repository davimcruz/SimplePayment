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
    const orcamentoMesAtual = await getOrcamentoMesAtual(userId, anoAtual, mesAtual)

    if (!orcamentoMesAtual) {
      return res.status(404).json({
        message: "Orçamento não encontrado para o mês atual",
      })
    }

    const saldo = orcamentoMesAtual.saldo ?? 0
    const mesAtualNome = monthNames[mesAtual - 1] ?? 'Desconhecido'

    return res.status(200).json({
      message: "Saldo do mês atual obtido com sucesso",
      saldo: Number(saldo.toFixed(2)),
      mesAtual: mesAtualNome,
    })
  } catch (error) {
    console.error("Erro ao obter saldo:", error)
    return res.status(500).json({
      message: "Erro ao obter saldo",
      error: error instanceof Error ? error.message : "Erro interno do servidor",
    })
  }
}

function parseUserId(userId: string | string[] | undefined): number | null {
  if (!userId || Array.isArray(userId)) return null
  const parsed = Number(userId)
  return isNaN(parsed) ? null : parsed
}

function getCurrentDateInfo(): { anoAtual: number; mesAtual: number } {
  const now = new Date()
  return {
    anoAtual: now.getFullYear(),
    mesAtual: now.getMonth() + 1  
  }
}

async function getOrcamentoMesAtual(userId: number, ano: number, mes: number) {
  return prisma.orcamento.findUnique({
    where: {
      userId_mes_ano: {
        userId,
        mes,
        ano,
      }
    },
    select: {
      saldo: true,
    },
  })
}
