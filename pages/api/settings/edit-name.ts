import { NextApiRequest, NextApiResponse } from "next"
import { updateNameHandler } from "./controllers/SettingsController"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return updateNameHandler(req, res)
}
