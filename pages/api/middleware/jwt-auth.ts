import jwt from "jsonwebtoken"
import { NextRequest } from "next/server"
import { parseCookies } from "nookies"

// Função para verificar o token JWT a partir de NextRequest
export function verifyTokenFromRequest(req: NextRequest): boolean {
  const cookies = parseCookies({ req: req as any }) // Converte NextRequest para o formato esperado
  const token = cookies.token // Substitua 'token' pelo nome do cookie que armazena o token

  // Se não houver token, retorna false
  if (!token) return false

  try {
    // Verifica se o token é válido usando o secret do jwt presente no .env
    jwt.verify(token, process.env.JWT_SECRET as string)
    return true // Retorna true se o token for válido
  } catch (error) {
    return false // Retorna false se a verificação falhar (token inválido ou expirado)
  }
}
