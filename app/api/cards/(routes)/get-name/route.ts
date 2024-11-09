import { NextRequest } from "next/server"
import CardController from "../../controller/CardController"

export async function POST(request: NextRequest) {
  return CardController.getCardName(request)
} 