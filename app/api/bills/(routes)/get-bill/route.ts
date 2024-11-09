import { NextRequest } from "next/server"
import BillController from "../../controller/BillController"

export async function POST(request: NextRequest) {
  return BillController.getBill(request)
} 