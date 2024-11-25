"use client"
import { useState } from "react"
import Link from "next/link"
import { Card, CardDescription, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { toast } from "sonner"

type LoginData = {
  email: string;
  password: string;
}

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simular login
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Login realizado com sucesso!')
      window.location.href = '/dashboard'
    } catch (error) {
      toast.error('Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] -mt-12 md:-mt-0 w-full lg:w-1/2 flex items-center justify-center px-4 py-8 lg:p-8">
      <Card className="w-full max-w-[400px] lg:max-w-lg bg-gradient-to-tr from-background/10 to-primary/10">
        <div className="p-6 lg:p-10">
          <CardTitle className="text-2xl lg:text-3xl font-bold text-center mb-2">
            Bem-vindo de volta
          </CardTitle>
          <CardDescription className="text-base text-center mb-6">
            Faça login para acessar sua conta
          </CardDescription>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
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
                <Input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
            </div>

            <Button 
              className="w-full" 
              type="submit" 
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/signup"
              className="text-sm lg:text-base text-muted-foreground hover:text-primary"
            >
              Ainda não tem uma conta? Cadastre-se
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
