"use client"
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/app/components/ui/chart"
import { useEffect, useState } from "react"
import { Button } from "@/app/components/ui/button"
import { PlusCircle } from "lucide-react"
import CreateTransaction from "@/app/components/sidebar/CreateTransactions"

const chartConfig = {
  graphlabel: {
    label: "Comparativo",
  },
  income: {
    label: "Receitas",
    color: "#2563eb",
  },
  expense: {
    label: "Despesas",
    color: "#60a5fa",
  },
} satisfies ChartConfig

const exampleChartData = [
  { month: "Janeiro", income: 5000, expense: 3500 },
  { month: "Fevereiro", income: 5200, expense: 3800 },
  { month: "Março", income: 6150, expense: 4200 },
  { month: "Abril", income: 5800, expense: 3900 },
  { month: "Maio", income: 6300, expense: 4100 },
  { month: "Junho", income: 5900, expense: 4000 },
]

const BarChartComponent = () => {
  const [chartData, setChartData] = useState<
    { month: string; income: number; expense: number }[]
  >([])
  const [isExample, setIsExample] = useState(false)
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/transactions/get-comparison")
        if (!response.ok) throw new Error("Erro 500")
        const data: { [month: string]: { income: number; expense: number } } =
          await response.json()

        if (Object.keys(data).length === 0) {
          setChartData(exampleChartData)
          setIsExample(true)
          return
        }

        const sortedMonths = Object.keys(data).sort(
          (a, b) => parseInt(a) - parseInt(b)
        )

        const translatedData = sortedMonths.map((month) => ({
          month: translateMonth(parseInt(month)),
          income: data[month].income,
          expense: data[month].expense,
        }))

        setChartData(translatedData)
        setIsExample(false)
      } catch (error) {
        console.error(error)
        setChartData(exampleChartData)
        setIsExample(true)
      }
    }

    fetchData()
  }, [])

  const translateMonth = (month: number) => {
    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ]
    return monthNames[month - 1]
  }

  return (
    <div className="relative">
      {isExample && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-sm bg-background/5">
          <p className="text-xl font-semibold mb-2 text-center px-4">
            Você ainda não possui transações
          </p>
          <p className="text-sm text-muted-foreground mb-4 text-center px-4">
            Crie sua primeira transação para começar a controlar suas finanças
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
      <div className={isExample ? "blur-xl opacity-50" : ""}>
        <ChartContainer config={chartConfig} className="md:min-h-[400px] min-h-[180px] w-full">
          <ResponsiveContainer width="100%" height={600}>
            <BarChart data={chartData}>
              <XAxis 
                dataKey="month"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <CartesianGrid vertical={false} />
              <ChartTooltip
                content={
                  <ChartTooltipContent labelKey="graphlabel" nameKey="month" />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="income"
                fill={chartConfig.income.color}
                radius={4}
                name="Receitas: R$"
              />
              <Bar
                dataKey="expense"
                fill={chartConfig.expense.color}
                radius={4}
                name="Despesas: R$"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <CreateTransaction 
        isOpen={isTransactionDialogOpen}
        onOpenChange={setIsTransactionDialogOpen}
      />
    </div>
  )
}

export default BarChartComponent
