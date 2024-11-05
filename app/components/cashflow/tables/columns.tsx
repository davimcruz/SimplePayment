"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/app/components/ui/badge"

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

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value)
}

const formatPercentage = (value: number): string => {
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

export const columns: ColumnDef<FlowItem>[] = [
  {
    accessorKey: "nome",
    header: "Mês",
    cell: ({ row }) => {
      const nome = row.getValue("nome") as string
      return <div className="font-medium">{nome}</div>
    },
  },
  {
    accessorKey: "saldoOrcado",
    header: "Orçado",
    cell: ({ row }) => {
      const valor = row.getValue("saldoOrcado") as number
      return <div>{formatCurrency(valor)}</div>
    },
  },
  {
    accessorKey: "saldoRealizado",
    header: "Realizado",
    cell: ({ row }) => {
      const valor = row.getValue("saldoRealizado") as number
      return <div>{formatCurrency(valor)}</div>
    },
  },
  {
    accessorKey: "gapMoney",
    header: "Gap (R$)",
    cell: ({ row }) => {
      const valor = row.getValue("gapMoney") as number
      return <div>{formatCurrency(valor)}</div>
    },
  },
  {
    accessorKey: "gapPercentage",
    header: "Gap (%)",
    cell: ({ row }) => {
      const valor = row.getValue("gapPercentage") as number
      return <div>{formatPercentage(valor)}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          variant="outline"
          className={getBadgeClass(status)}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
    },
  },
] 