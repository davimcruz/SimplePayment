import { NextRequest } from "next/server"
import UserController from "../../controller/UserController"

export async function POST(request: NextRequest) {
  return UserController.deleteTransactions(request)
} 