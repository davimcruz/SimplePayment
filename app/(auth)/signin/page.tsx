"use client"
import LeftSide from "@/app/components/auth-components/LeftSide"
import LoginForm from "@/app/components/auth-components/LoginForm"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <LeftSide />
      <LoginForm />
    </div>
  )
}
