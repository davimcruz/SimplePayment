import React, { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, PlusCircle } from "lucide-react"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table"
import { Skeleton } from "../../ui/skeleton"
import CreateTransaction from "../create-transactions/CreateTransactions"
import ViewTransaction from "../view-transactions/ViewTransactions"
import { Transactions } from "@/types/types"
import { exampleTransactions } from "@/utils/exampleData"

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
        setTransactions(exampleTransactions as unknown as Transactions[])
        setFilteredTransactions(exampleTransactions as unknown as Transactions[])
      } else {
        const sortedTransactions = filtered.sort(
          (a: Transactions, b: Transactions) => {
            const dateA = new Date(a.data.split("-").reverse().join("/")).getTime()
            const dateB = new Date(b.data.split("-").reverse().join("/")).getTime()
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
  }, [])

  useEffect(() => {
    const handleTransactionUpdate = () => {
      fetchTransactions()
    }

    window.addEventListener('updateTransactions', handleTransactionUpdate)

    return () => {
      window.removeEventListener('updateTransactions', handleTransactionUpdate)
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
    <Card className="lg:col-span-2 bg-gradient-to-tl from-background/10 to-primary/[5%]">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Transações</CardTitle>
          <CardDescription>Transações mais Recentes:</CardDescription>
        </div>
        {filteredTransactions !== exampleTransactions && (
          <>
            <Button
              variant="outline"
              asChild
              size="sm"
              className="ml-auto gap-1 hidden lg:flex"
            >
              <Link href="/dashboard/transactions">
                Ver Todas
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 ml-4"
              onClick={() => setIsTransactionDialogOpen(true)}
            >
              <PlusCircle className="h-4 w-4" />
              Criar Transação
            </Button>
          </>
        )}
      </CardHeader>
      <CardContent>
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
            <div
              className={`overflow-x-auto ${
                filteredTransactions === exampleTransactions ? "blur-xl opacity-50" : ""
              }`}
            >
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => handleSort("nome")}>
                      Transação{" "}
                      {sortKey === "nome" && (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">Tipo</TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Fonte
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("data")}
                      className="hidden lg:table-cell cursor-pointer"
                    >
                      Data{" "}
                      {sortKey === "data" && (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("valor")}
                      className="hidden lg:table-cell cursor-pointer"
                    >
                      Valor{" "}
                      {sortKey === "valor" && (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="text-right">Visualização</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.transactionId}>
                      <TableCell>
                        <div className="font-medium">{transaction.nome}</div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge className="text-xs" variant="outline">
                          {capitalizeFirstLetter(transaction.tipo)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {formatFonte(transaction.fonte)}
                        <br />
                        <div className="hidden text-sm text-muted-foreground md:inline">
                          {transaction.fonte === "cartao-credito"
                            ? transaction.detalhesFonte || "Cartão de Crédito"
                            : transaction.detalhesFonte}
                        </div>
                      </TableCell>

                      <TableCell className="hidden lg:table-cell">
                        {transaction.data.replace(/-/g, "/")}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {formatValor(transaction.valor)}
                      </TableCell>
                      <TableCell className="text-right">
                        <ViewTransaction
                          transactionId={transaction.transactionId}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
      <div className="flex justify-center items-center pb-6 px-6">
        <Button
          variant="outline"
          asChild
          size="sm"
          className="lg:hidden w-full"
        >
          <Link href="/dashboard/transactions">
            Ver Todas Transações
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <CreateTransaction 
        isOpen={isTransactionDialogOpen}
        onOpenChange={setIsTransactionDialogOpen}
      />
    </Card>
  )
}

export default TransactionsTable
