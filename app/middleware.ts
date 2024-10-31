import { NextResponse } from "next/server"
import { NextRequest } from "next/server"

// Páginas públicas que não precisam de autenticação
const publicPaths = ['/signin', '/signup', '/']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permite acesso a páginas públicas
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // Verifica se existem os cookies necessários
  const token = request.cookies.get('token')
  const userId = request.cookies.get('userId')
  const email = request.cookies.get('email')

  // Se faltar algum cookie essencial, redireciona para login
  if (!token || !userId || !email) {
    const response = NextResponse.redirect(new URL('/signin', request.url))
    
    // Limpa todos os cookies por segurança
    response.cookies.delete('token')
    response.cookies.delete('userId')
    response.cookies.delete('email')
    
    return response
  }

  // Se tiver todos os cookies, permite o acesso
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Protege todas as rotas exceto as públicas e arquivos estáticos
    '/((?!signin|signup|_next/static|_next/image|favicon.ico).*)',
  ],
}
