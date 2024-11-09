import { NextRequest, NextResponse } from "next/server"
import { verifyTokenFromRequest } from "@/lib/auth"
import { UserService } from "../services/UserService"

class UserController {
  private userService: UserService

  constructor() {
    this.userService = new UserService()
  }

  async deleteBudgets(request: NextRequest) {
    const tokenValid = await verifyTokenFromRequest(request)
    if (!tokenValid) {
      return NextResponse.json(
        { error: "[ERRO] Não autorizado" },
        { status: 401 }
      )
    }

    try {
      const data = await request.json()
      const { ids } = data

      if (!ids || !Array.isArray(ids)) {
        return NextResponse.json({
          error: "[ERRO] É necessário enviar um array de IDs no corpo da requisição.",
        }, { status: 400 })
      }

      const deleteBudgets = await this.userService.deleteBudgets(ids)
      
      return NextResponse.json({
        message: "[SUCESSO] Orçamentos excluídos com sucesso.",
        deletedCount: deleteBudgets.count,
      }, { status: 200 })
    } catch (error) {
      console.error("Erro ao excluir orçamentos:", error)
      return NextResponse.json({ 
        error: "[ERRO] Erro ao excluir orçamentos." 
      }, { status: 500 })
    }
  }

  async deleteTransactions(request: NextRequest) {
    const tokenValid = await verifyTokenFromRequest(request)
    if (!tokenValid) {
      return NextResponse.json(
        { error: "[ERRO] Não autorizado" },
        { status: 401 }
      )
    }

    try {
      const data = await request.json()
      const { ids } = data

      if (!ids || !Array.isArray(ids)) {
        return NextResponse.json({
          error: "[ERRO] É necessário enviar um array de IDs no corpo da requisição.",
        }, { status: 400 })
      }

      const deleteTransactions = await this.userService.deleteTransactions(ids)
      
      return NextResponse.json({
        message: "[SUCESSO] Transações excluídas com sucesso.",
        deletedCount: deleteTransactions.count,
      }, { status: 200 })
    } catch (error) {
      console.error("Erro ao excluir transações:", error)
      return NextResponse.json({ 
        error: "[ERRO] Erro ao excluir transações." 
      }, { status: 500 })
    }
  }

  async deleteUsers(request: NextRequest) {
    const tokenValid = await verifyTokenFromRequest(request)
    if (!tokenValid) {
      return NextResponse.json(
        { error: "[ERRO] Não autorizado" },
        { status: 401 }
      )
    }

    try {
      const data = await request.json()
      const { ids } = data

      if (!ids || !Array.isArray(ids)) {
        return NextResponse.json({
          error: "[ERRO] É necessário enviar um array de IDs no corpo da requisição.",
        }, { status: 400 })
      }

      const [deletedBudgets, deletedTransactions, deletedUsers] = 
        await Promise.all([
          this.userService.deleteBudgets(ids),
          this.userService.deleteTransactions(ids),
          this.userService.deleteUsers(ids),
        ])

      return NextResponse.json({
        message: "[SUCESSO] Usuários, orçamentos e transações excluídos com sucesso.",
        deletedUsers: deletedUsers.count,
        deletedBudgets: deletedBudgets.count,
        deletedTransactions: deletedTransactions.count,
      }, { status: 200 })
    } catch (error) {
      console.error("Erro ao excluir usuários e transações:", error)
      return NextResponse.json({ 
        error: "[ERRO] Erro ao excluir usuários e transações." 
      }, { status: 500 })
    }
  }

  async getUser(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get("userId")
    
    if (!userId || isNaN(Number(userId))) {
      return NextResponse.json({ 
        error: "[ERRO] ID de usuário inválido." 
      }, { status: 400 })
    }

    try {
      const user = await this.userService.getUserById(Number(userId))
      if (!user) {
        return NextResponse.json({ 
          error: "[ERRO] Usuário não encontrado" 
        }, { status: 404 })
      }
      return NextResponse.json(user, { status: 200 })
    } catch (error) {
      console.error("Erro ao processar a requisição:", error)
      return NextResponse.json({ 
        error: "[ERRO] Erro ao processar a requisição." 
      }, { status: 500 })
    }
  }

  async verifyPassword(request: NextRequest) {
    try {
      const data = await request.json()
      const { userId, currentPassword } = data

      if (!userId || !currentPassword) {
        return NextResponse.json({ 
          error: "[ERRO] Dados inválidos" 
        }, { status: 400 })
      }

      const result = await this.userService.verifyCurrentPassword(
        Number(userId), 
        currentPassword
      )

      return NextResponse.json(result.data, { status: result.status })
    } catch (error) {
      console.error("Erro ao verificar senha:", error)
      return NextResponse.json({ 
        error: "[ERRO] Erro ao verificar senha." 
      }, { status: 500 })
    }
  }

  async updatePassword(request: NextRequest) {
    try {
      const data = await request.json()
      const { userId, currentPassword, newPassword } = data

      if (!userId || !currentPassword || !newPassword) {
        return NextResponse.json({ 
          error: "[ERRO] Dados inválidos" 
        }, { status: 400 })
      }

      const result = await this.userService.updatePassword(
        Number(userId), 
        currentPassword, 
        newPassword
      )

      return NextResponse.json(result.data, { status: result.status })
    } catch (error) {
      console.error("Erro ao atualizar senha:", error)
      return NextResponse.json({ 
        error: "[ERRO] Erro ao atualizar senha." 
      }, { status: 500 })
    }
  }
}

export default new UserController() 