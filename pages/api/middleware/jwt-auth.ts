import jwt from "jsonwebtoken"
import { GetServerSidePropsContext } from "next"
import { parseCookies } from "nookies"

// Função para verificar o token JWT
export async function verifyToken(ctx: GetServerSidePropsContext) {
  // Extrai o token dos cookies da requisição
  const { token } = parseCookies(ctx)
  
  // Se não houver token, retorna false
  if (!token) return false

  try {
    // Verifica se o token é válido usando o secret do jwt presente no .env
    await jwt.verify(token, process.env.JWT_SECRET as string)
    return true // Retorna true se o token for válido
  } catch (error) {
    // Retorna false se a verificação falhar (token inválido ou expirado)
    return false
  }
}
