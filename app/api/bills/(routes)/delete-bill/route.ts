import { NextRequest } from "next/server"
import BillController from "../../controller/BillController"

export async function DELETE(request: NextRequest) {
  return BillController.deleteBill(request)
} 