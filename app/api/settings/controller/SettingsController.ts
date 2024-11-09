import { NextRequest, NextResponse } from "next/server"
import { verifyTokenFromRequest } from "@/lib/auth"
import SettingsService from "../services/SettingsService"
import { UpdateUserDto, SaveImageDto } from "../dtos/"

class SettingsController {
  async updateName(request: NextRequest) {
    const tokenValid = await verifyTokenFromRequest(request)
    if (!tokenValid) {
      return NextResponse.json(
        { error: "[ERRO] Não autorizado" },
        { status: 401 }
      )
    }

    try {
      const data = await request.json()
      const { userId, nome, sobrenome } = data as UpdateUserDto

      if (
        !userId ||
        !nome ||
        !sobrenome ||
        typeof userId !== "number" ||
        typeof nome !== "string" ||
        typeof sobrenome !== "string"
      ) {
        return NextResponse.json(
          { error: "[ERRO] Dados inválidos" },
          { status: 400 }
        )
      }

      const updatedUser = await SettingsService.updateUser({
        userId,
        nome,
        sobrenome,
      })

      console.log(
        `[SUCESSO] Nome e sobrenome atualizados para o usuário ID: ${userId}`
      )

      return NextResponse.json({
        message: "[SUCESSO] Nome e sobrenome atualizados com sucesso",
        user: updatedUser,
      }, { status: 200 })

    } catch (error) {
      console.error("[ERRO] ao atualizar usuário:", error)
      if (error instanceof Error) {
        return NextResponse.json(
          { error: `[ERRO] ${error.message}` },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { error: "[ERRO] Erro ao processar a requisição" },
        { status: 500 }
      )
    }
  }

  async saveImage(request: NextRequest) {
    const tokenValid = await verifyTokenFromRequest(request)
    if (!tokenValid) {
      return NextResponse.json(
        { error: "[ERRO] Não autorizado" },
        { status: 401 }
      )
    }

    try {
      const data = await request.json()
      const { userId, imageUrl } = data as SaveImageDto

      if (
        !userId ||
        typeof userId !== "number" ||
        !imageUrl ||
        typeof imageUrl !== "string"
      ) {
        return NextResponse.json(
          { error: "[ERRO] Dados inválidos" },
          { status: 400 }
        )
      }

      const updatedUser = await SettingsService.saveImage({ userId, imageUrl })
      
      console.log(`[SUCESSO] Imagem atualizada para o usuário ID: ${userId}`)
      
      return NextResponse.json({
        message: "[SUCESSO] Imagem salva com sucesso",
        user: updatedUser,
      }, { status: 200 })

    } catch (error) {
      console.error("[ERRO] ao atualizar usuário:", error)
      if (error instanceof Error) {
        return NextResponse.json(
          { error: `[ERRO] ${error.message}` },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { error: "[ERRO] Erro ao processar a requisição" },
        { status: 500 }
      )
    }
  }
}

export default new SettingsController() 