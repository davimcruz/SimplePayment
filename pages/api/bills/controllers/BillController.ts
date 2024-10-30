import { NextApiRequest, NextApiResponse } from "next"
import BillService from "../services/BillService"
import { verifyToken } from "../../middleware/jwt-auth"

// Definição do controller da fatura
class BillController {
  // Controler para deletar faturas
  async deleteBill(req: NextApiRequest, res: NextApiResponse) {
    const { faturaId } = req.query

    if (!faturaId || typeof faturaId !== "string") {
      return res
        .status(400)
        .json({ error: "[ERRO] ID da fatura inválido ou não fornecido." })
    }

    try {
      await BillService.deleteBill(faturaId)
      res.status(200).json({
        success: true,
        message:
          "[SUCESSO] Fatura, parcelas e transações associadas deletadas com sucesso.",
      })
    } catch (error) {
      res.status(500).json({
        error: "[ERRO] Erro ao deletar fatura, parcelas e transações.",
      })
    }
  }

  // Controler para obtenção de faturas
  async getBill(req: NextApiRequest, res: NextApiResponse) {
    const tokenValid = await verifyToken({ req } as any)
    if (!tokenValid) {
      return res.status(401).json({ error: "[ERRO] Não autorizado" })
    }

    const { cardId } = req.body

    if (!cardId) {
      return res
        .status(400)
        .json({ error: "[ERRO] O ID do Cartão é obrigatório." })
    }

    try {
      const faturas = await BillService.getBill(cardId)
      if (faturas.length === 0) {
        return res.status(404).json({
          error:
            "[ERRO] Nenhuma fatura em aberto encontrada para o ID do cartão fornecido.",
        })
      }

      return res.status(200).json({
        message:
          "[SUCESSO] Faturas e parcelas em aberto recuperadas com sucesso.",
        faturas: faturas,
      })
    } catch (error) {
      return res
        .status(500)
        .json({ error: "[ERRO] Erro ao processar a requisição." })
    }
  }

  // Controler para obtenção de parcelas
  async getParcels(req: NextApiRequest, res: NextApiResponse) {
    const tokenValid = await verifyToken({ req } as any)
    if (!tokenValid) {
      return res.status(401).json({ error: "[ERRO] Não autorizado" })
    }

    const { faturaId } = req.query

    if (!faturaId || typeof faturaId !== "string") {
      return res.status(400).json({ error: "[ERRO] Fatura ID inválido" })
    }

    try {
      const parcelas = await BillService.getParcels(faturaId)
      if (!parcelas.length) {
        return res
          .status(404)
          .json({ error: "[ERRO] Nenhuma parcela encontrada" })
      }

      return res.status(200).json({
        message: "[SUCESSO] Parcelas recuperadas para a respectiva fatura.",
        parcelas,
      })
    } catch (error) {
      return res.status(500).json({ error: "[ERRO] Erro ao buscar parcelas" })
    }
  }

  // Controler para pagamento de faturas
  async payBill(req: NextApiRequest, res: NextApiResponse) {
    const tokenValid = await verifyToken({ req } as any)
    if (!tokenValid) {
      return res.status(401).json({ error: "[ERRO] Não autorizado" })
    }

    const { faturaId } = req.body

    if (!faturaId) {
      return res
        .status(400)
        .json({ error: "[ERRO] O ID da fatura não foi fornecido." })
    }

    try {
      const userId = await BillService.payBill(faturaId)
      res.status(200).json({
        message: "[SUCESSO] Fatura paga com sucesso.",
        success: true,
        userId,
      })
    } catch (error) {
      return res
        .status(500)
        .json({ error: "[ERRO] Erro ao processar pagamento da fatura." })
    }
  }
}

export default new BillController()
