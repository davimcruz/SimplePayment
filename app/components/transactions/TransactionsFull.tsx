"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import { Skeleton } from "../ui/skeleton"
import CreateTransaction from "../create-transactions/CreateTransactions"
import { Transactions } from "@/types/types"
import { exampleTransactions } from "@/utils/exampleData"
import { PlusCircle } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { Input } from "@/app/components/ui/input"
import { ColumnToggle } from "./column-toggle"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
} from "@tanstack/react-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import { useYear } from '@/app/contexts/YearContext';

type TransactionWithUnknownId = Omit<Transactions, "userId" | "dataCriacao"> & {
  userId: unknown
  dataCriacao: string | Date
}

const TransactionsFull = () => {
  const [transactions, setTransactions] = useState<TransactionWithUnknownId[]>(
    []
  )
  const [loading, setLoading] = useState(true)
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const { selectedYear, setSelectedYear } = useYear();
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "data",
      desc: true
    }
  ])

  const getAvailableYears = useCallback((transactions: TransactionWithUnknownId[]) => {
    const years = transactions
      .map((transaction) => {
        if (!transaction.data) return null;
        const [, , year] = transaction.data.split("-")
        return year
      })
      .filter((year): year is string => year !== null)
    
    return ['all', ...Array.from(new Set(years)).sort().reverse()]
  }, [])

  const filteredTransactions = useMemo(() => {
    if (!selectedYear || selectedYear === 'all') {
      return transactions;
    }
    return transactions.filter((transaction) => {
      if (!transaction.data) return false;
      const [, , year] = transaction.data.split("-")
      return year === selectedYear
    })
  }, [transactions, selectedYear])

  const table = useReactTable({
    data: filteredTransactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    enableSorting: true,
  })

  const isExample = useMemo(() => {
    return (
      transactions.length > 0 &&
      transactions.every((transaction) =>
        exampleTransactions.some(
          (example) => example.transactionId === transaction.transactionId
        )
      )
    )
  }, [transactions])

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/transactions/get-table")
      const data = await response.json()

      if (!data.table || data.table.length === 0) {
        const completeExampleData = exampleTransactions.map((transaction) => ({
          ...transaction,
          userId: "",
          dataCriacao: new Date().toISOString(),
        })) as TransactionWithUnknownId[]

        setTransactions(completeExampleData)
        setAvailableYears(getAvailableYears(completeExampleData))
        return
      }

      setTransactions(data.table)
      setAvailableYears(getAvailableYears(data.table))
    } catch (error) {
      console.error(error)
      const completeExampleData = exampleTransactions.map((transaction) => ({
        ...transaction,
        userId: "",
        dataCriacao: new Date().toISOString(),
      })) as TransactionWithUnknownId[]

      setTransactions(completeExampleData)
      setAvailableYears(getAvailableYears(completeExampleData))
    } finally {
      setLoading(false)
    }
  }, [getAvailableYears])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  useEffect(() => {
    const handleTransactionUpdate = () => {
      fetchTransactions()
    }

    window.addEventListener("updateTransactions", handleTransactionUpdate)

    return () => {
      window.removeEventListener("updateTransactions", handleTransactionUpdate)
    }
  }, [fetchTransactions])

  return (
    <div className="h-full w-full px-2 md:px-12 mt-8">
      <Card className="bg-gradient-to-t from-background/10 to-primary/[5%] relative">
        <div className={isExample ? "blur-md bg-background/20" : ""}>
          <CardHeader>
            <CardTitle>Transações</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[250px]" />
            ) : (
              <div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Input
                      placeholder="Filtrar transações..."
                      value={(table.getColumn("nome")?.getFilterValue() as string) ?? ""}
                      onChange={(event) =>
                        table.getColumn("nome")?.setFilterValue(event.target.value)
                      }
                      className="max-w-sm"
                    />
                    <Select
                      value={selectedYear}
                      onValueChange={(value) => setSelectedYear(value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecione o ano" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableYears.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year === 'all' ? 'Todos os anos' : year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <ColumnToggle table={table} />
                  </div>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button
                      variant="outline"
                      onClick={() => setIsTransactionDialogOpen(true)}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Criar Transação
                    </Button>
                  </div>
                </div>

                <DataTable
                  columns={columns}
                  data={filteredTransactions}
                  onCreateTransaction={() => setIsTransactionDialogOpen(true)}
                  table={table}
                  showControls={false}
                />
              </div>
            )}
          </CardContent>
        </div>

        {isExample && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
            <p className="text-xl font-semibold mb-2 text-center px-4">
              Você ainda não possui transações
            </p>
            <p className="text-sm text-muted-foreground mb-4 text-center px-4">
              Crie sua primeira transação para começar a controlar suas finanças
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

        <CreateTransaction
          isOpen={isTransactionDialogOpen}
          onOpenChange={setIsTransactionDialogOpen}
        />
      </Card>
    </div>
  )
}

export default TransactionsFull
