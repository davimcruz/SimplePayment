import { NextApiRequest, NextApiResponse } from "next"
import { verifyTokenFromRequest } from "../../middleware/jwt-auth"
import SettingsService from "../services/SettingsService"
import { UpdateUserDto } from "../dtos/UpdateUserDTO"
import { SaveImageDto } from "../dtos/SaveImageDTO"

// Controlador para atualizar nome e sobrenome
export async function updateNameHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const tokenValid = verifyTokenFromRequest(req as any)
  if (!tokenValid) {
    return res.status(401).json({ error: "[ERRO] Não autorizado" })
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "[ERRO] Método não permitido" })
  }

  const { email, nome, sobrenome }: UpdateUserDto = req.body

  if (
    !email ||
    !nome ||
    !sobrenome ||
    typeof email !== "string" ||
    typeof nome !== "string" ||
    typeof sobrenome !== "string"
  ) {
    return res.status(400).json({ error: "[ERRO] Dados inválidos" })
  }

  try {
    const updatedUser = await SettingsService.updateUser({
      email,
      nome,
      sobrenome,
    })
    console.log(
      `[SUCESSO] Nome e sobrenome atualizados para o usuário: ${email}`
    )
    return res.status(200).json({
      message: "[SUCESSO] Nome e sobrenome atualizados com sucesso",
      user: updatedUser,
    })
  } catch (error) {
    console.error("[ERRO] ao atualizar usuário:", error)
    if (error instanceof Error) {
      return res.status(500).json({ error: `[ERRO] ${error.message}` })
    }
    return res
      .status(500)
      .json({ error: "[ERRO] Erro ao processar a requisição" })
  }
}

// Controlador para salvar imagem
export async function saveImageHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "[ERRO] Método não permitido" })
  }

  const tokenValid = verifyTokenFromRequest(req as any)
  if (!tokenValid) {
    return res.status(401).json({ error: "[ERRO] Não autorizado" })
  }

  const { email, imageUrl }: SaveImageDto = req.body

  if (
    !email ||
    typeof email !== "string" ||
    !imageUrl ||
    typeof imageUrl !== "string"
  ) {
    return res.status(400).json({ error: "[ERRO] Dados inválidos" })
  }

  try {
    const updatedUser = await SettingsService.saveImage({ email, imageUrl })
    console.log(`[SUCESSO] Imagem atualizada para o usuário: ${email}`)
    return res
      .status(200)
      .json({
        message: "[SUCESSO] Imagem salva com sucesso",
        user: updatedUser,
      })
  } catch (error) {
    console.error("[ERRO] ao atualizar usuário:", error)
    if (error instanceof Error) {
      return res.status(500).json({ error: `[ERRO] ${error.message}` })
    }
    return res
      .status(500)
      .json({ error: "[ERRO] Erro ao processar a requisição" })
  }
}
