import { NextApiRequest, NextApiResponse } from "next"
import { verifyTokenFromRequest } from "../../middleware/jwt-auth"
import { UserService } from "../services/UserService"

// Instância do serviço de usuários
const userService = new UserService()

export class UserController {
  // Controller para deletar orçamentos
  async deleteBudgets(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "[ERRO] Método não permitido" })
    }

    const tokenValid = verifyTokenFromRequest(req as any)
    if (!tokenValid) {
      return res.status(401).json({ error: "[ERRO] Não autorizado" })
    }

    const { ids } = req.body
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        error: "[ERRO] É necessário enviar um array de IDs no corpo da requisição.",
      })
    }

    try {
      // Chama o serviço para deletar os orçamentos
      const deleteBudgets = await userService.deleteBudgets(ids)
      res.status(200).json({
        message: "[SUCESSO] Orçamentos excluídos com sucesso.",
        deletedCount: deleteBudgets.count,
      })
    } catch (error) {
      console.error("Erro ao excluir orçamentos:", error)
      return res.status(500).json({ error: "[ERRO] Erro ao excluir orçamentos." })
    }
  }

  // Controller para deletar transações
  async deleteTransactions(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "[ERRO] Método não permitido" })
    }

    const tokenValid = verifyTokenFromRequest(req as any)
    if (!tokenValid) {
      return res.status(401).json({ error: "[ERRO] Não autorizado" })
    }

    const { ids } = req.body
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        error: "[ERRO] É necessário enviar um array de IDs no corpo da requisição.",
      })
    }

    try {
      // Chama o serviço para deletar as transações
      const deleteTransactions = await userService.deleteTransactions(ids)
      res.status(200).json({
        message: "[SUCESSO] Transações excluídas com sucesso.",
        deletedCount: deleteTransactions.count,
      })
    } catch (error) {
      console.error("Erro ao excluir transações:", error)
      return res.status(500).json({ error: "[ERRO] Erro ao excluir transações." })
    }
  }

  // Controller para deletar usuários
  async deleteUsers(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "[ERRO] Método não permitido" })
    }

    const tokenValid = verifyTokenFromRequest(req as any)
    if (!tokenValid) {
      return res.status(401).json({ error: "[ERRO] Não autorizado" })
    }

    const { ids } = req.body
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        error: "[ERRO] É necessário enviar um array de IDs no corpo da requisição.",
      })
    }

    try {
      // Chama o serviço para deletar orçamentos, transações e usuários em paralelo
      const [deletedBudgets, deletedTransactions, deletedUsers] =
        await Promise.all([
          userService.deleteBudgets(ids),
          userService.deleteTransactions(ids),
          userService.deleteUsers(ids),
        ])

      res.status(200).json({
        message: "[SUCESSO] Usuários, orçamentos e transações excluídos com sucesso.",
        deletedUsers: deletedUsers.count,
        deletedBudgets: deletedBudgets.count,
        deletedTransactions: deletedTransactions.count,
      })
    } catch (error) {
      console.error("Erro ao excluir usuários e transações:", error)
      return res
        .status(500)
        .json({ error: "[ERRO] Erro ao excluir usuários e transações." })
    }
  }

  // Controller para obter um usuário
  async getUser(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "[ERRO] Método não permitido" })
    }

    const { userId } = req.query
    if (!userId || isNaN(Number(userId))) {
      return res.status(400).json({ error: "[ERRO] ID de usuário inválido." })
    }

    try {
      // Chama o serviço para obter o usuário pelo ID
      const user = await userService.getUserById(Number(userId))
      if (!user) {
        return res.status(404).json({ error: "[ERRO] Usuário não encontrado" })
      }
      return res.status(200).json(user) 
    } catch (error) {
      console.error("Erro ao processar a requisição:", error)
      return res.status(500).json({ error: "[ERRO] Erro ao processar a requisição." })
    }
  }
}
