import { NextRequest } from "next/server"
import AdminController from "../../controller/AdminController"

export async function DELETE(request: NextRequest) {
  return AdminController.deleteUsers(request)
} 