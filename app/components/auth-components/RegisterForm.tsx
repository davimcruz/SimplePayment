"use client"
import { useState } from "react"
import Link from "next/link"
import { Card, CardDescription, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

type RegisterData = {
  nome: string;
  sobrenome: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterForm() {
  const [formData, setFormData] = useState<RegisterData>({
    nome: '',
    sobrenome: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    setLoading(true)

    try {
      // Simular registro
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Conta criada com sucesso!')
      window.location.href = '/dashboard'
    } catch (error) {
      toast.error('Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] -mt-12 md:-mt-0 w-full lg:w-1/2 flex items-center justify-center px-4 py-8 lg:p-8">
      <Card className="w-full max-w-[400px] lg:max-w-lg bg-gradient-to-tr from-background/10 to-primary/10">
        <div className="p-6 lg:p-10">
          <CardTitle className="text-2xl lg:text-3xl font-bold text-center mb-2">
            Crie sua conta
          </CardTitle>
          <CardDescription className="text-base text-center mb-6">
            Preencha os dados abaixo para começar
          </CardDescription>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    placeholder="John"
                    value={formData.nome}
                    onChange={e => setFormData({...formData, nome: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sobrenome">Sobrenome</Label>
                  <Input
                    id="sobrenome"
                    placeholder="Doe"
                    value={formData.sobrenome}
                    onChange={e => setFormData({...formData, sobrenome: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="No mínimo 8 dígitos"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirme sua senha</Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  placeholder="Digite sua senha novamente"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                />
              </div>
            </div>

            <Button 
              className="w-full" 
              type="submit" 
              disabled={loading}
            >
              {loading ? "Registrando..." : "Criar conta"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/signin"
              className="text-sm lg:text-base text-muted-foreground hover:text-primary"
            >
              Já tem uma conta? Faça login
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
