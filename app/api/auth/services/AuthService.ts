import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import prisma from "@/lib/prisma"
import { LoginDTO } from "../dtos/LoginDTO"
import { RegisterDTO } from "../dtos/RegisterDTO"

class AuthError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message)
    this.name = "AuthError"
  }
}

interface JWTPayload {
  email: string
  userId: number
  iat?: number
  exp?: number
}

interface AuthResponse {
  status: number;
  data: {
    token: string;
    userId: number;
    error?: string;
    message?: string;
    user?: any;
  }
}

class AuthService {
  private readonly SALT_ROUNDS = 10
  private readonly JWT_EXPIRATION = "24h"
  private readonly jwtSecret: string

  constructor() {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error("[ERRO] JWT_SECRET não configurado!")
    }
    this.jwtSecret = secret
  }

  private generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.jwtSecret, { 
      expiresIn: this.JWT_EXPIRATION,
      algorithm: 'HS256',
      issuer: 'simplefinance-api',
      audience: 'simplefinance-client'
    })
  }

  private decodeToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as JWTPayload
    } catch (error) {
      throw new AuthError("Token inválido ou expirado", 401)
    }
  }

  private async validateUserStatus(user: { status: string }) {
    const statusMessages = {
      suspended: "Sua conta está suspensa. Entre em contato com o suporte.",
      inactive: "Sua conta está inativa. Entre em contato com o suporte.",
      active: null,
    } as const

    const message = statusMessages[user.status as keyof typeof statusMessages]
    if (message) {
      throw new AuthError(message, 403)
    }
  }

  async register(data: RegisterDTO): Promise<AuthResponse> {
    try {
      const { nome, sobrenome, email, password } = data

      // Verifica se o usuário já existe
      const existingUser = await prisma.usuarios.findUnique({ 
        where: { email },
        select: { id: true }
      })
      
      if (existingUser) {
        throw new AuthError("Usuário já existente para esse email.", 400)
      }

      // Hash da senha com try-catch para garantir segurança
      const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS)

      // Criação do usuário em transação para garantir atomicidade
      const newUser = await prisma.$transaction(async (tx) => {
        const user = await tx.usuarios.create({
          data: {
            nome,
            sobrenome,
            email,
            senha: hashedPassword,
            permissao: 'free',
            status: 'active'
          },
          select: {
            id: true,
            nome: true,
            sobrenome: true,
            email: true,
          },
        })

        return user
      })

      const token = this.generateToken({ 
        email: newUser.email, 
        userId: newUser.id 
      })

      return {
        status: 201,
        data: {
          message: "[SUCESSO] Usuário registrado!",
          user: newUser,
          token,
          userId: newUser.id
        },
      }

    } catch (error) {
      if (error instanceof AuthError) {
        return {
          status: error.statusCode,
          data: { 
            error: `[ERRO] ${error.message}`,
            token: '',
            userId: 0
          }
        }
      }

      console.error("[ERRO] Falha no registro:", error)
      return {
        status: 500,
        data: { 
          error: "[ERRO] Falha ao registrar usuário.",
          token: '',
          userId: 0
        }
      }
    }
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    try {
      const { email, password } = data

      // Busca usuário com select mínimo necessário
      const user = await prisma.usuarios.findUnique({
        where: { email },
        select: { 
          id: true, 
          email: true, 
          senha: true,
          status: true
        },
      })

      if (!user) {
        throw new AuthError("Email não registrado.", 401)
      }

      // Valida status do usuário
      await this.validateUserStatus(user)

      // Verifica senha com timing constante
      const isPasswordValid = await bcrypt.compare(password, user.senha)
      if (!isPasswordValid) {
        throw new AuthError("Senha incorreta!", 401)
      }

      const token = this.generateToken({ 
        email: user.email, 
        userId: user.id 
      })

      return { 
        status: 200, 
        data: { 
          token,
          userId: user.id
        } 
      }

    } catch (error) {
      if (error instanceof AuthError) {
        return {
          status: error.statusCode,
          data: { 
            error: `[ERRO] ${error.message}`,
            token: '',
            userId: 0
          }
        }
      }

      console.error("[ERRO] Falha no login:", error)
      return {
        status: 500,
        data: { 
          error: "[ERRO] Falha ao realizar login.",
          token: '',
          userId: 0
        }
      }
    }
  }

  getUserIdFromToken(token: string): number {
    const decoded = this.decodeToken(token)
    return decoded.userId
  }
}

export default new AuthService()
