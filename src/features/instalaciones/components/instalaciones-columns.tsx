import { ColumnDef } from '@tanstack/react-table';
import { InstalacionMikrowisp } from '@/types/interfaces/valnet/instalacionMikrowisp';

export const instalacionesColumns: ColumnDef<InstalacionMikrowisp>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => row.original.id,
  },
  {
    accessorKey: 'cliente',
    header: 'Cliente',
    cell: ({ row }) => row.original.cliente,
  },
  {
    accessorKey: 'direccion',
    header: 'Dirección',
    cell: ({ row }) => row.original.direccion,
  },
  {
    accessorKey: 'telefono',
    header: 'Teléfono',
    cell: ({ row }) => row.original.telefono,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => row.original.email,
  },
  {
    accessorKey: 'estate',
    header: 'Estado',
    cell: ({ row }) => row.original.estate,
  },
  {
    accessorKey: 'fecha_ingreso',
    header: 'Fecha Ingreso',
    cell: ({ row }) => row.original.fecha_ingreso,
  },
  {
    accessorKey: 'fecha_instalacion',
    header: 'Fecha Instalación',
    cell: ({ row }) => row.original.fecha_instalacion,
  },
]; 