import { NextRequest } from "next/server"
import PaymentController from "../../controller/PaymentController"

export async function POST(request: NextRequest) {
  return PaymentController.generatePix(request)
} 