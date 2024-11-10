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
import { registerSchema, RegisterInput } from "@/lib/validation"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

export default function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    criteriaMode: "all"
  })

  const password = watch("password")
  const confirmPassword = watch("confirmPassword")

  const onSubmit = async (data: RegisterInput) => {
    try {
      setLoading(true)
      setError(null)

      router.prefetch('/dashboard/setup')

      const { confirmPassword, ...registerData } = data

      toast.promise(
        fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registerData),
          cache: 'no-store'
        }).then(async (response) => {
          if (!response.ok) {
            const result = await response.json()
            throw new Error(result.error || "Erro ao registrar")
          }
          router.push('/dashboard/setup', { scroll: false })
          router.refresh()
        }),
        {
          loading: 'Criando sua conta...',
          success: 'Conta criada com sucesso!',
          error: 'Erro ao criar conta',
        }
      )

    } catch (error: any) {
      setError(error.message || "Erro ao registrar")
    } finally {
      setLoading(false)
    }
  }

  const isDisabled = Boolean(loading || errors.confirmPassword)

  return (
    <div className="min-h-[100dvh] -mt-12 md:-mt-0 w-full lg:w-1/2 flex items-center justify-center px-4 py-8 lg:p-8 overflow-hidden">
      <Card className="w-full max-w-[400px] lg:max-w-lg bg-gradient-to-tr from-background/10 to-primary/10">
        <div className="p-6 lg:p-10">
          <CardTitle className="text-2xl lg:text-3xl font-bold text-center mb-2 lg:mb-3">
            Crie sua conta
          </CardTitle>
          <CardDescription className="text-base text-center mb-6 lg:mb-8">
            Preencha os dados abaixo para começar
          </CardDescription>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <div className="space-y-4 lg:space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome" className="text-sm lg:text-base font-medium">
                    Nome
                  </Label>
                  <Input
                    id="nome"
                    autoComplete="given-name"
                    placeholder="John"
                    {...register("nome")}
                    className={`mt-1 lg:mt-2 h-10 lg:h-11 text-base ${errors.nome ? "border-red-500" : ""}`}
                  />
                  {errors.nome && (
                    <p className="mt-1 lg:mt-2 text-xs lg:text-sm text-red-600">
                      {errors.nome.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="sobrenome" className="text-sm lg:text-base font-medium">
                    Sobrenome
                  </Label>
                  <Input
                    id="sobrenome"
                    autoComplete="family-name"
                    placeholder="Doe"
                    {...register("sobrenome")}
                    className={`mt-1 lg:mt-2 h-10 lg:h-11 text-base ${errors.sobrenome ? "border-red-500" : ""}`}
                  />
                  {errors.sobrenome && (
                    <p className="mt-1 lg:mt-2 text-xs lg:text-sm text-red-600">
                      {errors.sobrenome.message}
                    </p>
                  )}
                </div>
              </div>

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
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    autoComplete="new-password"
                    placeholder="No mínimo 8 dígitos"
                    {...register("password")}
                    className={`mt-1 lg:mt-2 h-10 lg:h-11 text-base pr-10 ${errors.password ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 lg:mt-2 text-xs lg:text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm lg:text-base font-medium">
                  Confirme sua senha
                </Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Digite sua senha novamente"
                    {...register("confirmPassword")}
                    className={`mt-1 lg:mt-2 h-10 lg:h-11 text-base pr-10 ${
                      password && confirmPassword && password !== confirmPassword ? "border-red-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 lg:mt-2 text-xs lg:text-sm text-red-600">
                    As senhas não coincidem
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
              disabled={isDisabled}
            >
              {loading ? "Registrando..." : "Criar conta"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/signin"
              className="text-sm lg:text-base text-muted-foreground hover:text-primary transition-colors"
            >
              Já tem uma conta? Faça login
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
