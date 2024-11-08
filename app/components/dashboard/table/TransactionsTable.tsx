import React, { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, PlusCircle, ArrowUpDown } from "lucide-react"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import { DataTable } from "@/app/components/dashboard/table/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Skeleton } from "../../ui/skeleton"
import CreateTransaction from "../../create-transactions/CreateTransactions"
import ViewTransaction from "../../view-transactions/ViewTransactions"
import { Transactions } from "@/types/types"
import { exampleTransactions } from "@/utils/exampleData"
import { useYear } from '@/app/contexts/YearContext';
import { Separator } from "../../ui/separator"

type FonteKey =
  | "cartao-credito"
  | "cartao-debito"
  | "pix"
  | "boleto"
  | "investimentos"
  | "cedulas"

type SortKey = "nome" | "data" | "valor"

const TransactionsTable = () => {
  const [transactions, setTransactions] = useState<Transactions[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transactions[]
  >([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>("data")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [viewingTransactionId, setViewingTransactionId] = useState<
    string | null
  >(null)
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [availableYears, setAvailableYears] = useState<string[]>([])

  const { selectedYear, setSelectedYear } = useYear();

  const columns: ColumnDef<Transactions>[] = [
    {
      accessorKey: "nome",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Transação
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("nome")}</div>
          <div className="md:hidden text-sm text-muted-foreground">
            {formatValor(row.original.valor)} •{" "}
            {row.original.data.replace(/-/g, "/")}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "tipo",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant="outline">
          {capitalizeFirstLetter(row.original.tipo)}
        </Badge>
      ),
    },
    {
      accessorKey: "fonte",
      header: "Fonte",
      cell: ({ row }) => (
        <div>
          {formatFonte(row.original.fonte)}
          <br />
          <span className="text-sm text-muted-foreground">
            {row.original.detalhesFonte}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "data",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Data
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => row.original.data.replace(/-/g, "/"),
    },
    {
      accessorKey: "valor",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Valor
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => formatValor(row.original.valor),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <ViewTransaction transactionId={row.original.transactionId} />
      ),
    },
  ]

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/transactions/get-table")
      const data = await response.json()

      const filtered = data.table.filter(
        (transaction: Transactions) =>
          transaction.tipo === "despesa" || transaction.tipo === "receita"
      )

      if (filtered.length === 0) {
        setTransactions(exampleTransactions as Transactions[])
        setFilteredTransactions(exampleTransactions as Transactions[])
      } else {
        const years = [
          ...new Set(filtered.map((t: Transactions) => t.data.split("-")[2])),
        ] as string[]

        const sortedYears = years.sort((a, b) => b.localeCompare(a))
        setAvailableYears(sortedYears)

        const yearFiltered = filtered.filter(
          (t: Transactions) => t.data.split("-")[2] === selectedYear
        )

        const sortedTransactions = yearFiltered.sort(
          (a: Transactions, b: Transactions) => {
            const dateA = new Date(
              a.data.split("-").reverse().join("/")
            ).getTime()
            const dateB = new Date(
              b.data.split("-").reverse().join("/")
            ).getTime()
            return dateB - dateA
          }
        )
        const limitedTransactions = sortedTransactions.slice(0, 5)
        setTransactions(limitedTransactions)
        setFilteredTransactions(limitedTransactions)
      }
    } catch (error) {
      console.error("Erro ao buscar transações:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [selectedYear])

  useEffect(() => {
    const handleTransactionUpdate = () => {
      fetchTransactions()
    }

    window.addEventListener("updateTransactions", handleTransactionUpdate)

    return () => {
      window.removeEventListener("updateTransactions", handleTransactionUpdate)
    }
  }, [])

  const handleSort = (key: SortKey) => {
    let order: "asc" | "desc" = sortOrder === "asc" ? "desc" : "asc"
    if (sortKey !== key) {
      order = "asc"
    }

    const sorted = [...filteredTransactions].sort((a, b) => {
      if (key === "nome") {
        return order === "asc"
          ? a.nome.localeCompare(b.nome)
          : b.nome.localeCompare(a.nome)
      } else if (key === "data") {
        const dateA = new Date(a.data.split("-").reverse().join("/")).getTime()
        const dateB = new Date(b.data.split("-").reverse().join("/")).getTime()
        return order === "asc" ? dateA - dateB : dateB - dateA
      } else if (key === "valor") {
        return order === "asc" ? a.valor - b.valor : b.valor - a.valor
      }
      return 0
    })

    setFilteredTransactions(sorted)
    setSortKey(key)
    setSortOrder(order)
  }

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
  }

  const mappings: { [key in FonteKey]?: string } = {
    "cartao-credito": "Cartão de Crédito",
    "cartao-debito": "Cartão de Débito",
    pix: "PIX",
    boleto: "Boleto",
    investimentos: "Investimentos",
    cedulas: "Espécie",
  }

  const formatFonte = (fonte: string): string => {
    const key = fonte as FonteKey
    return mappings[key] || fonte
  }

  const formatValor = (valor: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(valor)
  }

  return (
    <div className="w-full sm:px-0">
      <Card className="lg:col-span-2 bg-gradient-to-tl from-background/10 to-primary/[5%]">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Transações</CardTitle>
            <CardDescription>Transações mais Recentes:</CardDescription>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden sm:flex sm:items-center sm:gap-4 ">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      Transações de {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setIsTransactionDialogOpen(true)}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Criar Transação
              </Button>
              {filteredTransactions !== exampleTransactions && (
                <Button
                  variant="outline"
                  asChild
                  className="gap-1 hidden lg:flex"
                >
                  <Link href="/dashboard/transactions">
                    Ver Todas
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <Separator className="mb-8" />

        <div className="flex flex-col gap-4 px-6 sm:hidden">
          <div className="flex flex-col gap-4 w-full mb-4">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setIsTransactionDialogOpen(true)}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Criar Transação
            </Button>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <CardContent>
          <div className="rounded-md">
            <div className="w-full overflow-auto">
              {loading ? (
                <Skeleton className="h-[250px]" />
              ) : (
                <div className="relative">
                  {filteredTransactions === exampleTransactions && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-xl">
                      <p className="text-xl font-semibold mb-2 text-center">
                        Você ainda não possui transações
                      </p>
                      <p className="text-sm text-muted-foreground mb-4 text-center px-4">
                        Crie sua primeira transação para começar a controlar
                        suas finanças
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setIsTransactionDialogOpen(true)}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Criar Transação
                      </Button>
                    </div>
                  )}
                  <div
                    className={
                      filteredTransactions === exampleTransactions
                        ? "blur-xl opacity-50"
                        : ""
                    }
                  >
                    <DataTable columns={columns} data={filteredTransactions} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <div className="flex justify-center items-center pb-6 px-6 lg:hidden">
          {filteredTransactions !== exampleTransactions && (
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard/transactions">
                Ver Todas Transações
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        <CreateTransaction
          isOpen={isTransactionDialogOpen}
          onOpenChange={setIsTransactionDialogOpen}
        />
      </Card>
    </div>
  )
}

export default TransactionsTable
