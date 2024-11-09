import { NextRequest } from "next/server"
import PaymentController from "../../controller/PaymentController"

export async function GET(request: NextRequest) {
  return PaymentController.getPaymentStatus(request)
} 