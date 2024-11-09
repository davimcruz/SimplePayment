import { NextRequest } from "next/server"
import BillController from "../../controller/BillController"

export async function GET(request: NextRequest) {
  return BillController.getParcels(request)
} 