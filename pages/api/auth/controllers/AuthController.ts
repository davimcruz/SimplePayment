import { NextApiRequest, NextApiResponse } from "next"
import AuthService from "../services/AuthService"
import { LoginDTO } from "../dtos/LoginDTO"
import { RegisterDTO } from "../dtos/RegisterDTO"
import { serialize } from "cookie"

{/*  A opção de secure por algum motivo tem que estar presente (Mesmo não tendo um env dedicado à desenvolvimento) 
Se retirar, não seta (Pode ser bug da lib cookie) */}
const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV !== "development",
  sameSite: "strict" as const,
  maxAge: 86400,
  path: "/",
}

// Set dos cookies de algumas informações do usuário
const setCookies = (
  res: NextApiResponse,
  token: string,
  email: string,
  userId: number
) => {
  const cookieToken = serialize("token", token, {
    ...COOKIE_OPTIONS,
    httpOnly: true,
  })
  // Basicamente só facilita algumas queries. Dá pra fazer tudo via serverside sem cookies, mas dá um trabalho a mais.
  const cookieEmail = serialize("email", email, COOKIE_OPTIONS)
  const cookieUserId = serialize("userId", userId.toString(), COOKIE_OPTIONS)

  res.setHeader("Set-Cookie", [cookieToken, cookieEmail, cookieUserId])
}

// Classe de controller do auth 
class AuthController {
  // Controller de login
  async login(req: NextApiRequest, res: NextApiResponse) {
    const loginData: LoginDTO = req.body
    const result = await AuthService.login(loginData)

    // Se estiver tudo certo com a req e os dados corretamente definidos, seta os cookies pós login
    if (result.status === 200) {
      if (result.data.token && result.data.userId) {
        setCookies(res, result.data.token, loginData.email, result.data.userId)
      }
    }

    return res.status(result.status).json(result.data)
  }

  // Controller de register
  async register(req: NextApiRequest, res: NextApiResponse) {
    const registerData: RegisterDTO = req.body
    const result = await AuthService.register(registerData)

    // Basicamente faz a mesma coisa do controller do login, entretanto são dividos para possíveis futuras adições
    if (result.status === 201) {
      if (result.data.token && result.data.user) {
        setCookies(
          res,
          result.data.token,
          registerData.email,
          result.data.user.id
        )
      }
    }

    return res.status(result.status).json(result.data)
  }
}

export default new AuthController()
