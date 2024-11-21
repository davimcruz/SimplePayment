import { NextRequest, NextResponse } from "next/server"
import { PaymentService } from "../services/PaymentService"

class PaymentController {
  private paymentService: PaymentService

  constructor() {
    this.paymentService = new PaymentService()
  }

  async generatePix(request: NextRequest) {
    try {
      const data = await request.json()
      const { email, nome, cpf, userId } = data

      if (!email || !nome || !cpf || !userId) {
        return NextResponse.json({ 
          error: "Dados incompletos. Email, nome, CPF e userId são obrigatórios." 
        }, { status: 400 })
      }

      const pixData = await this.paymentService.generatePix({
        email,
        nome,
        cpf,
        valor: 20.00,
        userId
      })

      return NextResponse.json(pixData, { status: 200 })
    } catch (error) {
      console.error("Erro no controller de pagamento:", error)
      return NextResponse.json({ 
        error: "Erro ao processar pagamento" 
      }, { status: 500 })
    }
  }

  async getPaymentStatus(request: NextRequest) {
    try {
      const paymentId = request.nextUrl.searchParams.get("paymentId")

      if (!paymentId || isNaN(Number(paymentId))) {
        return NextResponse.json({ 
          error: "ID do pagamento inválido" 
        }, { status: 400 })
      }

      const statusData = await this.paymentService.getPaymentStatus(
        Number(paymentId)
      )

      return NextResponse.json(statusData, { status: 200 })
    } catch (error) {
      console.error("Erro no controller de status:", error)
      return NextResponse.json({ 
        error: "Erro ao verificar status do pagamento" 
      }, { status: 500 })
    }
  }

  async getPayments(request: NextRequest) {
    try {
      const userId = request.nextUrl.searchParams.get("userId")

      if (!userId) {
        return NextResponse.json({ 
          error: "ID do usuário inválido" 
        }, { status: 400 })
      }

      const payments = await this.paymentService.getPayments(userId)

      return NextResponse.json(payments, { status: 200 })
    } catch (error) {
      console.error("Erro ao buscar histórico de pagamentos:", error)
      return NextResponse.json({ 
        error: "Erro ao buscar histórico de pagamentos" 
      }, { status: 500 })
    }
  }
}

export default new PaymentController() 