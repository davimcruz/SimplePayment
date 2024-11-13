import { NextRequest, NextResponse } from "next/server"
import CostsService from "../services/CostsService"
import { z } from "zod"

const deleteSchema = z.object({
  costId: z.string().uuid()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { costId } = deleteSchema.parse(body)

    const result = await CostsService.excluir(costId)
    return NextResponse.json(result)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "ID da despesa fixa inválido" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Erro ao excluir despesa fixa" },
      { status: 400 }
    )
  }
} 