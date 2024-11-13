import { NextRequest, NextResponse } from "next/server"
import CostsService from "../../services/CostsService"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      )
    }

    const costs = await CostsService.listar(Number(userId))
    return NextResponse.json(costs)
  } catch (error: any) {
    console.error("[COSTS_LIST_ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao listar despesas fixas" },
      { status: 500 }
    )
  }
} 