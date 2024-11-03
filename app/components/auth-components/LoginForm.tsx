"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardDescription, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, LoginInput } from "@/lib/validation"

export default function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onChange"
  })

  const onSubmit = async (data: LoginInput) => {
    try {
      setLoading(true)
      setError(null)

      router.prefetch('/dashboard')

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        cache: 'no-store'
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "Credenciais inválidas.")
      }

      router.push('/dashboard', { scroll: false })
      router.refresh()
      
    } catch (err: any) {
      setError(err.message || "Erro ao tentar fazer login.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
      <Card className="w-full max-w-lg bg-gradient-to-tr from-background/10 to-primary/10">
        <div className="p-6 lg:p-10">
          <CardTitle className="text-2xl lg:text-3xl font-bold text-center mb-2 lg:mb-3">
            Bem-vindo de volta
          </CardTitle>
          <CardDescription className="text-base lg:text-base text-center mb-6 lg:mb-8">
            Faça login para acessar sua conta
          </CardDescription>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4 lg:space-y-5">
              <div>
                <Label htmlFor="email" className="text-sm lg:text-base font-medium">
                  Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  {...register("email")}
                  className={`mt-1 lg:mt-2 h-10 lg:h-11 text-base ${errors.email ? "border-red-500" : ""}`}
                />
                {errors.email && (
                  <p className="mt-1 lg:mt-2 text-xs lg:text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="text-sm lg:text-base font-medium">
                  Senha
                </Label>
                <Input
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={`mt-1 lg:mt-2 h-10 lg:h-11 text-base ${errors.password ? "border-red-500" : ""}`}
                />
                {errors.password && (
                  <p className="mt-1 lg:mt-2 text-xs lg:text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {error && (
              <p className="text-center text-xs lg:text-sm text-red-600">{error}</p>
            )}

            <Button 
              className="w-full h-10 lg:h-11 text-base font-semibold" 
              type="submit" 
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/signup"
              className="text-sm lg:text-base text-muted-foreground hover:text-primary transition-colors"
            >
              Ainda não tem uma conta? Cadastre-se
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
