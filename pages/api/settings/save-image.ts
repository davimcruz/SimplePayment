import { NextApiRequest, NextApiResponse } from "next"
import { saveImageHandler } from "./controllers/SettingsController"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return saveImageHandler(req, res)
}
