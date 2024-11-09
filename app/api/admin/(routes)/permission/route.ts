import { NextRequest } from "next/server"
import AdminController from "../../controller/AdminController"

export async function PATCH(request: NextRequest) {
  return AdminController.updateUserPermission(request)
} 