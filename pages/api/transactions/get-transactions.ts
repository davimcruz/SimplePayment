import { NextApiRequest, NextApiResponse } from "next"
import TransactionController from "./controllers/TransactionController"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" })
  }

  return TransactionController.getTransactions(req, res)
}
