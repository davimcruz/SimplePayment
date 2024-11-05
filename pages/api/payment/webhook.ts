import { NextApiRequest, NextApiResponse } from "next"
import prisma from "@/lib/prisma"
import { paymentLogRepository } from "@/models/PaymentLog"
import { PaymentService } from "./services/PaymentService"

const paymentService = new PaymentService()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" })
  }

  try {
    const { type, data } = req.body

    if (type !== "payment") {
      return res.status(200).json({ message: "Evento ignorado" })
    }

    const payment = await paymentService.getPaymentStatus(Number(data.id))

    if (payment.status === 'approved') {
      const paymentLog = await paymentLogRepository.findByPaymentId(data.id.toString())
      
      if (paymentLog && paymentLog.userId !== 'pending') {
        await prisma.usuarios.update({
          where: { 
            id: Number(paymentLog.userId) 
          },
          data: { 
            permissao: 'PRO'
          }
        })
      }
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error("Erro no webhook:", error)
    return res.status(500).json({ error: "Erro interno do servidor" })
  }
}
