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
  Table as TableType,
  Header,
  HeaderGroup,
  Row,
  Cell,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table"

import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { useState } from "react"
import { ColumnToggle } from "./column-toggle"
import { ChevronDown, ChevronUp } from "lucide-react"
import { PlusCircle } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onCreateTransaction: () => void
  table: TableType<TData>
  showControls?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onCreateTransaction,
  table,
  showControls = true
}: DataTableProps<TData, TValue>) {
  return (
    <div>
      {showControls && (
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
            <ColumnToggle table={table} />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={onCreateTransaction}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Criar Transação
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <div className="relative" style={{ height: "calc(100vh - 24rem)" }}>
          <div className="overflow-auto h-full">
            <Table>
              <TableHeader className="sticky top-0 bg-background/20 z-10">
                {table.getHeaderGroups().map((headerGroup: HeaderGroup<TData>) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header: Header<TData, unknown>) => (
                      <TableHead key={header.id}>
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
                  table.getRowModel().rows.map((row: Row<TData>) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell: Cell<TData, unknown>) => (
                        <TableCell key={cell.id}>
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
      <div className="flex items-center justify-end py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length === 1
            ? "1 Transação no Total"
            : `${table.getFilteredRowModel().rows.length} Transações no Total`}
        </div>
      </div>
    </div>
  )
}
