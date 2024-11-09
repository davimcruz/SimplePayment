import { NextRequest, NextResponse } from "next/server"
import { FinancialAnalysisService } from "../services/FinancialAnalysisService"

const service = new FinancialAnalysisService()

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        {
          message: "ID do usuário não fornecido",
          type: "VALIDATION_ERROR",
        },
        { status: 400 }
      )
    }

    const analysis = await service.analyzeUserFinances(userId)
    return NextResponse.json(analysis, { status: 200 })
  } catch (error: any) {
    console.error("Erro no serviço de análise:", error)
    return NextResponse.json(
      {
        message: error.message || "Erro inesperado durante a análise",
        type: "ERROR",
      },
      { status: 400 }
    )
  }
} 