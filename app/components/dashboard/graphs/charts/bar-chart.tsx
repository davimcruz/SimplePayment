"use client"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/app/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/components/ui/chart"
import { useEffect, useState } from "react"
import { ResponsiveContainer } from "recharts"
import { useYear } from '@/app/contexts/YearContext';

const chartConfig = {
  income: {
    label: "Receitas",
    color: "rgb(16, 185, 129)",
  },
  expense: {
    label: "Despesas",
    color: "rgb(6, 78, 59)",
  },
} satisfies ChartConfig

const exampleChartData = [
  { month: "Jan", income: 5000, expense: 3500 },
  { month: "Fev", income: 5200, expense: 3800 },
  { month: "Mar", income: 6150, expense: 4200 },
  { month: "Abr", income: 5800, expense: 3900 },
  { month: "Mai", income: 6300, expense: 4100 },
  { month: "Jun", income: 5900, expense: 4000 },
]

const BarChartComponent = () => {
  const { selectedYear } = useYear();
  const [chartData, setChartData] = useState<
    { month: string; income: number; expense: number }[]
  >([])
  const [isExample, setIsExample] = useState(false)
  const [trend, setTrend] = useState<{
    percentage: number;
    isUp: boolean;
  }>({ percentage: 0, isUp: true })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/transactions/get-comparison")
        if (!response.ok) throw new Error("Erro 500")
        const data = await response.json()


        const getYearFromDate = (date: string) => {
          return date.includes('/') 
            ? date.split('/')[2] 
            : date.split('-')[2]
        }

        const getMonthFromDate = (date: string) => {
          return date.includes('/') 
            ? date.split('/')[1] 
            : date.split('-')[1]
        }

        const filteredData = Object.entries(data).reduce((acc, [date, values]) => {
          const year = getYearFromDate(date)
          if (year === selectedYear) {
            acc[date] = values;
          }
          return acc;
        }, {} as any);

        if (Object.keys(filteredData).length === 0) {
          setChartData(exampleChartData)
          setIsExample(true)
          return
        }

        const sortedDates = Object.keys(filteredData).sort(
          (a, b) => parseInt(getMonthFromDate(a)) - parseInt(getMonthFromDate(b))
        )

        const translatedData = sortedDates.map((date) => ({
          month: translateMonth(parseInt(getMonthFromDate(date))),
          income: filteredData[date].income,
          expense: filteredData[date].expense,
        }))

        setChartData(translatedData)
        setIsExample(false)
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
        setChartData(exampleChartData)
        setIsExample(true)
      }
    }

    fetchData()
  }, [selectedYear])

  const translateMonth = (month: number) => {
    const monthNames = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ]
    return monthNames[month - 1]
  }

  const getExpenseAnalysis = () => {
    if (!chartData.length) return null

    const maxExpense = chartData.reduce((max, curr) => 
      curr.expense > max.expense ? curr : max
    )

    const minExpense = chartData.reduce((min, curr) => 
      curr.expense < min.expense ? curr : min
    )

    return {
      maxMonth: maxExpense.month,
      maxValue: maxExpense.expense,
      minMonth: minExpense.month,
      minValue: minExpense.expense
    }
  }

  const analysis = getExpenseAnalysis()

  return (
    <Card className="w-full h-full bg-gradient-to-tl from-background/10 to-primary/[5%] flex flex-col">
      <CardHeader>
        <CardTitle>
          Resumo Gráfico Comparativo ({selectedYear})
        </CardTitle>
        <CardDescription>Comparativo de Receitas e Despesas</CardDescription>
      </CardHeader>
      
      <CardContent className="px-6 pt-6 pb-0 flex-1">
        <div className="relative h-full">
          {isExample && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-xl">
              <p className="text-xl font-semibold mb-2 text-center">
                Sem dados para {selectedYear}
              </p>
              <p className="text-sm text-muted-foreground text-center px-4">
                Não existem transações registradas para este ano
              </p>
            </div>
          )}
          
          <div className={isExample ? "blur-xl opacity-50" : ""}>
            <ChartContainer config={chartConfig}>
              <BarChart
                className="mt-12"
                width={window.innerWidth < 768 ? 350 : 450}
                height={350}
                data={isExample ? exampleChartData : chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar
                  dataKey="income"
                  fill={chartConfig.income.color}
                  radius={[4, 4, 0, 0]}
                  name="Receitas"
                />
                <Bar
                  dataKey="expense"
                  fill={chartConfig.expense.color}
                  radius={[4, 4, 0, 0]}
                  name="Despesas"
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>

      {!isExample && analysis && (
        <CardFooter className="px-6 py-4 text-sm text-muted-foreground">
          <div className="flex flex-col gap-1">
            <p>
              Maior gasto em: <span className="font-medium text-foreground">{analysis.maxMonth}</span> -{" "}
              <span className="font-medium text-foreground">
                {new Intl.NumberFormat('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                }).format(analysis.maxValue)}
              </span>
            </p>
            <p>
              Menor gasto em: <span className="font-medium text-foreground">{analysis.minMonth}</span> - {" "}
              <span className="font-medium text-foreground">
                {new Intl.NumberFormat('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                }).format(analysis.minValue)}
              </span>
            </p>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

export default BarChartComponent
