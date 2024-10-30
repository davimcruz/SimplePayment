import { NextApiRequest, NextApiResponse } from "next"
import CashflowService from "../services/CashflowService"
import { createFlowSchema } from "../dtos/CreateFlowDTO"
import { updateFlowSchema } from "../dtos/UpdateFlowDTO"
import { verifyToken } from "../../middleware/jwt-auth"

// Definição do controller de cashflow
class CashflowController {
  // Controller para criação de fluxos de caixa
  async createFlow(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "[ERRO] Método não permitido" })
    }

    try {
      if (!(await verifyToken({ req } as any))) {
        return res.status(401).json({ message: "[ERRO] Não autorizado" })
      }

      const parsedBody = createFlowSchema.safeParse(req.body)
      if (!parsedBody.success) {
        return res.status(400).json({
          message: "[ERRO] Dados inválidos",
          errors: parsedBody.error.flatten().fieldErrors,
        })
      }

      const { userId, flow } = parsedBody.data
      const anoAtual = new Date().getFullYear()
      const mesAtual = new Date().getMonth() + 1

      const existingFlow = await CashflowService.checkExistingFlow(userId, anoAtual)
      if (existingFlow) {
        return res.status(409).json({
          message: "[ERRO] Fluxo de caixa já existente",
          error: "Já existe um fluxo de caixa para este usuário neste ano.",
          code: "EXISTING_FLOW",
          year: anoAtual,
        })
      }

      const validMonths = Object.entries(flow).filter(
        ([mes]) => Number(mes) >= mesAtual
      )
      if (validMonths.length === 0) {
        return res.status(400).json({
          message: "[ERRO] Nenhum mês válido fornecido para o cash flow",
        })
      }

      await CashflowService.createFlow(userId, validMonths, anoAtual)

      return res.status(201).json({
        message: "[SUCESSO] Cash flow criado com sucesso",
      })
    } catch (error) {
      console.error("Erro ao criar cash flow:", error)
      return res.status(500).json({
        message: "[ERRO] Erro ao criar cash flow",
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      })
    }
  }

  // Controller para obtenção de fluxos de caixa
  async getFlow(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "[ERRO] Método não permitido" })
    }

    try {
      if (!(await verifyToken({ req } as any))) {
        return res.status(401).json({ message: "[ERRO] Não autorizado" })
      }

      const userId = parseUserId(req.query.userId)
      if (userId === null) {
        return res.status(400).json({ message: "[ERRO] UserId não fornecido ou inválido" })
      }

      const flows = await CashflowService.getFlow(userId)
      return res.status(200).json({
        message: "[SUCESSO] Fluxo de caixa obtido com sucesso",
        flows,
      })
    } catch (error) {
      console.error("Erro ao obter fluxo de caixa:", error)
      return res.status(500).json({
        message: "[ERRO] Erro ao obter fluxo de caixa",
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      })
    }
  }

  // Removido por inutilização - /api/cashflow/get-monthly
  // Controller para obtenção do saldo mensal

  // async getMonthly(req: NextApiRequest, res: NextApiResponse) {
  //   if (req.method !== "GET") {
  //     return res.status(405).json({ message: "Método não permitido" })
  //   }

  //   try {
  //     if (!(await verifyToken({ req } as any))) {
  //       return res.status(401).json({ message: "Não autorizado" })
  //     }

  //     const userId = parseUserId(req.query.userId)
  //     if (userId === null) {
  //       return res
  //         .status(400)
  //         .json({ message: "UserId não fornecido ou inválido" })
  //     }

  //     const anoAtual = new Date().getFullYear()
  //     const mesAtual = new Date().getMonth() + 1

  //     const monthlyData = await CashflowService.getMonthly(userId, anoAtual, mesAtual)
  //     return res.status(200).json({
  //       message: "Dados mensais obtidos com sucesso",
  //       monthlyData,
  //     })
  //   } catch (error) {
  //     console.error("Erro ao obter dados mensais:", error)
  //     return res.status(500).json({
  //       message: "Erro ao obter dados mensais",
  //       error:
  //         error instanceof Error ? error.message : "Erro interno do servidor",
  //     })
  //   }
  // }


  // Controller para atualização de fluxos de caixa
  async updateFlow(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "PUT") {
      return res.status(405).json({ message: "[ERRO] Método não permitido" })
    }

    try {
      if (!(await verifyToken({ req } as any))) {
        return res.status(401).json({ message: "[ERRO] Não autorizado" })
      }

      const parsedBody = updateFlowSchema.safeParse(req.body)
      if (!parsedBody.success) {
        return res.status(400).json({
          message: "[ERRO] Dados inválidos",
          errors: parsedBody.error.flatten().fieldErrors,
        })
      }

      const { userId, flow } = parsedBody.data
      await CashflowService.updateFlow(userId, flow)

      return res.status(200).json({
        message: "[SUCESSO] Cash flow atualizado com sucesso",
      })
    } catch (error) {
      console.error("Erro ao atualizar cash flow:", error)
      return res.status(500).json({
        message: "[ERRO] Erro ao atualizar cash flow",
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      })
    }
  }
}

// Função auxiliar para parsear o userId
function parseUserId(userId: string | string[] | undefined): number | null {
  if (!userId || Array.isArray(userId)) return null
  const parsed = Number(userId)
  return isNaN(parsed) ? null : parsed
}

export default new CashflowController()
