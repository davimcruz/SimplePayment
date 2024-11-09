import { NextRequest } from "next/server"
import TransactionController from "../../controller/TransactionController"

export async function GET(request: NextRequest) {
  return TransactionController.getTransactions(request)
} 