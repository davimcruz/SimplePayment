import { useEffect, useState, useMemo, useCallback } from "react"
import { Badge } from "@/app/components/ui/badge"
import {
  Card,
  CardContent,
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
import { Input } from "@/app/components/ui/input"
import { Skeleton } from "../ui/skeleton"
import CreateTransaction from "../dashboard/create-transactions/CreateTransactions"
import { Transactions } from "@/types/types"
import ViewTransaction from "../dashboard/view-transactions/ViewTransactions"
import { exampleTransactions } from "@/utils/exampleData"
import { PlusCircle } from "lucide-react"
import { Button } from "@/app/components/ui/button"

type FonteKey =
  | "cartao-credito"
  | "cartao-debito"
  | "pix"
  | "boleto"
  | "especie"
  | "outros"

type SortKey = "nome" | "data" | "valor"

type TransactionWithUnknownId = Omit<Transactions, 'userId' | 'dataCriacao'> & {
  userId: unknown;
  dataCriacao: string | Date;
}

const TransactionsFull = () => {
  const [transactions, setTransactions] = useState<TransactionWithUnknownId[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionWithUnknownId[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("data")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)

  const isExample = useMemo(() => {
    return filteredTransactions.length > 0 && 
      filteredTransactions.every(transaction => 
        exampleTransactions.some(example => 
          example.transactionId === transaction.transactionId
        )
      )
  }, [filteredTransactions])

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/transactions/get-table")
      const data = await response.json()

      if (!data.table || data.table.length === 0) {
        const completeExampleData = exampleTransactions.map(transaction => ({
          ...transaction,
          userId: "",
          dataCriacao: new Date().toISOString()
        })) as TransactionWithUnknownId[]
        
        setTransactions(completeExampleData)
        setFilteredTransactions(completeExampleData)
        setLoading(false)
        return
      }

      const sortedTransactions = data.table.sort(
        (a: TransactionWithUnknownId, b: TransactionWithUnknownId) => {
          const dateA = new Date(a.data.split("-").reverse().join("/")).getTime()
          const dateB = new Date(b.data.split("-").reverse().join("/")).getTime()
          return dateB - dateA
        }
      )

      setTransactions(sortedTransactions)
      setFilteredTransactions(sortedTransactions)
    } catch (error) {
      console.error(error)
      const completeExampleData = exampleTransactions.map(transaction => ({
        ...transaction,
        userId: "",
        dataCriacao: new Date().toISOString()
      })) as TransactionWithUnknownId[]
      
      setTransactions(completeExampleData)
      setFilteredTransactions(completeExampleData)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredTransactions(transactions)
    } else {
      const filtered = transactions.filter((transaction) =>
        transaction.nome.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredTransactions(filtered)
    }
  }, [searchTerm, transactions])

  useEffect(() => {
    const handleTransactionUpdate = () => {
      fetchTransactions()
    }

    window.addEventListener('updateTransactions', handleTransactionUpdate)

    return () => {
      window.removeEventListener('updateTransactions', handleTransactionUpdate)
    }
  }, [fetchTransactions])

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
    especie: "Espécie",
    outros: "Outros",
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
    <div className="h-full w-full px-12 mt-8">
      <Card className="bg-gradient-to-t from-background/10 to-primary/[5%] relative">
        <div className={isExample ? "blur-md bg-background/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transações</CardTitle>
            <div className="flex items-center gap-4">
              <Input
                placeholder="Pesquisar pelo Nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-sm py-0 hidden lg:block"
              />
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => setIsTransactionDialogOpen(true)}
              >
                <PlusCircle className="h-4 w-4" />
                Criar Transação
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[250px]" />
            ) : (
              <div className="max-h-[calc(100vh-16rem)] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 ">
                    <TableRow>
                      <TableHead onClick={() => handleSort("nome")}>
                        Transação{" "}
                        {sortKey === "nome" && (sortOrder === "asc" ? "↑" : "↓")}
                      </TableHead>

                      <TableHead className="hidden lg:table-cell md:table-cell">
                        Tipo
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Origem
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
                        className="cursor-pointer hidden lg:table-cell"
                      >
                        Valor{" "}
                        {sortKey === "valor" && (sortOrder === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead className="ml-auto">Visualização</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="font-medium">{transaction.nome}</div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge
                            className="hidden lg:inline-flex md:inline-flex text-xs"
                            variant="outline"
                          >
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
                        <TableCell className="">
                          <ViewTransaction
                            transactionId={transaction.transactionId}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </div>

        {isExample && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center ">
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
