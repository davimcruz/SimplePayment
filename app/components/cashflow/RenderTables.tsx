"use client"

import { useState, useEffect } from "react"
import { parseCookies } from "nookies"
import BalanceComparisonTable from "./tables/balanceComparisonsTable"
import BalanceComparisonChart from "./charts/balanceComparisonChart"
import { exampleFlows } from "@/utils/exampleData"
import FinancialAnalysis from "./analysis/FinancialAnalysis"

interface FlowItem {
  mes: number
  nome: string
  receitaOrcada: number
  despesaOrcada: number
  saldoOrcado: number
  receitaRealizada: number
  despesaRealizada: number
  saldoRealizado: number
  gapMoney: number
  gapPercentage: number
  status: string
}

interface BudgetTablesProps {
  isPro: boolean
}

const BudgetTables = ({ isPro }: BudgetTablesProps) => {
  const [data, setData] = useState<FlowItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [analysisLoading, setAnalysisLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const cookies = parseCookies()
      const userId = cookies.userId

      if (!userId) {
        console.error("User ID não encontrado nos cookies.")
        setData(exampleFlows)
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/cashflow/get-flow?userId=${userId}`)
        if (!response.ok) {
          throw new Error("Erro ao buscar dados")
        }
        const result = await response.json()
        
        if (!result.flows || result.flows.length === 0) {
          setData(exampleFlows)
          setLoading(false)
          return
        }

        const processedData = result.flows.map((flow: FlowItem) => {
          const percentageChange = flow.saldoOrcado !== 0 
            ? ((flow.saldoRealizado - flow.saldoOrcado) / Math.abs(flow.saldoOrcado))
            : 0
          
          return {
            ...flow,
            gapPercentage: percentageChange
          }
        })

        setData(processedData)
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
        setData(exampleFlows)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleAnalyze = () => {
    setShowAnalysis(prev => !prev)
    
    if (showAnalysis) {
      const analysisComponent = document.getElementById('financial-analysis')
      if (analysisComponent) {
        analysisComponent.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <div className="flex-col h-[calc(100vh-4rem)] w-full">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 py-6">
          <div className="w-full">
            {showAnalysis && (
              <div id="financial-analysis">
                <FinancialAnalysis 
                  setLoading={setAnalysisLoading}
                  isButtonLoading={analysisLoading}
                />
              </div>
            )}
            <div className={showAnalysis ? "mt-6" : ""}>
              <BalanceComparisonTable
                data={data}
                loading={loading}
                setData={setData}
                onAnalyze={handleAnalyze}
                isAnalyzing={analysisLoading}
                isPro={isPro}
              />
            </div>
          </div>
          <div className="w-full">
            <BalanceComparisonChart data={data} />
          </div> 
        </div>
      </div>
    </div>
  )
}

export default BudgetTables
