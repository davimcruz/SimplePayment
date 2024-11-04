import { NextApiRequest, NextApiResponse } from "next"
import { AdminController } from "./controller/AdminController"

const adminController = new AdminController()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return adminController.getAllUsers(req, res)
}
