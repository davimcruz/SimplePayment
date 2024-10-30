import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import { verifyTokenFromRequest } from "@/pages/api/middleware/jwt-auth"

export async function middleware(request: NextRequest) {
  const tokenValid = verifyTokenFromRequest(request) 

  if (!tokenValid) {
    return NextResponse.redirect(new URL("/auth/signin", request.url))
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
  ],
}
