"use client"
import { useEffect, useState } from "react"
import { ThemeProvider } from "@/app/components/theme/theme-provider"
import Header from "@/app/components/header/HeaderComponent"
import UpdateFlow from "@/app/components/cashflow/UpdateFlow"
import { useRouter } from "next/navigation"

const CashFlow = () => {
  const router = useRouter() 
  const [user, setUser] = useState<{
    nome: string
    sobrenome: string
    image?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      const userIdCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("userId="))
      if (!userIdCookie) {
        router.push("/auth/signin") // Redireciona se o cookie não existir
        return
      }

      const userId = userIdCookie.split("=")[1]
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/get-user?userId=${userId}`
        )
        const userData = await response.json()

        if (!response.ok) {
          throw new Error("Erro ao buscar dados do usuário")
        }

        setUser(userData)
      } catch (error) {
        console.error("Erro ao buscar os dados do usuário:", error)
        setError("Erro ao buscar os dados do usuário.")
        router.push("/auth/signin") // Redireciona em caso de erro
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <div className="flex min-h-screen w-full flex-col">
        <Header userImage={user?.image} />
        <div className="flex min-h-[80vh] flex-col items-center justify-center p-6">
          <main className="flex flex-col items-center justify-center flex-1 gap-8 px-4 py-16 lg:px-0">
            <UpdateFlow />
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default CashFlow
