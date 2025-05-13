import { ColumnDef, Row } from "@tanstack/react-table"
import { Payment } from "@/types"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { CitizenCell } from "./citizen-cell"
import { ServiceCell } from "./service-cell"
import { PaymentStatus } from "@/types/enums"
import { InvoiceNumberCell } from "./invoice-number-cell"

export const paymentColumns: ColumnDef<Payment>[] = [
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
    accessorKey: "invoiceId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Número de Factura" />
    ),
    cell: ({ row }) => <InvoiceNumberCell invoiceId={row.getValue("invoiceId")} />
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Monto" />
    ),
    cell: ({ row }) => formatCurrency(row.getValue("amount")),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as PaymentStatus
      return (
        <Badge
          variant={
            status === PaymentStatus.CONFIRMED 
              ? "default" 
              : status === PaymentStatus.PENDING 
                ? "destructive" 
                : "secondary"
          }
        >
          {status === PaymentStatus.CONFIRMED ? "Pagada" : 
           status === PaymentStatus.PENDING ? "Pendiente" : "Cancelada"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row as Row<Payment>} />,
  },
] 