import { NextApiRequest, NextApiResponse } from "next"
import transactionController from "./controllers/TransactionController"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  return await transactionController.viewTransaction(req, res)
}
