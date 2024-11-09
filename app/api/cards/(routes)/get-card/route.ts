import { NextRequest } from "next/server"
import CardController from "../../controller/CardController"

export async function GET(request: NextRequest) {
  return CardController.getCard(request)
} 