import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import CostsService from "../../services/CostsService"
import { despesaFixaSchema } from "@/lib/validation"
import { z } from "zod"

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies()
    const userId = cookieStore.get("userId")?.value

    if (!userId) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      )
    }

    const { costs } = await req.json()

    if (!Array.isArray(costs) || costs.length === 0) {
      return NextResponse.json(
        { error: "Lista de despesas inválida" },
        { status: 400 }
      )
    }

    const despesasProcessadas = []

    for (const cost of costs) {
      let valorFormatado
      
      if (typeof cost.valor === 'number') {
        valorFormatado = String(cost.valor).replace(/[^\d]/g, '')
      } else {
        valorFormatado = String(cost.valor).replace(/[^\d]/g, '')
      }

      const despesaInput = {
        nome: cost.nome,
        valor: parseFloat(valorFormatado.replace(/[^\d,]/g, "").replace(",", ".")),
        diaVencimento: parseInt(cost.diaVencimento),
        formaPagamento: cost.formaPagamento,
        categoria: cost.categoria,
        cardId: cost.formaPagamento === "credito" ? cost.cardId : undefined,
        dataInicio: new Date().toISOString(), 
        status: "ativa" as const,
      }

      const despesa = await CostsService.criar(Number(userId), despesaInput)
      despesasProcessadas.push(despesa)
    }

    return NextResponse.json(
      {
        message: "Despesas fixas criadas com sucesso",
        data: despesasProcessadas,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("[COSTS_BATCH_ERROR]", error)
    return NextResponse.json(
      {
        error: "Erro ao criar despesas fixas",
        details: error.message,
      },
      { status: 500 }
    )
  }
}
