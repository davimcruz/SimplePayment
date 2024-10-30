import { NextApiRequest, NextApiResponse } from "next"
import AuthController from "./controllers/AuthController"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    return AuthController.login(req, res)
  } else {
    res.setHeader("Allow", ["POST"])
    return res.status(405).json({ error: "[ERRO] Método não permitido." })
  }
}
