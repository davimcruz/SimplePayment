import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import prisma from "@/lib/prisma"
import { LoginDTO } from "../dtos/LoginDTO"
import { RegisterDTO } from "../dtos/RegisterDTO"

class AuthService {
  // Serviço de Registro de usuários
  async register(data: RegisterDTO) {
    const { nome, sobrenome, email, password } = data

    const existingUser = await prisma.usuarios.findUnique({ where: { email } })
    if (existingUser) {
      return {
        status: 400,
        data: { error: "[ERRO] Usuário já existente para esse email." },
      }
    }

    // Hash da senha (user register password ---> bcrypt hash ---> database)
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await prisma.usuarios.create({
      data: {
        nome,
        sobrenome,
        email,
        senha: hashedPassword,
        permissao: 'free',
      },
      select: {
        id: true,
        nome: true,
        sobrenome: true,
        email: true,
      },
    })

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error("[ERRO] Autenticação não definida!")
    }

    const token = jwt.sign(
      { email: newUser.email, userId: newUser.id },
      jwtSecret,
      { expiresIn: "24h" }
    )

    return {
      status: 201,
      data: {
        message: "[SUCESSO] Usuário registrado!",
        user: newUser,
        token,
      },
    }
  }

  // Serviço de login de usuário
  async login(data: LoginDTO) {
    const { email, password } = data

    const user = await prisma.usuarios.findUnique({
      where: { email },
      select: { id: true, email: true, senha: true },
    })

    if (!user) {
      return { status: 401, data: { error: "[ERRO] Email não registrado." } }
    }

    // Comparação de hash da senha (database password ---> bcrypt comparison ---> login)
    const isPasswordValid = await bcrypt.compare(password, user.senha)
    if (!isPasswordValid) {
      return { status: 401, data: { error: "[ERRO] Senha incorreta!" } }
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error("[ERRO] Autenticação não definida!")
    }

    const token = jwt.sign({ email: user.email, userId: user.id }, jwtSecret, {
      expiresIn: "24h",
    })

    return { status: 200, data: { token, userId: user.id } }
  }
}

export default new AuthService()
