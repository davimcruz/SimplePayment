"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import ViewTransaction from "../../view-transactions/ViewTransactions"
import { Transactions } from "@/types/types"

export const columns: ColumnDef<Transactions>[] = [
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
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => {
      const tipo = row.getValue("tipo") as string
      return (
        <Badge variant="outline">
          {tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase()}
        </Badge>
      )
    },
  },
  {
    accessorKey: "fonte",
    header: "Fonte",
    cell: ({ row }) => {
      const fonte = row.getValue("fonte") as string
      const detalhesFonte = row.original.detalhesFonte as string
      const mappings: { [key: string]: string } = {
        "cartao-credito": "Cartão de Crédito",
        "cartao-debito": "Cartão de Débito",
        pix: "PIX",
        boleto: "Boleto",
        investimentos: "Investimentos",
        cedulas: "Espécie",
      }
      return (
        <div>
          {mappings[fonte] || fonte}
          <br />
          <span className="text-sm text-muted-foreground">{detalhesFonte}</span>
        </div>
      )
    },
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
    cell: ({ row }) => {
      const data = row.getValue("data") as string
      return data.replace(/-/g, "/")
    },
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
    cell: ({ row }) => {
      const valor = row.getValue("valor") as number
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(valor)
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ViewTransaction transactionId={row.original.transactionId} />
    ),
  },
]
