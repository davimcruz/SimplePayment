import { Inter } from "next/font/google"
import { FormEvent, useState } from "react"
import { useRouter } from "next/router"
import Image from "next/image"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

import "../../../app/globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function Register() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (password.length < 8) {
      setError("Sua senha deve ter pelo menos 8 dígitos")
      return
    }

    try {
      setLoading(true)

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error("Erro ao registrar novo usuário")
      }

      router.push("/auth/signup/success")
    } catch (error: any) {
      setError("Este e-mail já foi cadastrado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`${inter.className} flex items-center lg:justify-center lg:h-screen bg-slate-50`}
    >
      <Card className="w-[400px] flex-row transition-all duration-300 ">
        <CardTitle className="pt-10 text-center">
        </CardTitle>
        <CardDescription className="pt-4 text-center">
          Faça seu registro abaixo
        </CardDescription>
        <Separator className="mt-10"></Separator>
        <CardContent className="pt-10 pl-4 pb-3">
          <form onSubmit={handleSubmit}>
            <div className="grid max-w-sm gap-5 mx-auto">
              <div>
                <Label htmlFor="email">Email:</Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="simplefinance@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password">Senha:</Label>
                <Input
                  type="password"
                  id="password"
                  placeholder="No mínimo 8 dígitos"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <Button
              className="mt-8 w-full transition duration-300 ease-in-out"
              type="submit"
              disabled={loading}
            >
              {loading ? "Registrando..." : "Registrar"}{" "}
            </Button>
            {error && (
              <p className="text-red-500 mt-4 text-center transition duration-300 ease-in-out">
                {error}
              </p>
            )}
          </form>
        </CardContent>
        <CardFooter className="text-center justify-center mt-auto py-4">
          <div className="text-center justify-center mt-auto">
            <a
              href="./signin"
              className="text-center text-sm mb-2 hover:text-sky-400 text-slate-500"
            >
              Logar com minha conta
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
