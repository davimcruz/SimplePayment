import * as React from "react"
import { cn } from "@/lib/utils"

const TableMobile = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="w-full">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
TableMobile.displayName = "TableMobile"

const TableMobileHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableMobileHeader.displayName = "TableMobileHeader"

const TableMobileBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableMobileBody.displayName = "TableMobileBody"

const TableMobileRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableMobileRow.displayName = "TableMobileRow"

const TableMobileHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-1 text-left align-middle font-medium text-muted-foreground [&:has(button)]:pr-0",
      className
    )}
    {...props}
  />
))
TableMobileHead.displayName = "TableMobileHead"

const TableMobileCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("px-1 py-2 align-middle [&:has(button)]:pr-0", className)}
    {...props}
  />
))
TableMobileCell.displayName = "TableMobileCell"

export {
  TableMobile,
  TableMobileHeader,
  TableMobileBody,
  TableMobileRow,
  TableMobileHead,
  TableMobileCell,
}
