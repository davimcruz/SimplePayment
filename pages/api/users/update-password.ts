import { NextApiRequest, NextApiResponse } from "next"
import { UserController } from "./controller/UserController"

const userController = new UserController()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return await userController.updatePassword(req, res)
}
