import { NextRequest, NextResponse } from "next/server"
import CardService from "../services/CardService"
import { verifyTokenFromRequest } from "@/lib/auth"
import { 
  createCardSchema, 
  updateCardSchema, 
  deleteCardSchema 
} from "../dtos"

class CardController {
  async createCard(request: NextRequest) {
    const tokenValid = await verifyTokenFromRequest(request)
    if (!tokenValid) {
      return NextResponse.json(
        { error: "[ERRO] Não autorizado" },
        { status: 401 }
      )
    }

    try {
      const data = await request.json()
      const parsedBody = createCardSchema.safeParse(data)
      
      if (!parsedBody.success) {
        return NextResponse.json({
          error: "[ERRO] Dados inválidos",
          details: parsedBody.error.flatten().fieldErrors,
        }, { status: 400 })
      }

      const novoCartao = await CardService.createCard(parsedBody.data)
      return NextResponse.json({
        message: "[SUCESSO] Cartão criado com sucesso",
        cartao: novoCartao,
      }, { status: 201 })
    } catch (error) {
      console.error("Erro ao criar cartão:", error)
      
      if (error instanceof Error && error.message.includes("Limite de")) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ 
        error: "[ERRO] Erro ao criar cartão" 
      }, { status: 500 })
    }
  }

  async updateCard(request: NextRequest) {
    const tokenValid = await verifyTokenFromRequest(request)
    if (!tokenValid) {
      return NextResponse.json(
        { error: "[ERRO] Não autorizado" },
        { status: 401 }
      )
    }

    try {
      const data = await request.json()
      const parsedBody = updateCardSchema.safeParse(data)
      
      if (!parsedBody.success) {
        return NextResponse.json({
          error: "[ERRO] Dados inválidos",
          details: parsedBody.error.flatten().fieldErrors,
        }, { status: 400 })
      }

      const updatedCard = await CardService.updateCard(parsedBody.data)
      return NextResponse.json({
        message: "[SUCESSO] Cartão atualizado com sucesso",
        cartao: updatedCard,
      }, { status: 200 })
    } catch (error) {
      console.error("Erro ao atualizar cartão:", error)
      return NextResponse.json({ 
        error: "[ERRO] Erro ao atualizar cartão" 
      }, { status: 500 })
    }
  }

  async deleteCard(request: NextRequest) {
    const tokenValid = await verifyTokenFromRequest(request)
    if (!tokenValid) {
      return NextResponse.json(
        { error: "[ERRO] Não autorizado" },
        { status: 401 }
      )
    }

    try {
      const data = await request.json()
      const parsedBody = deleteCardSchema.safeParse(data)
      
      if (!parsedBody.success) {
        return NextResponse.json({
          error: "[ERRO] Dados inválidos",
          details: parsedBody.error.flatten().fieldErrors,
        }, { status: 400 })
      }

      await CardService.deleteCard(parsedBody.data)
      return NextResponse.json({
        message: "[SUCESSO] Cartão excluído com sucesso",
      }, { status: 200 })
    } catch (error) {
      console.error("Erro ao excluir cartão:", error)
      return NextResponse.json({ 
        error: "[ERRO] Erro ao excluir cartão" 
      }, { status: 500 })
    }
  }

  async getCard(request: NextRequest) {
    const tokenValid = await verifyTokenFromRequest(request)
    if (!tokenValid) {
      return NextResponse.json(
        { error: "[ERRO] Não autorizado" },
        { status: 401 }
      )
    }

    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId || isNaN(Number(userId))) {
      return NextResponse.json({ 
        error: "[ERRO] ID do usuário inválido" 
      }, { status: 400 })
    }

    try {
      const cartoes = await CardService.getCard(Number(userId))
      return NextResponse.json({
        message: "[SUCESSO] Cartões recuperados com sucesso",
        cartoes,
      }, { status: 200 })
    } catch (error) {
      console.error("Erro ao buscar cartões:", error)
      return NextResponse.json({ 
        error: "[ERRO] Erro ao buscar cartões" 
      }, { status: 500 })
    }
  }

  async getCardName(request: NextRequest) {
    const tokenValid = await verifyTokenFromRequest(request)
    if (!tokenValid) {
      return NextResponse.json(
        { error: "[ERRO] Não autorizado" },
        { status: 401 }
      )
    }

    try {
      const { cardId } = await request.json()

      if (!cardId) {
        return NextResponse.json({ 
          error: "[ERRO] CardId é obrigatório." 
        }, { status: 400 })
      }

      const cardDetails = await CardService.getCardName(cardId)
      if (!cardDetails) {
        return NextResponse.json({
          error: "[ERRO] Nenhum cartão encontrado com o cardId fornecido.",
        }, { status: 404 })
      }

      return NextResponse.json({
        message: "[SUCESSO] Nome do cartão recuperado com sucesso.",
        nomeCartao: cardDetails.nomeCartao,
      }, { status: 200 })
    } catch (error) {
      return NextResponse.json({ 
        error: "[ERRO] Erro ao recuperar nome do cartão" 
      }, { status: 500 })
    }
  }
}

export default new CardController() 