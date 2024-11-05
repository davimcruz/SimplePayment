"use client"

import { useState, useEffect, useRef } from "react"
import { parseCookies } from "nookies"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Skeleton } from "@/app/components/ui/skeleton"
import { toast } from "sonner"
import { TrendingUp, Target, LineChart } from "lucide-react"

interface AnalysisParts {
  situacao: string
  pontos: string
  recomendacoes: string
}

interface FinancialAnalysisProps {
  setLoading: (loading: boolean) => void
  isButtonLoading: boolean
}

const FinancialAnalysis = ({ 
  setLoading, 
  isButtonLoading
}: FinancialAnalysisProps) => {
  const [analysis, setAnalysis] = useState<AnalysisParts | null>(null)
  const isAnalyzing = useRef(false)

  const handleAnalyze = async () => {
    if (isAnalyzing.current) return
    
    const cookies = parseCookies()
    const userId = cookies.userId

    if (!userId) {
      toast.error("Usuário não identificado")
      return
    }

    isAnalyzing.current = true
    setLoading(true)
    const toastId = toast.loading("Analisando dados financeiros...")

    try {
      const response = await fetch("/api/ai/analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message, { id: toastId })
        return
      }

      const parts = extractAnalysisParts(data.analysis)
      setAnalysis(parts)
      toast.success("Análise concluída!", { id: toastId })
    } catch (error: any) {
      console.error("Erro na análise:", error)
      toast.error(error?.message || "Erro ao conectar com o servidor", { id: toastId })
    } finally {
      setLoading(false)
      isAnalyzing.current = false
    }
  }

  useEffect(() => {
    if (!analysis) {
      handleAnalyze()
    }
  }, [])

  const extractAnalysisParts = (analysisText: string): AnalysisParts => {
    const parts = {
      situacao: '',
      pontos: '',
      recomendacoes: ''
    }

    try {
      const analiseMatch = analysisText.match(/\[ANÁLISE\]([\s\S]*?)(?=\[PONTOS FORTES E FRACOS\]|$)/)
      const pontosMatch = analysisText.match(/\[PONTOS FORTES E FRACOS\]([\s\S]*?)(?=\[RECOMENDAÇÕES\]|$)/)
      const recomendacoesMatch = analysisText.match(/\[RECOMENDAÇÕES\]([\s\S]*?)$/)

      parts.situacao = analiseMatch ? analiseMatch[1].trim() : 'Análise não disponível'
      parts.pontos = pontosMatch ? pontosMatch[1].trim() : 'Análise não disponível'
      parts.recomendacoes = recomendacoesMatch ? recomendacoesMatch[1].trim() : 'Análise não disponível'
    } catch (error) {
      console.error('Erro ao extrair partes da análise:', error)
    }

    return parts
  }

  return (
    <div className="space-y-6 px-12">
      {isButtonLoading ? (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px] rounded-xl" />
          ))}
        </div>
      ) : analysis ? (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          <Card className="bg-gradient-to-br from-background/10 to-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Situação Atual
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm whitespace-pre-line">
                {analysis.situacao}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-background/10 to-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pontos Fortes e Fracos
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm whitespace-pre-line">
                {analysis.pontos}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-background/10 to-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recomendações
              </CardTitle>
              <LineChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm whitespace-pre-line">
                {analysis.recomendacoes}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

export default FinancialAnalysis 