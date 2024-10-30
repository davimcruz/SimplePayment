import { NextApiRequest, NextApiResponse } from "next"
import CashflowController from "./controllers/CashflowController"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return CashflowController.getFlow(req, res)
}
