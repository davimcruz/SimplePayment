import AuthController from "../../controllers/AuthController"

export async function POST(request: Request) {
  return AuthController.register(request)
} 