import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/components/ui/chart"
import { monthNames } from "@/utils/monthNames"

interface Sale {
  id: string
  paymentId: string
  customerName: string
  customerEmail: string
  amount: number
  date: string
  plan: string
  userId: string
}

interface SalesStats {
  totalAmount: number
  totalSales: number
  averageTicket: number
}

const chartConfig = {
  valor: {
    label: "Valor das Vendas",
    color: "#2563eb",
  },
} satisfies ChartConfig

export function SalesComponent() {
  const [sales, setSales] = useState<Sale[]>([])
  const [stats, setStats] = useState<SalesStats>({
    totalAmount: 0,
    totalSales: 0,
    averageTicket: 0
  })

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await fetch('/api/admin/get-sells')
        const data = await response.json()
        setSales(data.sells)
        setStats(data.stats)
      } catch (error) {
        console.error('Erro ao buscar vendas:', error)
      }
    }

    fetchSales()
  }, [])

  const prepareChartData = () => {
    // últimos 6 meses
    const last6Months = new Array(6).fill(null).map((_, index) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (5 - index))
      return {
        month: monthNames[date.getMonth()],
        valor: 0,
        mes: date.getMonth() + 1
      }
    })

    sales.forEach(sale => {
      const saleDate = new Date(sale.date)
      const saleMonth = saleDate.getMonth() + 1 
      
      const monthIndex = last6Months.findIndex(m => m.mes === saleMonth)
      if (monthIndex !== -1) {
        last6Months[monthIndex].valor += sale.amount
      }
    })

    return last6Months
  }

  const chartData = prepareChartData()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-gradient-to-t from-background/10 to-primary/[5%]">
        <CardHeader className="pb-4">
          <CardTitle>Histórico de Vendas</CardTitle>
          <CardDescription>
            Todas as vendas realizadas na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[calc(100%-5rem)]">
          <div className="h-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="overflow-auto">
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      {new Date(sale.date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>{sale.customerName}</TableCell>
                    <TableCell>{sale.plan}</TableCell>
                    <TableCell>
                      {sale.amount.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Card className="bg-gradient-to-t from-background/10 to-primary/[5%]">
          <CardHeader className="pb-4">
            <CardTitle>Resumo de Vendas</CardTitle>
            <CardDescription>
              Estatísticas gerais das vendas
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Vendido</p>
              <p className="text-2xl font-bold">
                {stats.totalAmount.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vendas Realizadas</p>
              <p className="text-2xl font-bold">{stats.totalSales}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ticket Médio</p>
              <p className="text-2xl font-bold">
                {stats.averageTicket.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-t from-background/10 to-primary/[5%]">
          <CardHeader className="pb-4">
            <CardTitle>Evolução das Vendas</CardTitle>
            <CardDescription>
              Valor das vendas nos últimos meses
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
                height={200}
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
      </div>
    </div>
  )
}
