import { useEffect, useState } from "react"
import { parseCookies } from "nookies"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import { ArrowDownUp } from "lucide-react"
import { Skeleton } from "@/app/components/ui/skeleton"

interface Flow {
  mes: number
  ano: number
  gapPercentage: number
  status: 'excedente' | 'deficit'
  nome: string
}

const BudgetCard = () => {
  const [flowData, setFlowData] = useState<Flow | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cookies = parseCookies()
        const userId = cookies.userId
        
        if (!userId) {
          setError(true)
          return
        }

        const response = await fetch(`/api/cashflow/get-flow?userId=${userId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Erro ao buscar dados')
        }

        const currentMonth = new Date().getMonth() + 1
        const currentFlow = data.flows.find((flow: Flow) => flow.mes === currentMonth)

        if (currentFlow) {
          setFlowData(currentFlow)
        } else {
          setError(true)
        }
      } catch (err) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <Skeleton className="rounded-lg shadow-md p-4 h-[125px]" />
  }

  if (error || !flowData) {
    return (
       <Card className="bg-gradient-to-br from-background/10 to-primary/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Gap Orçamentário
          </CardTitle>
          <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0%</div>
          <p className="text-xs text-muted-foreground">
            Nenhum fluxo de caixa encontrado
          </p>
        </CardContent>
      </Card>
    )
  }
  const correctPercentage = flowData.gapPercentage * 100
  const formattedGap = `${correctPercentage.toFixed(2)}%`
  const statusFlag = flowData.status === "excedente" ? "↑" : "↓"

  return (
    <Card className="bg-gradient-to-br from-background/10 to-primary/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Gap Orçamentário</CardTitle>
        <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {statusFlag} {formattedGap}
        </div>
        <p className="text-xs text-muted-foreground">
          Status para o mês de {flowData.nome}:{" "}
          <span className="font-bold">
            {flowData.status === "excedente" ? "Superávit" : "Déficit"}
          </span>
        </p>
      </CardContent>
    </Card>
  )
}

export default BudgetCard
