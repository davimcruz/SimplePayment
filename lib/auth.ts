import jwt from "jsonwebtoken"
import { NextRequest } from "next/server"

export async function verifyTokenFromRequest(
  request: NextRequest
): Promise<boolean> {
  const token = request.cookies.get("token")

  if (!token) return false

  try {
    jwt.verify(token.value, process.env.JWT_SECRET as string)
    return true
  } catch (error) {
    return false
  }
}
