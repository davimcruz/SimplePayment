"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table"

import { Input } from "@/app/components/ui/input"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import ShimmerButton from "@/app/components/ui/shimmer-button"
import { Sparkles, Loader2, Lock } from "lucide-react"
import { toast } from "sonner"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onAnalyze: () => void
  isAnalyzing: boolean
  isPro: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onAnalyze,
  isAnalyzing,
  isPro
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
  })

  const handleAnalyzeClick = () => {
    if (!isPro) {
      toast.error(
        "Recurso exclusivo para membros PRO",
        {
          description: "Faça upgrade da sua conta para acessar a análise por IA.",
          // action: {
          //   label: "Upgrade",
          //   onClick: () => window.location.href = "/settings"
          // },
        }
      )
      return
    }
    onAnalyze()
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            placeholder="Filtrar por mês..."
            value={(table.getColumn("nome")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("nome")?.setFilterValue(event.target.value)
            }
            className="w-full sm:max-w-xs"
          />
        </div>
        <ShimmerButton 
          onClick={handleAnalyzeClick}
          disabled={isAnalyzing}
          className={`w-full sm:w-auto ${
            !isPro 
              ? 'bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600'
              : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600'
          } px-4 py-2 rounded-md transition-all duration-200 ease-in-out shadow-lg`}
        >
          <div className="flex items-center justify-center gap-2">
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : !isPro ? (
              <Lock className="h-4 w-4 text-white" />
            ) : (
              <Sparkles className="h-4 w-4 text-white group-hover:animate-pulse" />
            )}
            <span className="text-sm font-medium text-white">
              {isAnalyzing ? 'Analisando...' : 'Análise IA'}
            </span>
          </div>
        </ShimmerButton>
      </div>

      <div className="rounded-md border">
        <div className="overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background/20 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="whitespace-nowrap">
                      {header.isPlaceholder ? null : (
                        <div
                          {...{
                            className: header.column.getCanSort()
                              ? "cursor-pointer select-none flex items-center gap-1"
                              : "",
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <div className="ml-1">
                              {header.column.getIsSorted() === "desc" ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : header.column.getIsSorted() === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronUp className="h-4 w-4 opacity-30" />
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="whitespace-nowrap">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Nenhum resultado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
} 