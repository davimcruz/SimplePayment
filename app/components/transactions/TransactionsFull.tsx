"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import { Skeleton } from "../ui/skeleton"
import CreateTransaction from "../dashboard/create-transactions/CreateTransactions"
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
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table"

type TransactionWithUnknownId = Omit<Transactions, 'userId' | 'dataCriacao'> & {
  userId: unknown;
  dataCriacao: string | Date;
}

const TransactionsFull = () => {
  const [transactions, setTransactions] = useState<TransactionWithUnknownId[]>([])
  const [loading, setLoading] = useState(true)
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
        setLoading(false)
        return
      }

      setTransactions(data.table)
    } catch (error) {
      console.error(error)
      const completeExampleData = exampleTransactions.map((transaction) => ({
        ...transaction,
        userId: "",
        dataCriacao: new Date().toISOString(),
      })) as TransactionWithUnknownId[]

      setTransactions(completeExampleData)
    }
    setLoading(false)
  }, [])

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
    <div className="h-full w-full px-12 mt-8">
      <Card className="bg-gradient-to-t from-background/10 to-primary/[5%] relative">
        <div className={isExample ? "blur-md bg-background/20" : ""}>
          <CardHeader>
            <CardTitle>Transações</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[250px]" />
            ) : (
              <DataTable 
                columns={columns} 
                data={transactions} 
                onCreateTransaction={() => setIsTransactionDialogOpen(true)}
              />
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
