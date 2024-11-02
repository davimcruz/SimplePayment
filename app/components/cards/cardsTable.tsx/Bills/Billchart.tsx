import React, { memo } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/components/ui/chart"
import { monthNames } from "@/utils/monthNames"

interface BillChartProps {
  bills: Array<{
    mes: number
    valorTotal: number
  }>
}

const chartConfig = {
  valor: {
    label: "Valor da Fatura",
    color: "#2563eb",
  },
} satisfies ChartConfig

const BillChart = memo(({ bills }: BillChartProps) => {
  const allMonths = monthNames.map((month, index) => ({
    month: month,
    valor: 0, // valor padrão zero
    mes: index + 1
  }))

  bills.forEach((bill) => {
    const monthIndex = bill.mes - 1
    if (monthIndex >= 0 && monthIndex < allMonths.length) {
      allMonths[monthIndex].valor = bill.valorTotal
    }
  })

  const chartData = allMonths.slice(-6) 

  return (
    <Card className="h-[500px]">
      <CardHeader>
        <CardTitle>Evolução das Faturas</CardTitle>
        <CardDescription>
          Valor das faturas nos últimos meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
            height={350}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
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
              domain={[0, 'auto']}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="valor"
              type="monotone"
              fill="#2563eb"
              fillOpacity={0.4}
              stroke="#2563eb"
              baseValue={0}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
})

BillChart.displayName = "BillChart"

export default BillChart
