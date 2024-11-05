"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import UsersTable from "@/app/components/dashboard/admin/users/users-table"
import Cookies from "js-cookie"
import AnalysisResult from "./analysis-result"
import { Flow } from "@/types/analysis"

const AdminPage = () => {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [targetUserId, setTargetUserId] = useState("")
  const [analysis, setAnalysis] = useState<{
    analysis: string
    flows: Flow[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const userId = Cookies.get('userId')
        const response = await fetch(`/api/users/get-user?userId=${userId}`)
        const data = await response.json()

        if (!data || data.permissao !== 'admin') {
          router.push('/dashboard')
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        router.push('/dashboard')
      }
    }

    checkPermission()
  }, [router])

  const handleAnalysis = async () => {
    if (!targetUserId) {
      setError("Por favor, insira um ID de usuário")
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/ai/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: parseInt(targetUserId) }),
      })

      if (!response.ok) {
        throw new Error('Falha ao obter análise')
      }

      const responseData = await response.json()
      
      if (responseData.analysis === "Não há dados suficientes para análise.") {
        setError("Não há dados financeiros suficientes para este usuário.")
        setAnalysis(null)
        return
      }

      setAnalysis({
        analysis: responseData.analysis,
        flows: responseData.flows
      })
    } catch (error) {
      setError("Erro ao realizar análise. Tente novamente.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="h-full">Carregando...</h1>
      </div>
    )
  }

  if (isAuthorized) {
    return (
      <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className=" shadow-md">
          
          <UsersTable />

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

export default AdminPage
