import { NextApiRequest, NextApiResponse } from "next"
import { AdminController } from "./controller/AdminController"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const controller = new AdminController()
  return controller.getAllSells(req, res)
}
