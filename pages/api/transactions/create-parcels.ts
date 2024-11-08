import { NextApiRequest, NextApiResponse } from "next"
import TransactionController from "./controllers/TransactionController"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" })
  }

  return TransactionController.createParcels(req, res)
}
