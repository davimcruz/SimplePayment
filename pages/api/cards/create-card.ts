import { NextApiRequest, NextApiResponse } from "next"
import CardController from "./controller/CardController"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return CardController.createCard(req, res)
}
