import { NextRequest, NextResponse } from "next/server"
import CostsService from "../services/CostsService"
import { despesaFixaSchema } from "@/lib/validation"
import { verifyTokenFromRequest } from "@/lib/auth"

export async function criar(req: NextRequest) {
  const tokenValid = await verifyTokenFromRequest(req)
  if (!tokenValid) {
    return NextResponse.json(
      { error: "[ERRO] Não autorizado" },
      { status: 401 }
    )
  }

  try {
    const dados = await req.json()
    const parsedBody = despesaFixaSchema.safeParse(dados)
    
    if (!parsedBody.success) {
      return NextResponse.json({
        error: "[ERRO] Dados inválidos",
        details: parsedBody.error.flatten().fieldErrors,
      }, { status: 400 })
    }

    const userId = Number(dados.userId) 
    const despesaFixa = await CostsService.criar(userId, parsedBody.data)
    
    return NextResponse.json({
      message: "[SUCESSO] Despesa fixa criada com sucesso",
      despesa: despesaFixa,
    }, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar despesa fixa:", error)
    return NextResponse.json({ 
      error: "[ERRO] Erro ao criar despesa fixa" 
    }, { status: 500 })
  }
}

export async function listar(req: NextRequest) {
  const tokenValid = await verifyTokenFromRequest(req)
  if (!tokenValid) {
    return NextResponse.json(
      { error: "[ERRO] Não autorizado" },
      { status: 401 }
    )
  }

  try {
    const userId = Number(req.nextUrl.searchParams.get("userId"))
    if (!userId) {
      return NextResponse.json({ 
        error: "[ERRO] UserId não fornecido" 
      }, { status: 400 })
    }

    const despesas = await CostsService.listar(userId)
    return NextResponse.json({
      message: "[SUCESSO] Despesas fixas recuperadas com sucesso",
      despesas,
    }, { status: 200 })
  } catch (error) {
    console.error("Erro ao listar despesas fixas:", error)
    return NextResponse.json({ 
      error: "[ERRO] Erro ao listar despesas fixas" 
    }, { status: 500 })
  }
}