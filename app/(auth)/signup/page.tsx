"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { registerSchema, RegisterInput } from "@/lib/validation"

export default function Register() {
  const router = useRouter()
  const [error, setError] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true)
    setError(undefined)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao registrar")
      }

      router.push("/setup")
    } catch (error: any) {
      setError(error.message || "Erro ao registrar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <div className="flex items-center justify-center max-h-[90vh] min-h-[90vh]">
        <div className="fixed right-4 top-4 lg:block hidden">
          <ModeToggle />
        </div>
        <Card className="w-[90vw] lg:w-[400px] flex-row">
          <CardTitle className="flex text-4xl pt-10 items-center justify-center">
            SimpleFinance
          </CardTitle>
          <CardDescription className="pt-4 text-center">
            Faça seu registro abaixo
          </CardDescription>
          <Separator className="mt-10"></Separator>
          <CardContent className="pt-10 pl-4 pb-3">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nome">Nome</Label>
                    <Input
                      id="nome"
                      placeholder="John"
                      {...register("nome")}
                      className={errors.nome ? "border-red-500" : ""}
                    />
                    {errors.nome && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.nome.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sobrenome">Sobrenome</Label>
                    <Input
                      id="sobrenome"
                      placeholder="Doe"
                      {...register("sobrenome")}
                      className={errors.sobrenome ? "border-red-500" : ""}
                    />
                    {errors.sobrenome && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.sobrenome.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
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
                    placeholder="No mínimo 8 dígitos"
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
                {loading ? "Registrando..." : "Registrar"}
              </Button>
              {error && (
                <p className="mt-4 text-center text-red-500 transition text-sm">
                  {error}
                </p>
              )}
            </form>
          </CardContent>
          <CardFooter className="text-center justify-center mt-auto py-4">
            <div className="text-center justify-center mt-auto">
              <a
                href="/signin"
                className="text-center text-sm mb-2 hover:text-sky-400 text-slate-500 transition duration-300"
              >
                Logar com minha conta
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </ThemeProvider>
  )
}
