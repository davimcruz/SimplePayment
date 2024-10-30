import { NextApiRequest, NextApiResponse } from "next"
import CardService from "../services/CardService"
import { verifyToken } from "@/pages/api/middleware/jwt-auth"
import { createCardSchema } from "../dtos/CreateCardDTO"
import { updateCardSchema } from "../dtos/UpdateCardDTO"
import { deleteCardSchema } from "../dtos/DeleteCardDTO"

// Definição do controller do cartão
class CardController {
  // Controller para criação de cartões
  async createCard(req: NextApiRequest, res: NextApiResponse) {
    const tokenValid = await verifyToken({ req } as any)
    if (!tokenValid) {
      return res.status(401).json({ error: "[ERRO] Não autorizado" })
    }

    // Garante que os dados estão sendo passados nos tipos corretos (definidos no zod)
    const parsedBody = createCardSchema.safeParse(req.body)
    if (!parsedBody.success) {
      return res.status(400).json({
        error: "[ERRO] Dados inválidos",
        details: parsedBody.error.flatten().fieldErrors,
      })
    }

    try {
      const novoCartao = await CardService.createCard(parsedBody.data)
      return res.status(201).json({
        message: "[SUCESSO] Cartão criado com sucesso",
        cartao: novoCartao,
      })
    } catch (error) {
      console.error("Erro ao criar cartão:", error)
      return res.status(500).json({ error: "[ERRO] Erro ao criar cartão" })
    }
  }

  // Controller para atualização de cartões
  async updateCard(req: NextApiRequest, res: NextApiResponse) {
    const tokenValid = await verifyToken({ req } as any)
    if (!tokenValid) {
      return res.status(401).json({ error: "[ERRO] Não autorizado" })
    }
    // Garante que os dados estão sendo passados nos tipos corretos (definidos no zod)
    const parsedBody = updateCardSchema.safeParse(req.body)
    if (!parsedBody.success) {
      return res.status(400).json({
        error: "[ERRO] Dados inválidos",
        details: parsedBody.error.flatten().fieldErrors,
      })
    }

    try {
      const updatedCard = await CardService.updateCard(parsedBody.data)
      return res.status(200).json({
        message: "[SUCESSO] Cartão atualizado com sucesso",
        cartao: updatedCard,
      })
    } catch (error) {
      console.error("Erro ao atualizar cartão:", error)
      return res.status(500).json({ error: "[ERRO] Erro ao atualizar cartão" })
    }
  }

  // Controller para exclusão de cartões
  async deleteCard(req: NextApiRequest, res: NextApiResponse) {
    const tokenValid = await verifyToken({ req } as any)
    if (!tokenValid) {
      return res.status(401).json({ error: "[ERRO] Não autorizado" })
    }

    // Garante que os dados estão sendo passados nos tipos corretos (definidos no zod)
    const parsedBody = deleteCardSchema.safeParse(req.body)
    if (!parsedBody.success) {
      return res.status(400).json({
        error: "[ERRO] Dados inválidos",
        details: parsedBody.error.flatten().fieldErrors,
      })
    }

    try {
      await CardService.deleteCard(parsedBody.data)
      return res.status(200).json({
        message: "[SUCESSO] Cartão excluído com sucesso",
      })
    } catch (error) {
      console.error("Erro ao excluir cartão:", error)
      return res.status(500).json({ error: "[ERRO] Erro ao excluir cartão" })
    }
  }

  // Controller para obtenção de cartões (Todos os dados daquele cartão)
  async getCard(req: NextApiRequest, res: NextApiResponse) {
    const tokenValid = await verifyToken({ req } as any)
    if (!tokenValid) {
      return res.status(401).json({ error: "[ERRO] Não autorizado" })
    }

    const { userId } = req.query

    if (!userId || isNaN(Number(userId))) {
      return res.status(400).json({ error: "[ERRO] ID do usuário inválido" })
    }

    try {
      const cartoes = await CardService.getCard(Number(userId))
      return res.status(200).json({
        message: "[SUCESSO] Cartões recuperados com sucesso",
        cartoes,
      })
    } catch (error) {
      console.error("Erro ao buscar cartões:", error)
      return res.status(500).json({ error: "[ERRO] Erro ao buscar cartões" })
    }
  }

  // Controller para obtenção do nome do cartão (Fiz uma rota específica para isso, entretanto, dá para utilizar o próprio getCards para obter o nome)
  async getCardName(req: NextApiRequest, res: NextApiResponse) {
    const tokenValid = await verifyToken({ req } as any)
    if (!tokenValid) {
      return res.status(401).json({ error: "[ERRO] Não autorizado" })
    }

    const { cardId } = req.body

    if (!cardId) {
      return res.status(400).json({ error: "[ERRO] CardId é obrigatório." })
    }

    try {
      const cardDetails = await CardService.getCardName(cardId)
      if (!cardDetails) {
        return res
          .status(404)
          .json({
            error: "[ERRO] Nenhum cartão encontrado com o cardId fornecido.",
          })
      }
      return res.status(200).json({
        message: "[SUCESSO] Nome do cartão recuperado com sucesso.",
        nomeCartao: cardDetails.nomeCartao,
      })
    } catch (error) {
      return res
        .status(500)
        .json({ error: "[ERRO] Erro ao recuperar nome do cartão" })
    }
  }
}

export default new CardController()
