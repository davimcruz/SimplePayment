import { NextRequest, NextResponse } from "next/server"
import { verifyTokenFromRequest } from "@/lib/auth"
import { AdminService } from "../services/AdminService"

const adminService = new AdminService()

class AdminController {
  private async verifyAdminAccess(request: NextRequest) {
    const tokenValid = await verifyTokenFromRequest(request)
    if (!tokenValid) {
      return NextResponse.json(
        { error: "[ERRO] Não autorizado" },
        { status: 401 }
      )
    }
    return true
  }

  async getAllUsers(request: NextRequest) {
    try {
      if (!(await this.verifyAdminAccess(request))) return

      const users = await adminService.getAllUsers()
      return NextResponse.json(
        {
          message: "[SUCESSO] Usuários recuperados com sucesso",
          users,
        },
        { status: 200 }
      )
    } catch (error) {
      console.error("[ERRO] Erro ao buscar usuários:", error)
      return NextResponse.json(
        { error: "[ERRO] Erro ao buscar usuários" },
        { status: 500 }
      )
    }
  }

  async updateUserPermission(request: NextRequest) {
    try {
      if (!(await this.verifyAdminAccess(request))) return

      const { userId, permission } = await request.json()

      if (!userId || !permission) {
        return NextResponse.json(
          { error: "[ERRO] Dados inválidos" },
          { status: 400 }
        )
      }

      const user = await adminService.updateUserPermission(userId, permission)
      return NextResponse.json(
        {
          message: "[SUCESSO] Permissão atualizada com sucesso",
          user,
        },
        { status: 200 }
      )
    } catch (error) {
      console.error("[ERRO] Erro ao atualizar permissão:", error)
      return NextResponse.json(
        { error: "[ERRO] Erro ao atualizar permissão" },
        { status: 500 }
      )
    }
  }

  async updateUserStatus(request: NextRequest) {
    try {
      if (!(await this.verifyAdminAccess(request))) return

      const { userId, status } = await request.json()

      if (!userId || !status) {
        return NextResponse.json(
          { error: "[ERRO] Dados inválidos" },
          { status: 400 }
        )
      }

      const user = await adminService.updateUserStatus(userId, status)
      return NextResponse.json({ user }, { status: 200 })
    } catch (error) {
      console.error("[ERRO] Erro ao atualizar status:", error)
      return NextResponse.json(
        { error: "[ERRO] Erro ao atualizar status" },
        { status: 500 }
      )
    }
  }

  async deleteUsers(request: NextRequest) {
    try {
      if (!(await this.verifyAdminAccess(request))) return

      const userId = request.nextUrl.searchParams.get("userId")
      const body = await request.json().catch(() => ({}))
      const { userIds } = body

      if (userIds && Array.isArray(userIds)) {
        await adminService.deleteMultipleUsers(userIds.map(Number))
        return NextResponse.json(
          { message: "[SUCESSO] Usuários deletados com sucesso" },
          { status: 200 }
        )
      } else if (userId) {
        await adminService.deleteUser(Number(userId))
        return NextResponse.json(
          { message: "[SUCESSO] Usuário deletado com sucesso" },
          { status: 200 }
        )
      }

      return NextResponse.json(
        { error: "[ERRO] Nenhum ID de usuário fornecido" },
        { status: 400 }
      )
    } catch (error) {
      console.error("[ERRO] Erro ao deletar usuário(s):", error)
      return NextResponse.json(
        { error: "[ERRO] Erro ao deletar usuário(s)" },
        { status: 500 }
      )
    }
  }

  async getStats(request: NextRequest) {
    try {
      if (!(await this.verifyAdminAccess(request))) return

      const stats = await adminService.getStats()
      return NextResponse.json({ stats }, { status: 200 })
    } catch (error) {
      console.error("[ERRO] Erro ao buscar estatísticas:", error)
      return NextResponse.json(
        { error: "[ERRO] Erro ao buscar estatísticas" },
        { status: 500 }
      )
    }
  }

  async getUserDetails(request: NextRequest) {
    try {
      if (!(await this.verifyAdminAccess(request))) return

      const userId = request.nextUrl.searchParams.get("userId")

      if (!userId) {
        return NextResponse.json(
          { error: "[ERRO] ID do usuário não fornecido" },
          { status: 400 }
        )
      }

      const userDetails = await adminService.getUserDetails(Number(userId))
      return NextResponse.json({ user: userDetails }, { status: 200 })
    } catch (error) {
      console.error("[ERRO] Erro ao buscar detalhes do usuário:", error)
      return NextResponse.json(
        { error: "[ERRO] Erro ao buscar detalhes do usuário" },
        { status: 500 }
      )
    }
  }

  async getAllSells(request: NextRequest) {
    try {
      if (!(await this.verifyAdminAccess(request))) return

      const sellsData = await adminService.getAllSells()
      return NextResponse.json(
        {
          message: "[SUCESSO] Vendas recuperadas com sucesso",
          ...sellsData,
        },
        { status: 200 }
      )
    } catch (error) {
      console.error("[ERRO] Erro ao buscar vendas:", error)
      return NextResponse.json(
        { error: "[ERRO] Erro ao buscar vendas" },
        { status: 500 }
      )
    }
  }
}

export default new AdminController()
