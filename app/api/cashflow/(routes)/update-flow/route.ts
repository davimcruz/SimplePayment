import { NextRequest } from "next/server"
import CashflowController from "../../controller/CashflowController"

export async function PUT(request: NextRequest) {
  return CashflowController.updateFlow(request)
} 