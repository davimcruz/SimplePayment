import { NextRequest } from "next/server"
import CashflowController from "../../controller/CashflowController"

export async function POST(request: NextRequest) {
  return CashflowController.createFlow(request)
} 