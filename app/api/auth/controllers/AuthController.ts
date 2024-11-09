import { NextResponse } from "next/server"
import AuthService from "../services/AuthService"
import { LoginDTO } from "../dtos/LoginDTO"
import { RegisterDTO } from "../dtos/RegisterDTO"

class AuthController {
  private readonly COOKIE_OPTIONS = {
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict" as const,
    maxAge: 86400,
    path: "/",
  }

  async login(request: Request) {
    try {
      const loginData: LoginDTO = await request.json()
      const result = await AuthService.login(loginData)

      if (result.status === 200 && result.data.token && result.data.userId) {
        const response = NextResponse.json(result.data, { status: 200 })
        
        response.cookies.set("token", result.data.token, {
          ...this.COOKIE_OPTIONS,
          httpOnly: true,
        })
        
        response.cookies.set(
          "userId", 
          result.data.userId.toString(), 
          this.COOKIE_OPTIONS
        )
        
        return response
      }

      return NextResponse.json(result.data, { status: result.status })
    } catch (error) {
      return NextResponse.json(
        { error: "[ERRO] Erro ao processar login" },
        { status: 500 }
      )
    }
  }

  async register(request: Request) {
    try {
      const registerData: RegisterDTO = await request.json()
      const result = await AuthService.register(registerData)

      if (result.status === 201 && result.data.token) {
        const response = NextResponse.json(result.data, { status: 201 })
        
        response.cookies.set("token", result.data.token, {
          ...this.COOKIE_OPTIONS,
          httpOnly: true,
        })
        
        response.cookies.set(
          "userId", 
          result.data.user.id.toString(), 
          this.COOKIE_OPTIONS
        )
        
        return response
      }

      return NextResponse.json(result.data, { status: result.status })
    } catch (error) {
      return NextResponse.json(
        { error: "[ERRO] Erro ao processar registro" },
        { status: 500 }
      )
    }
  }
}

export default new AuthController()
