import { NextRequest } from "next/server"
import SettingsController from "../../controller/SettingsController"

export async function POST(request: NextRequest) {
  return SettingsController.updateName(request)
} 