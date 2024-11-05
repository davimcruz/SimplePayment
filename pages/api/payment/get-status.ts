import { NextApiRequest, NextApiResponse } from "next"
import { PaymentController } from "./controllers/PaymentController"

const paymentController = new PaymentController()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" })
  }

  return paymentController.getPaymentStatus(req, res)
}
