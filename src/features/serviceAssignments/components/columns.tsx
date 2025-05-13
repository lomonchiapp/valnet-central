import { ColumnDef } from "@tanstack/react-table"
import { ServiceAssignment } from "@/types"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { CitizenCell } from "./citizen-cell"
import { ServiceCell } from "./service-cell"
import { useGlobalState } from "@/context/global/useGlobalState"
import { Timestamp } from 'firebase/firestore'

function TotalDebtCell({ serviceAssignmentId }: { serviceAssignmentId: string }) {
  const { recurringInvoices } = useGlobalState()
  
  const totalDebt = recurringInvoices
    .filter(invoice => {
      // Filtrar por serviceAssignmentId y verificar si está vencida
      if (invoice.serviceAssignmentId !== serviceAssignmentId) return false
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const dueDate = invoice.dueDate instanceof Timestamp 
        ? invoice.dueDate.toDate() 
        : new Date(invoice.dueDate)
      
      dueDate.setHours(0, 0, 0, 0)
      
      return dueDate < today && invoice.status === 'pendiente'
    })
    .reduce((sum, invoice) => sum + invoice.amount, 0)

  return (
    <div className={totalDebt > 0 ? "text-destructive font-medium" : ""}>
      {formatCurrency(totalDebt)}
    </div>
  )
}

export const columns: ColumnDef<ServiceAssignment>[] = [
  {
    accessorKey: "citizenId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contribuyente" />
    ),
    cell: ({ row }) => <CitizenCell citizenId={row.getValue("citizenId")} />
  },
  {
    accessorKey: "serviceId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Servicio" />
    ),
    cell: ({ row }) => <ServiceCell serviceId={row.getValue("serviceId")} />
  },
  {
    accessorKey: "description",
    header: "Descripción",
  },
  {
    accessorKey: "monthlyPaymentAmount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pago Mensual" />
    ),
    cell: ({ row }) => formatCurrency(row.getValue("monthlyPaymentAmount")),
  },
  {
    accessorKey: "paymentDay",
    header: "Día de Pago",
    cell: ({ row }) => `Día ${row.getValue("paymentDay")}`,
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          variant={
            status === "active" 
              ? "default" 
              : status === "suspended" 
                ? "destructive" 
                : "secondary"
          }
        >
          {status === "active" ? "Activo" : status === "suspended" ? "Suspendido" : "Inactivo"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "totalDebt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Deuda Total" />
    ),
    cell: ({ row }) => <TotalDebtCell serviceAssignmentId={row.original.id} />,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
] 