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

const SituacaoCard = ({ content }: { content: string }) => {
  const formatContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('- ')) {
        return (
          <li key={index} className="flex items-start gap-2 mb-2">
            <span>•</span>
            <span className="text-muted-foreground font-medium">{line.substring(2)}</span>
          </li>
        )
      }
      if (line.includes(':')) {
        const [title, content] = line.split(':')
        return (
          <div key={index} className="mb-2">
            <span className="font-semibold">{title}:</span>
            <span className="text-muted-foreground font-medium">{content}</span>
          </div>
        )
      }
      return <p key={index} className="text-muted-foreground font-medium mb-2">{line}</p>
    })
  }

  return (
    <div className="space-y-2">
      {formatContent(content)}
    </div>
  )
}

const PontosCard = ({ content }: { content: string }) => {
  const formatContent = (text: string) => {
    const sections = text.split('\n\n')
    return sections.map((section, sectionIndex) => {
      const lines = section.split('\n')
      const title = lines[0]
      const points = lines.slice(1)

      return (
        <div key={sectionIndex} className="mb-4">
          <h3 className="font-semibold text-base mb-2">{title}</h3>
          <ul className="space-y-1">
            {points.map((point, index) => (
              <li key={index} className="flex items-start gap-2">
                <span>•</span>
                <span className="text-muted-foreground font-medium">{point.substring(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )
    })
  }

  return <div>{formatContent(content)}</div>
}

const RecomendacoesCard = ({ content }: { content: string }) => {
  const formatContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.match(/^\d+\./)) {
        const [num, ...rest] = line.split('.')
        return (
          <div key={index} className="flex items-start gap-2 mb-2">
            <span className="font-semibold min-w-[20px]">{num}.</span>
            <span className="text-muted-foreground font-medium">{rest.join('.').trim()}</span>
          </div>
        )
      }
      return <p key={index} className="text-muted-foreground font-medium mb-2">{line}</p>
    })
  }

  return <div className="space-y-1">{formatContent(content)}</div>
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
    <div className="space-y-6 px-4 md:px-12">
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
              <CardTitle className="text-sm font-semibold">
                Situação Atual
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <SituacaoCard content={analysis.situacao} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-background/10 to-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">
                Pontos Fortes e Fracos
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <PontosCard content={analysis.pontos} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-background/10 to-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">
                Recomendações
              </CardTitle>
              <LineChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <RecomendacoesCard content={analysis.recomendacoes} />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

export default FinancialAnalysis 