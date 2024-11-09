import { NextRequest } from "next/server"
import UserController from "../../controller/UserController"

export async function PATCH(request: NextRequest) {
  return UserController.updatePassword(request)
} 