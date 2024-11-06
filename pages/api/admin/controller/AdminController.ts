import { NextApiRequest, NextApiResponse } from "next"
import { verifyTokenFromRequest } from "../../middleware/jwt-auth"
import { AdminService } from "../services/AdminService"

const adminService = new AdminService()

export class AdminController {
  // Verifica se o usuário tem permissão de administrador
  private async verifyAdminAccess(req: NextApiRequest, res: NextApiResponse) {
    const tokenValid = verifyTokenFromRequest(req as any)
    if (!tokenValid) {
      return res.status(401).json({ error: "[ERRO] Não autorizado" })
    }
    return true
  }

  // Controller para recuperação de todos os usuários do sistema
  async getAllUsers(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "[ERRO] Método não permitido" })
    }

    if (!(await this.verifyAdminAccess(req, res))) return

    try {
      const users = await adminService.getAllUsers()
      return res.status(200).json({ 
        message: "[SUCESSO] Usuários recuperados com sucesso",
        users 
      })
    } catch (error) {
      console.error("[ERRO] Erro ao buscar usuários:", error)
      return res.status(500).json({ error: "[ERRO] Erro ao buscar usuários" })
    }
  }

  // Controller para atualização de permissão de usuário
  async updateUserPermission(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "PATCH") {
      return res.status(405).json({ error: "[ERRO] Método não permitido" })
    }

    if (!(await this.verifyAdminAccess(req, res))) return

    const { userId, permission } = req.body

    if (!userId || !permission) {
      return res.status(400).json({ error: "[ERRO] Dados inválidos" })
    }

    try {
      const user = await adminService.updateUserPermission(userId, permission)
      return res.status(200).json({ 
        message: "[SUCESSO] Permissão atualizada com sucesso",
        user 
      })
    } catch (error) {
      console.error("[ERRO] Erro ao atualizar permissão:", error)
      return res.status(500).json({ error: "[ERRO] Erro ao atualizar permissão" })
    }
  }

  // Atualizar status do usuário
  async updateUserStatus(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "PATCH") {
      return res.status(405).json({ error: "Método não permitido" })
    }

    if (!(await this.verifyAdminAccess(req, res))) return

    const { userId, status } = req.body

    if (!userId || !status) {
      return res.status(400).json({ error: "Dados inválidos" })
    }

    try {
      const user = await adminService.updateUserStatus(userId, status)
      return res.status(200).json({ user })
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      return res.status(500).json({ error: "Erro ao atualizar status" })
    }
  }

  // Atualizar o método deleteUser para suportar múltiplos usuários
  async deleteUser(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "DELETE") {
      return res.status(405).json({ error: "Método não permitido" })
    }

    if (!(await this.verifyAdminAccess(req, res))) return

    // Verifica se é uma deleção múltipla ou única
    const { userIds } = req.body
    const { userId } = req.query

    try {
      if (userIds && Array.isArray(userIds)) {
        // Deletar múltiplos usuários
        await adminService.deleteMultipleUsers(userIds.map(Number))
        return res.status(200).json({ message: "Usuários deletados com sucesso" })
      } else if (userId) {
        // Deletar um único usuário
        await adminService.deleteUser(Number(userId))
        return res.status(200).json({ message: "Usuário deletado com sucesso" })
      } else {
        return res.status(400).json({ error: "Nenhum ID de usuário fornecido" })
      }
    } catch (error) {
      console.error("Erro ao deletar usuário(s):", error)
      return res.status(500).json({ error: "Erro ao deletar usuário(s)" })
    }
  }

  // Buscar estatísticas
  async getStats(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Método não permitido" })
    }

    if (!(await this.verifyAdminAccess(req, res))) return

    try {
      const stats = await adminService.getStats()
      return res.status(200).json({ stats })
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error)
      return res.status(500).json({ error: "Erro ao buscar estatísticas" })
    }
  }

  // Buscar detalhes do usuário
  async getUserDetails(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Método não permitido" })
    }

    if (!(await this.verifyAdminAccess(req, res))) return

    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({ error: "ID do usuário não fornecido" })
    }

    try {
      const userDetails = await adminService.getUserDetails(Number(userId))
      return res.status(200).json({ user: userDetails })
    } catch (error) {
      console.error("Erro ao buscar detalhes do usuário:", error)
      return res.status(500).json({ error: "Erro ao buscar detalhes do usuário" })
    }
  }

  async getAllSells(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "[ERRO] Método não permitido" })
    }

    if (!(await this.verifyAdminAccess(req, res))) return

    try {
      const sellsData = await adminService.getAllSells()
      return res.status(200).json({ 
        message: "[SUCESSO] Vendas recuperadas com sucesso",
        ...sellsData
      })
    } catch (error) {
      console.error("[ERRO] Erro ao buscar vendas:", error)
      return res.status(500).json({ error: "[ERRO] Erro ao buscar vendas" })
    }
  }
}
