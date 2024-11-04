"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/app/components/ui/badge"
import ViewTransaction from "../dashboard/view-transactions/ViewTransactions"
import { Transactions } from "@/types/types"

type TransactionWithUnknownId = Omit<Transactions, 'userId' | 'dataCriacao'> & {
  userId: unknown;
  dataCriacao: string | Date;
}

type FonteKey = "cartao-credito" | "cartao-debito" | "pix" | "boleto" | "especie" | "outros"

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

export const columns: ColumnDef<TransactionWithUnknownId>[] = [
  {
    accessorKey: "nome",
    header: "Transação",
    cell: ({ row }) => {
      const nome = row.getValue("nome") as string
      return <div className="font-medium">{nome}</div>
    },
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
    cell: ({ row }) => {
      const tipo = row.getValue("tipo") as string
      return (
        <Badge className="text-xs" variant="outline">
          {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
        </Badge>
      )
    },
  },
  {
    accessorKey: "fonte",
    header: "Origem",
    cell: ({ row }) => {
      const fonte = row.getValue("fonte") as string
      const detalhesFonte = row.original.detalhesFonte
      return (
        <div>
          {formatFonte(fonte)}
          {detalhesFonte && (
            <div className="text-sm text-muted-foreground">
              {fonte === "cartao-credito"
                ? detalhesFonte || "Cartão de Crédito"
                : detalhesFonte}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "data",
    header: "Data",
    cell: ({ row }) => {
      const data = row.getValue("data") as string
      return <div>{data.replace(/-/g, "/")}</div>
    },
    sortingFn: (rowA, rowB, columnId) => {
      const dateA = rowA.getValue(columnId) as string
      const dateB = rowB.getValue(columnId) as string
      
      const [diaA, mesA, anoA] = dateA.replace(/-/g, "/").split("/")
      const [diaB, mesB, anoB] = dateB.replace(/-/g, "/").split("/")
      
      if (anoA !== anoB) {
        return parseInt(anoA) - parseInt(anoB)
      }
      
      if (mesA !== mesB) {
        return parseInt(mesA) - parseInt(mesB)
      }
      
      return parseInt(diaA) - parseInt(diaB)
    },
    enableSorting: true,
  },
  {
    accessorKey: "valor",
    header: "Valor",
    cell: ({ row }) => {
      const valor = row.getValue("valor") as number
      return <div>{formatValor(valor)}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <ViewTransaction transactionId={row.original.transactionId} />
      )
    },
  },
]
