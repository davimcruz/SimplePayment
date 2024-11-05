import { NextApiRequest, NextApiResponse } from "next"
import { PaymentService } from "../services/PaymentService"

export class PaymentController {
  private paymentService: PaymentService

  constructor() {
    this.paymentService = new PaymentService()
  }

  async generatePix(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { email, nome, cpf, userId } = req.body

      if (!email || !nome || !cpf || !userId) {
        return res.status(400).json({ 
          error: "Dados incompletos. Email, nome, CPF e userId são obrigatórios." 
        })
      }

      const pixData = await this.paymentService.generatePix({
        email,
        nome,
        cpf,
        valor: 1.00,
        userId
      })

      return res.status(200).json(pixData)
    } catch (error) {
      console.error("Erro no controller de pagamento:", error)
      return res.status(500).json({ 
        error: "Erro ao processar pagamento" 
      })
    }
  }

  async getPaymentStatus(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { paymentId } = req.query

      if (!paymentId || Array.isArray(paymentId)) {
        return res.status(400).json({ 
          error: "ID do pagamento inválido" 
        })
      }

      const statusData = await this.paymentService.getPaymentStatus(
        Number(paymentId)
      )

      return res.status(200).json(statusData)
    } catch (error) {
      console.error("Erro no controller de status:", error)
      return res.status(500).json({ 
        error: "Erro ao verificar status do pagamento" 
      })
    }
  }
}
