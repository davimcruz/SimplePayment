import { NextApiRequest, NextApiResponse } from "next"
import BillController from "./controllers/BillController"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return BillController.deleteBill(req, res)
}
