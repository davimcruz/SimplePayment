import { NextRequest } from "next/server"
import CashflowController from "../../controller/CashflowController"

export async function GET(request: NextRequest) {
  return CashflowController.getFlow(request)
} 