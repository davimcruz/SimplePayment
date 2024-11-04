import { useState, useEffect } from "react"
import { parseCookies } from "nookies"

interface User {
  id: number
  nome: string
  email: string
  permissao: "free" | "pro"
  sobrenome: string
  image?: string
}

export function useUserData() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { userId } = parseCookies()

        if (!userId) {
          throw new Error("Usuário não autenticado")
        }

        const response = await fetch(`/api/users/get-user?userId=${userId}`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || "Erro ao buscar dados do usuário")
        }

        if (!data.id || !data.permissao) {
          throw new Error("Dados do usuário incompletos ou inválidos")
        }

        setUser({
          id: data.id,
          nome: data.nome || "",
          email: data.email || "",
          permissao: data.permissao,
          sobrenome: data.sobrenome || "",
          image: data.image,
        })

      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido")
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  return {
    user,
    loading,
    error,
    refreshUserData: async () => {
      setLoading(true)
      const fetchUserData = async () => {
        try {
          const { userId } = parseCookies()

          if (!userId) {
            throw new Error("Usuário não autenticado")
          }

          const response = await fetch(`/api/users/get-user?userId=${userId}`)
          const data = await response.json()
          
          if (!response.ok) {
            throw new Error(data.error || "Erro ao buscar dados do usuário")
          }

          if (!data.id || !data.permissao) {
            throw new Error("Dados do usuário incompletos ou inválidos")
          }

          setUser({
            id: data.id,
            nome: data.nome || "",
            email: data.email || "",
            permissao: data.permissao,
            sobrenome: data.sobrenome || "",
            image: data.image,
          })

        } catch (err) {
          setError(err instanceof Error ? err.message : "Erro desconhecido")
          setUser(null)
        } finally {
          setLoading(false)
        }
      }
      await fetchUserData()
    },
  }
}
