import { ColumnDef } from "@tanstack/react-table"
import { Invoice, RecurringInvoice } from "@/types"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { InvoiceStatus, RecurringInvoiceStatus } from "@/types/enums"
import { DataTableRowActions } from "./data-table-row-actions"

export const recurringInvoiceColumns: ColumnDef<RecurringInvoice>[] = [
  {
    accessorKey: "invoiceNumber",
    header: "# Factura",
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => formatCurrency(row.getValue("amount")),
  },
  {
    accessorKey: "nextInvoiceDate",
    header: "Próximo Pago",
    cell: ({ row }) => {
      const date = row.getValue("nextInvoiceDate") as { toDate(): Date } | Date
      const dateObj = date instanceof Date ? date : date?.toDate()
      return dateObj ? formatDate(dateObj) : '-'
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as RecurringInvoiceStatus
      return (
        <Badge
          variant={
            status === RecurringInvoiceStatus.PAID 
              ? "default" 
              : status === RecurringInvoiceStatus.PENDING 
                ? "secondary" 
                : "destructive"
          }
        >
          {status === RecurringInvoiceStatus.PAID ? "Pagada" : 
           status === RecurringInvoiceStatus.PENDING ? "Pendiente" : "Vencida"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]

export const invoiceColumns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "invoiceNumber",
    header: "# Factura",
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => formatCurrency(row.getValue("amount")),
  },
  {
    accessorKey: "dueDate",
    header: "Vencimiento",
    cell: ({ row }) => formatDate(row.getValue("dueDate")),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as InvoiceStatus
      return (
        <Badge
          variant={
            status === InvoiceStatus.PAID 
              ? "default" 
              : status === InvoiceStatus.PENDING 
                ? "secondary" 
                : "destructive"
          }
        >
          {status === InvoiceStatus.PAID ? "Pagada" : 
           status === InvoiceStatus.PENDING ? "Pendiente" : "Vencida"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
] 