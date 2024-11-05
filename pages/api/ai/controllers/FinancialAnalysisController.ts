import { NextApiRequest, NextApiResponse } from "next"
import { FinancialAnalysisService } from "../services/FinancialAnalysisService"

class FinancialAnalysisController {
  private service: FinancialAnalysisService

  constructor() {
    this.service = new FinancialAnalysisService()
  }

  async analyze(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Método não permitido" })
    }

    try {
      const { userId } = req.body

      if (!userId) {
        return res.status(400).json({
          message: "ID do usuário não fornecido",
          type: "VALIDATION_ERROR",
        })
      }

      const analysis = await this.service.analyzeUserFinances(userId)
      return res.status(200).json(analysis)
    } catch (error: any) {
      console.error("Erro no serviço de análise:", error)
      return res.status(400).json({
        message: error.message || "Erro inesperado durante a análise",
        type: "ERROR",
      })
    }
  }
}

export default new FinancialAnalysisController()
