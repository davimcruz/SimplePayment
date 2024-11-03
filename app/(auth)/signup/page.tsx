import LeftSide from "@/app/components/auth-components/LeftSide"
import RegisterForm from "@/app/components/auth-components/RegisterForm"

export default function Register() {
  return (
    <div className="flex min-h-screen">
      <LeftSide />
      <RegisterForm />
    </div>
  )
}
