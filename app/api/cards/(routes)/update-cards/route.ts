import { NextRequest } from "next/server"
import CardController from "../../controller/CardController"

export async function PUT(request: NextRequest) {
  return CardController.updateCard(request)
} 