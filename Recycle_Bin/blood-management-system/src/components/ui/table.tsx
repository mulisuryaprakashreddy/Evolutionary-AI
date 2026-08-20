import React from "react"
import { cn } from "@/lib/utils"

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {}

const Table: React.FC<TableProps> = ({ className, ...props }) => (
  <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
)
Table.displayName = "Table"

const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <thead className={cn("[&_tr]:border-b", className)} {...props} />
)
TableHeader.displayName = "TableHeader"

const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
)
TableBody.displayName = "TableBody"

const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className, ...props }) => (
  <tr className={cn("border-b transition-colors hover:bg-muted/50", className)} {...props} />
)
TableRow.displayName = "TableRow"

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

const TableHead: React.FC<TableHeadProps> = ({ className, ...props }) => (
  <th className={cn("h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-1/2", className)} {...props} />
)
TableHead.displayName = "TableHead"

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

const TableCell: React.FC<TableCellProps> = ({ className, ...props }) => (
  <td className={cn("p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-1/2", className)} {...props} />
)
TableCell.displayName = "TableCell"

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }
