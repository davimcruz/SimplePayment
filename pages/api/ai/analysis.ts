import type { NextApiRequest, NextApiResponse } from "next"
import FinancialAnalysisController from "./controllers/FinancialAnalysisController"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return FinancialAnalysisController.analyze(req, res)
}
