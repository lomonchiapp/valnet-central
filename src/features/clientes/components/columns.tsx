import { ColumnDef, Row } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { Citizen } from '@/types/interfaces/valnet/cliente'
import { MonthlyPaymentCell } from './monthly-payment-cell'
import { DebtCell } from './debt-cell'
import { LocationCell } from './location-cell'
import { PendingInfoCell } from './pending-info-cell'

export const columns: ColumnDef<Citizen>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Seleccionar todo'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Seleccionar fila'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'citizenCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Código' />
    ),
    cell: ({ row }) => (
      <div>{row.original.citizenCode}</div>
    ),
  },
  {
    accessorKey: 'firstName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre' />
    ),
    cell: ({ row }) => (
      <div>{`${row.original.firstName} ${row.original.lastName}`}</div>
    ),
  },
  {
    accessorKey: 'cedula',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cédula' />
    ),
    cell: ({ row }) => {
      const cedula = row.getValue('cedula')
      return cedula || <span className="text-muted-foreground">No disponible</span>
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Teléfono' />
    ),
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Dirección' />
    ),
  },
  {
    accessorKey: 'monthlyPayment',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Pago Mensual' />
    ),
    cell: ({ row }) => {
      const citizen = row.original
      return <MonthlyPaymentCell citizenId={citizen.id} />
    },
    enableSorting: false,
  },
  {
    accessorKey: 'debt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Deuda' />
    ),
    cell: ({ row }) => <DebtCell citizenId={row.original.id} />,
    enableSorting: false,
  },
  {
    id: 'location',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ubicación' />
    ),
    cell: ({ row }) => {
      const { lat, lng, address } = row.original
      return <LocationCell lat={lat} lng={lng} address={address} />
    },
  },
  {
    accessorKey: 'pendingInfo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Info' />
    ),
    cell: ({ row }) => {
      const pendingInfo = row.getValue('pendingInfo') as boolean
      return <PendingInfoCell citizen={row.original} pendingInfo={pendingInfo} />
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row as Row<Citizen>} />,
  },
]






