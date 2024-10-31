import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { verifyTokenFromRequest } from "@/pages/api/middleware/jwt-auth"

//Verificação de autenticação

export async function middleware(request: NextRequest) {
  const tokenValid = verifyTokenFromRequest(request)

  if (!tokenValid) {
    return NextResponse.redirect(new URL("/signin", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/cards/:path*",
    "/cashflow/:path*",
    "/settings/:path*",
    "/transactions/:path*",
    "/setup/:path*",
  ],
}
