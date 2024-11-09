import { NextRequest } from "next/server"
import TransactionController from "../../controller/TransactionController"

export async function POST(request: NextRequest) {
  return TransactionController.deleteTransaction(request)
} 