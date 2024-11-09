import { NextRequest } from "next/server"
import AdminController from "../../controller/AdminController"

export async function GET(request: NextRequest) {
  return AdminController.getStats(request)
} 