import { NextApiRequest, NextApiResponse } from "next"
import transactionController from "./controllers/TransactionController"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method === 'GET') {
    return await transactionController.getSummary(req, res)
  }
  
  return res.status(405).json({ error: "[ERRO] Método não permitido" })
}
