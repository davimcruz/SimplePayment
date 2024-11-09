import { NextRequest, NextResponse } from "next/server"
import { verifyTokenFromRequest } from "@/lib/auth"
import BillService from "../services/BillService"

class BillController {
  async deleteBill(request: NextRequest) {
    const faturaId = request.nextUrl.searchParams.get("faturaId")

    if (!faturaId) {
      return NextResponse.json(
        { error: "[ERRO] ID da fatura inválido ou não fornecido." },
        { status: 400 }
      )
    }

    try {
      await BillService.deleteBill(faturaId)
      return NextResponse.json(
        {
          success: true,
          message:
            "[SUCESSO] Fatura, parcelas e transações associadas deletadas com sucesso.",
        },
        { status: 200 }
      )
    } catch (error) {
      return NextResponse.json(
        { error: "[ERRO] Erro ao deletar fatura, parcelas e transações." },
        { status: 500 }
      )
    }
  }

  async getBill(request: NextRequest) {
    const tokenValid = await verifyTokenFromRequest(request)
    if (!tokenValid) {
      return NextResponse.json(
        { error: "[ERRO] Não autorizado" },
        { status: 401 }
      )
    }

    const { cardId } = await request.json()

    if (!cardId) {
      return NextResponse.json(
        { error: "[ERRO] O ID do Cartão é obrigatório." },
        { status: 400 }
      )
    }

    try {
      const faturas = await BillService.getBill(cardId)
      if (faturas.length === 0) {
        return NextResponse.json(
          {
            error:
              "[ERRO] Nenhuma fatura em aberto encontrada para o ID do cartão fornecido.",
          },
          { status: 404 }
        )
      }

      return NextResponse.json(
        {
          message: "[SUCESSO] Faturas e parcelas em aberto recuperadas com sucesso.",
          faturas: faturas,
        },
        { status: 200 }
      )
    } catch (error) {
      return NextResponse.json(
        { error: "[ERRO] Erro ao processar a requisição." },
        { status: 500 }
      )
    }
  }

  async getParcels(request: NextRequest) {
    const tokenValid = await verifyTokenFromRequest(request)
    if (!tokenValid) {
      return NextResponse.json(
        { error: "[ERRO] Não autorizado" },
        { status: 401 }
      )
    }

    const faturaId = request.nextUrl.searchParams.get("faturaId")

    if (!faturaId) {
      return NextResponse.json(
        { error: "[ERRO] Fatura ID inválido" },
        { status: 400 }
      )
    }

    try {
      const parcelas = await BillService.getParcels(faturaId)
      if (!parcelas.length) {
        return NextResponse.json(
          { error: "[ERRO] Nenhuma parcela encontrada" },
          { status: 404 }
        )
      }

      return NextResponse.json(
        {
          message: "[SUCESSO] Parcelas recuperadas para a respectiva fatura.",
          parcelas,
        },
        { status: 200 }
      )
    } catch (error) {
      return NextResponse.json(
        { error: "[ERRO] Erro ao buscar parcelas" },
        { status: 500 }
      )
    }
  }

  async payBill(request: NextRequest) {
    const tokenValid = await verifyTokenFromRequest(request)
    if (!tokenValid) {
      return NextResponse.json(
        { error: "[ERRO] Não autorizado" },
        { status: 401 }
      )
    }

    const { faturaId } = await request.json()

    if (!faturaId) {
      return NextResponse.json(
        { error: "[ERRO] O ID da fatura não foi fornecido." },
        { status: 400 }
      )
    }

    try {
      const userId = await BillService.payBill(faturaId)
      return NextResponse.json(
        {
          message: "[SUCESSO] Fatura paga com sucesso.",
          success: true,
          userId,
        },
        { status: 200 }
      )
    } catch (error) {
      return NextResponse.json(
        { error: "[ERRO] Erro ao processar pagamento da fatura." },
        { status: 500 }
      )
    }
  }
}

export default new BillController() 