import { NextRequest } from "next/server"
import CardController from "../../controller/CardController"

export async function PATCH(request: NextRequest) {
  return CardController.updateCard(request)
} 