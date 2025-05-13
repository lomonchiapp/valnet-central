import { ColumnDef } from "@tanstack/react-table"
import { RecurringInvoice } from "@/types"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { CitizenCell } from "./citizen-cell"
import { ServiceCell } from "./service-cell"
import { InvoiceStatus } from "@/types/enums"
import { Timestamp } from 'firebase/firestore'

export const recurringColumns: ColumnDef<RecurringInvoice>[] = [
  {
    accessorKey: "invoiceNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="No. de Factura" />
    ),
    cell: ({ row }) => <span>{row.getValue("invoiceNumber")}</span>,
    size: 50,

  },
  {
    accessorKey: "citizenId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contribuyente" />
    ),
    cell: ({ row }) => <CitizenCell citizenId={row.getValue("citizenId")} />,
    size: 100,
  },
  {
    accessorKey: "serviceAssignmentId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Servicio" />
    ),
    cell: ({ row }) => <ServiceCell serviceAssignmentId={row.getValue("serviceAssignmentId")} />,
    size: 200,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Monto" />
    ),
    cell: ({ row }) => formatCurrency(row.getValue("amount")),
    size: 100,
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vencimiento" />
    ),
    cell: ({ row }) => {
      const dueDate = row.getValue("dueDate")
      
      // Convertir Timestamp de Firebase a Date
      const date = dueDate instanceof Timestamp 
        ? dueDate.toDate() 
        : new Date(dueDate as string)
      
      date.setHours(0, 0, 0, 0) // Ahora funciona porque es Date
      return formatDate(date)
    },
    size: 150,
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const dueDate = row.getValue("dueDate")
      const status = row.getValue("status") as InvoiceStatus
      
      // Convertir Timestamp a Date
      const currentDate = new Date()
      const paymentDate = dueDate instanceof Timestamp 
        ? dueDate.toDate() 
        : new Date(dueDate as string)
      
      paymentDate.setHours(0, 0, 0, 0)
      
      // Si está pagada, mostrar como pagada sin importar la fecha
      if (status === InvoiceStatus.PAID) {
        return <Badge variant="default">Pagada</Badge>
      }

      // Si no está pagada, verificar si está vencida
      if (paymentDate < currentDate) {
        return <Badge variant="destructive">Vencida</Badge>
      }
      
      // Si no está pagada y no está vencida, está pendiente
      return <Badge variant="secondary">Pendiente</Badge>
    },
    size: 100,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
    size: 100,
  },
] 