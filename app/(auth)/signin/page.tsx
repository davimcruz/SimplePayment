"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Separator } from "@/app/components/ui/separator"

import { ModeToggle } from "@/app/components/theme/toggleTheme"
import { ThemeProvider } from "@/app/components/theme/theme-provider"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, LoginInput } from "@/lib/validation"


export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        router.push("/dashboard")
      } else {
        setError(result.error || "Credenciais inválidas.")
      }
    } catch (err) {
      setError("Erro ao tentar fazer login.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <div
        className="flex items-center justify-center max-h-[90vh] min-h-[90vh]"
      >
        <div className="fixed right-4 top-4 lg:block hidden">
          <ModeToggle />
        </div>
        <Card className="w-[90vw] lg:w-[400px] flex-row">
          <CardTitle className="flex text-4xl pt-10 items-center justify-center">
            SimpleFinance
          </CardTitle>
          <CardDescription className="pt-4 text-center">
            Faça login com sua conta
          </CardDescription>
          <Separator className="mt-10" />
          <CardContent className="pt-10 pl-4 pb-3">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid max-w-sm gap-5 mx-auto">
                <div>
                  <Label htmlFor="email">Email:</Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="simplefinance@example.com"
                    {...register("email")}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="password">Senha:</Label>
                  <Input
                    type="password"
                    id="password"
                    placeholder="Sua senha"
                    {...register("password")}
                    className={errors.password ? "border-red-500" : ""}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>
              <Button
                className="mt-8 w-full transition duration-300 ease-in-out"
                type="submit"
                disabled={loading}
              >
                {loading ? "Logando..." : "Logar"}
              </Button>
              {error && (
                <p className="mt-4 text-center text-sm text-red-600">{error}</p>
              )}
            </form>
          </CardContent>
          <CardFooter className="text-center justify-center mt-auto py-4">
            <div className="text-center justify-center mt-auto">
              <Link
                href="/signup"
                className="text-center text-sm mb-2 hover:text-sky-400 text-slate-500 transition duration-300"
              >
                Não possuo uma conta
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </ThemeProvider>
  )
}
