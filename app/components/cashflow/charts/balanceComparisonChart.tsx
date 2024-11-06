"use client"

import { TrendingUp, TrendingDown, PlusCircle } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/app/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/components/ui/chart"
import { exampleFlows } from "@/utils/exampleData"
import { useMemo, useState } from "react"
import CreateTransaction from "../../dashboard/create-transactions/CreateTransactions"
import { Separator } from "../../ui/separator"

interface FlowItem {
  mes: number
  nome: string
  saldoOrcado: number
  saldoRealizado: number
  gapPercentage: number
}

interface BalanceComparisonChartProps {
  data: FlowItem[]
}

const chartConfig = {
  orcado: {
    label: "Orçado",
    color: "hsl(var(--chart-1))",
  },
  realizado: {
    label: "Realizado",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const BalanceComparisonChart = ({ data }: BalanceComparisonChartProps) => {
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)

  const isExample = useMemo(() => {
    return JSON.stringify(data) === JSON.stringify(exampleFlows)
  }, [data])

  const chartData = data.map((item) => ({
    month: item.nome,
    orcado: item.saldoOrcado,
    realizado: item.saldoRealizado,
  }))

  const currentMonth = new Date().getMonth() + 1
  const currentMonthData = data.find(item => item.mes === currentMonth)
  const trend = currentMonthData?.gapPercentage || 0
  const isTrendingUp = trend > 0

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12">
      <Card className="w-full bg-gradient-to-t from-background/10 to-primary/[5%]">
        <div className={`${isExample ? "blur-md " : ""}`}>
          <CardHeader>
            <div className="flex-col md:flex-row flex justify-between items-center">
              <div className="flex flex-col gap-2">
                <CardTitle>Comparativo de Saldos</CardTitle>
                <CardDescription>
                  Comparação entre o saldo orçado e o saldo realizado
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 font-normal text-zinc-300 text-sm leading-none text-center mt-6 md:mt-0">
                {isTrendingUp ? "Acima" : "Abaixo"} do orçado em{" "}
                {Math.abs(trend * 100).toFixed(2)}% este mês{" "}
                {isTrendingUp ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </CardHeader>
          <Separator className="mb-4" />
          <CardContent>
            <ChartContainer config={chartConfig}>
              <AreaChart
                data={chartData}
                margin={{
                  left: 48,
                  right: 12,
                  top: 12,
                  bottom: 12,
                }}
                height={80}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      notation: "compact",
                    }).format(value)
                  }
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <defs>
                  <linearGradient id="fillOrcado" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-orcado)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-orcado)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient
                    id="fillRealizado"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--color-realizado)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-realizado)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="orcado"
                  stroke="var(--color-orcado)"
                  fill="url(#fillOrcado)"
                  fillOpacity={0.4}
                />
                <Area
                  type="monotone"
                  dataKey="realizado"
                  stroke="var(--color-realizado)"
                  fill="url(#fillRealizado)"
                  fillOpacity={0.4}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </div>

        {isExample && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
            <p className="text-xl font-semibold mb-2 text-center px-4">
              Você ainda não criou seu fluxo de caixa
            </p>
            <p className="text-sm text-muted-foreground mb-4 text-center px-4">
              Crie seu fluxo de caixa para começar a controlar suas finanças
            </p>
            {/* <Button
            variant="outline"
            onClick={() => setIsTransactionDialogOpen(true)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Criar Transação
          </Button> */}
          </div>
        )}

        <CreateTransaction
          isOpen={isTransactionDialogOpen}
          onOpenChange={setIsTransactionDialogOpen}
        />
      </Card>
    </div>
  )
}

export default BalanceComparisonChart 