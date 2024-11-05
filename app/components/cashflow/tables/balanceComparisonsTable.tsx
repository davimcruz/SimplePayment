"use client"

import { useMemo } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Skeleton } from "@/app/components/ui/skeleton"
import { exampleFlows } from "@/utils/exampleData"
import { PlusCircle } from "lucide-react"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { useRouter } from "next/navigation"
import { Separator } from "../../ui/separator"

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

interface BalanceComparisonTableProps {
  data: FlowItem[]
  loading: boolean
  setData: (data: FlowItem[]) => void
  onAnalyze: () => void
  isAnalyzing: boolean
}

const BalanceComparisonTable = ({
  data,
  loading,
  setData,
  onAnalyze,
  isAnalyzing,
}: BalanceComparisonTableProps) => {
  const router = useRouter()
  const isExample = useMemo(() => {
    return JSON.stringify(data) === JSON.stringify(exampleFlows)
  }, [data])

  const currentYear = new Date().getFullYear()

  const handleUpdateBudgetClick = () => {
    router.push("/dashboard/setup")
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12">
      <Card className="mx-auto max-w-5xl lg:max-w-none bg-gradient-to-t from-background/10 to-primary/[5%] relative">
        <div className={isExample ? "blur-md bg-background/20" : ""}>
          <CardHeader>
            <CardTitle>Fluxo de Caixa</CardTitle>
            <CardDescription>
              Acompanha seu fluxo de caixa para o ano de {currentYear}
            </CardDescription>
          </CardHeader>
          <Separator className="w-full" />
          <CardContent className="p-0 sm:p-6">
            {loading ? (
              <Skeleton className="h-[250px]" />
            ) : (
              <DataTable
                columns={columns}
                data={data}
                onAnalyze={onAnalyze}
                isAnalyzing={isAnalyzing}
              />
            )}
          </CardContent>
        </div>

        {isExample && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4">
            <p className="text-lg sm:text-xl font-semibold mb-2 text-center">
              Você ainda não criou seu fluxo de caixa
            </p>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Crie seu fluxo de caixa para começar a controlar suas finanças
            </p>
            <Button variant="outline" onClick={handleUpdateBudgetClick}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Criar Fluxo de Caixa
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

export default BalanceComparisonTable
