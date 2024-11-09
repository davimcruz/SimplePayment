import { NextRequest, NextResponse } from "next/server"
import CashflowService from "../services/CashflowService"
import { createFlowSchema, updateFlowSchema } from "../dtos"
import { verifyTokenFromRequest } from "@/lib/auth"

class CashflowController {
  async createFlow(request: NextRequest) {
    const tokenValid = await verifyTokenFromRequest(request)
    if (!tokenValid) {
      return NextResponse.json(
        { message: "[ERRO] Não autorizado" },
        { status: 401 }
      )
    }

    try {
      const data = await request.json()
      const parsedBody = createFlowSchema.safeParse(data)
      if (!parsedBody.success) {
        return NextResponse.json({
          message: "[ERRO] Dados inválidos",
          errors: parsedBody.error.flatten().fieldErrors,
        }, { status: 400 })
      }

      const { userId, flow } = parsedBody.data
      const anoAtual = new Date().getFullYear()
      const mesAtual = new Date().getMonth() + 1

      const existingFlow = await CashflowService.checkExistingFlow(userId, anoAtual)
      if (existingFlow) {
        return NextResponse.json({
          message: "[ERRO] Fluxo de caixa já existente",
          error: "Já existe um fluxo de caixa para este usuário neste ano.",
          code: "EXISTING_FLOW",
          year: anoAtual,
        }, { status: 409 })
      }

      const validMonths = Object.entries(flow).filter(
        ([mes]) => Number(mes) >= mesAtual
      )
      if (validMonths.length === 0) {
        return NextResponse.json({
          message: "[ERRO] Nenhum mês válido fornecido para o cash flow",
        }, { status: 400 })
      }

      await CashflowService.createFlow(userId, validMonths, anoAtual)

      return NextResponse.json({
        message: "[SUCESSO] Cash flow criado com sucesso",
      }, { status: 201 })
    } catch (error) {
      console.error("Erro ao criar cash flow:", error)
      return NextResponse.json({
        message: "[ERRO] Erro ao criar cash flow",
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      }, { status: 500 })
    }
  }

  async getFlow(request: NextRequest) {
    const tokenValid = await verifyTokenFromRequest(request)
    if (!tokenValid) {
      return NextResponse.json(
        { message: "[ERRO] Não autorizado" },
        { status: 401 }
      )
    }

    const userId = request.nextUrl.searchParams.get("userId")
    if (!userId || isNaN(Number(userId))) {
      return NextResponse.json(
        { message: "[ERRO] UserId não fornecido ou inválido" },
        { status: 400 }
      )
    }

    try {
      const flows = await CashflowService.getFlow(Number(userId))
      return NextResponse.json({
        message: "[SUCESSO] Consulta realizada com sucesso",
        flows: flows || [],
      }, { status: 200 })
    } catch (error) {
      if (error instanceof Error && 
          error.message === "Nenhum orçamento encontrado para o usuário.") {
        return NextResponse.json({
          message: "[INFO] Nenhum fluxo de caixa encontrado",
          flows: [],
        }, { status: 200 })
      }

      console.error("Erro ao obter fluxo de caixa:", error)
      return NextResponse.json({
        message: "[ERRO] Erro ao obter fluxo de caixa",
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      }, { status: 500 })
    }
  }

  async updateFlow(request: NextRequest) {
    const tokenValid = await verifyTokenFromRequest(request)
    if (!tokenValid) {
      return NextResponse.json(
        { message: "[ERRO] Não autorizado" },
        { status: 401 }
      )
    }

    try {
      const data = await request.json()
      const parsedBody = updateFlowSchema.safeParse(data)
      if (!parsedBody.success) {
        return NextResponse.json({
          message: "[ERRO] Dados inválidos",
          errors: parsedBody.error.flatten().fieldErrors,
        }, { status: 400 })
      }

      const { userId, flow } = parsedBody.data
      await CashflowService.updateFlow(userId, flow)

      return NextResponse.json({
        message: "[SUCESSO] Cash flow atualizado com sucesso",
      }, { status: 200 })
    } catch (error) {
      console.error("Erro ao atualizar cash flow:", error)
      return NextResponse.json({
        message: "[ERRO] Erro ao atualizar cash flow",
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      }, { status: 500 })
    }
  }
}

export default new CashflowController() 