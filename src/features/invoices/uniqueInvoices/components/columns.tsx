import { ColumnDef, Row } from "@tanstack/react-table"
import { Invoice, RecurringInvoice } from "@/types"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { RecurringInvoiceStatus } from "@/types/enums"


export const recurringColumns: ColumnDef<RecurringInvoice>[] = [
  {
    accessorKey: "citizenName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contribuyente" />
    ),
  },
  {
    accessorKey: "serviceName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Servicio" />
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Monto" />
    ),
    cell: ({ row }) => formatCurrency(row.getValue("amount")),
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Límite" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("dueDate") as Date
      const isOverdue = row.original.isOverdue
      return (
        <div className={isOverdue ? "text-destructive font-medium" : ""}>
          {formatDate(date)}
          {isOverdue && row.original.daysOverdue && (
            <span className="block text-xs">
              {row.original.daysOverdue} días de retraso
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          variant={
            status === RecurringInvoiceStatus.PAID 
              ? "default" 
              : status === RecurringInvoiceStatus.OVERDUE 
                ? "destructive" 
                : "secondary"
          }
        >
          {status === RecurringInvoiceStatus.PAID ? "Pagada" : status === RecurringInvoiceStatus.OVERDUE ? "Vencida" : "Pendiente"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "paymentDate",
    header: "Fecha de Pago",
    cell: ({ row }) => {
      const date = row.getValue("paymentDate") as Date | undefined
      return date ? formatDate(date) : "-"
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row as Row<Invoice>} />,
  },
]   