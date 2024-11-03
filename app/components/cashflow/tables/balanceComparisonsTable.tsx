import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { Skeleton } from "@/app/components/ui/skeleton"
import { exampleFlows } from "@/utils/exampleData"
import CreateTransaction from "@/app/components/sidebar/CreateTransactions"
import { PlusCircle } from "lucide-react"

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

const statusTranslations: { [key: string]: string } = {
  excedente: "Excedente",
  deficit: "Déficit",
  neutro: "Neutro",
}

const getBadgeClass = (status: string) => {
  switch (status) {
    case "excedente":
      return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-100 dark:border-green-700"
    case "deficit":
      return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-100 dark:border-red-700"
    case "neutro":
      return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-700"
    default:
      return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
  }
}

interface BalanceComparisonTableProps {
  data: FlowItem[]
  loading: boolean
  setData: (data: FlowItem[]) => void
}

const BalanceComparisonTable = ({ data, loading, setData }: BalanceComparisonTableProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortKey, setSortKey] = useState<keyof FlowItem>("mes")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const router = useRouter()

  const isExample = useMemo(() => {
    return JSON.stringify(data) === JSON.stringify(exampleFlows)
  }, [data])

  const filteredAndSortedData = useMemo(() => {
    let filtered = data

    if (searchTerm !== "") {
      filtered = filtered.filter(
        (item) =>
          item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          statusTranslations[item.status]
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    }

    return [...filtered].sort((a, b) => {
      const aValue = a[sortKey]
      const bValue = b[sortKey]

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue
      } else {
        return sortOrder === "asc"
          ? aValue.toString().localeCompare(bValue.toString())
          : bValue.toString().localeCompare(aValue.toString())
      }
    })
  }, [data, searchTerm, sortKey, sortOrder])

  const handleSort = useCallback((key: keyof FlowItem) => {
    setSortKey(key)
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"))
  }, [])

  const handleUpdateBudgetClick = () => {
    router.push("/dashboard/cashflow/updateFlow")
  }

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) {
      return "-"
    }
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) {
      return "-"
    }
    const formattedValue = new Intl.NumberFormat("pt-BR", {
      style: "percent",
      signDisplay: "never",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(value))

    return value > 0
      ? `+${formattedValue}`
      : value < 0
      ? `-${formattedValue}`
      : formattedValue
  }

  return (
    <div className="h-full w-full px-12">
      <Card className="bg-gradient-to-tr from-background/10 to-primary/[5%] w-full mx-auto relative">
        <div className={`${isExample ? "blur-md" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="-mt-2">Fluxo de Caixa</CardTitle>
            <div className="flex items-center">
              <Input
                placeholder="Pesquisar por mês ou status"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-sm py-0 hidden lg:block"
              />
            </div>
          </CardHeader>
          <CardContent className="relative p-4">
            {loading ? (
              <Skeleton className="h-[250px]" />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mês</TableHead>
                      <TableHead>Orçado</TableHead>
                      <TableHead>Realizado</TableHead>
                      <TableHead>Gap (R$)</TableHead>
                      <TableHead>Gap (%)</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="font-medium">{item.nome}</div>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(item.saldoOrcado)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(item.saldoRealizado)}
                        </TableCell>
                        <TableCell>{formatCurrency(item.gapMoney)}</TableCell>
                        <TableCell>
                          {formatPercentage(item.gapPercentage)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className={getBadgeClass(item.status)}
                          >
                            {statusTranslations[item.status] || item.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              variant="link"
              className="text-sm text-zinc-500"
              onClick={handleUpdateBudgetClick}
            >
              Clique aqui para alterar seu orçamento anual
            </Button>
          </CardFooter>
        </div>

        {isExample && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center ">
            <p className="text-xl font-semibold mb-2 text-center px-4">
              Você ainda não criou seu fluxo de caixa
            </p>
            <p className="text-sm text-muted-foreground mb-4 text-center px-4">
              Crie seu fluxo de caixa para começar a controlar suas finanças
            </p>
            <Button variant="outline" onClick={handleUpdateBudgetClick}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Criar Fluxo de Caixa
            </Button>
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

export default BalanceComparisonTable
