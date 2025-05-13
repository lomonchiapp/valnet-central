import { ColumnDef } from "@tanstack/react-table"
import { Invoice } from "@/types"
import { DataTableColumnHeader } from "./components/data-table-column-header"
import { DataTableRowActions } from "./components/data-table-row-actions"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { InvoiceStatus } from "@/types/enums"
import { CitizenCell } from "@/features/payments/components/citizen-cell"
import { ServiceCell } from "@/features/payments/components/service-cell"


export const invoiceColumns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "citizenId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contribuyente" />
    ),
    cell: ({ row }) => <CitizenCell citizenId={row.getValue("citizenId")} />
  },
  {
    accessorKey: "serviceAssignmentId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Servicio" />
    ),
    cell: ({ row }) => <ServiceCell serviceAssignmentId={row.getValue("serviceAssignmentId")} />
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
      const status = row.getValue("status") as InvoiceStatus
      return (
        <Badge
          variant={
            status === InvoiceStatus.PAID 
              ? "default" 
              : status === InvoiceStatus.OVERDUE 
                ? "destructive" 
                : "secondary"
          }
        >
          {status === InvoiceStatus.PAID ? "Pagada" : status === InvoiceStatus.OVERDUE ? "Vencida" : "Pendiente"}
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
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
] 