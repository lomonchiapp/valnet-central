import { ColumnDef } from '@tanstack/react-table'
import { Articulo, TipoArticulo } from 'shared-types'
import { Badge } from '@/components/ui/badge'
import { TableActions } from './TableActions'

export function getArticulosColumns(actions: {
  onVer?: (articulo: Articulo) => void
  onEditar?: (articulo: Articulo) => void
  onTransferir?: (articulo: Articulo) => void
  onEliminar?: (articulo: Articulo) => void
}): ColumnDef<Articulo>[] {
  return [
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: info => (
        <div>
          <div className='font-semibold'>{info.getValue() as string}</div>
          {info.row.original.descripcion && (
            <div className='text-xs text-muted-foreground'>{info.row.original.descripcion}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'tipo',
      header: 'Tipo',
      cell: info => <Badge variant={info.getValue() === TipoArticulo.EQUIPO ? 'default' : 'outline'}>{info.getValue() as string}</Badge>,
    },
    {
      accessorKey: 'cantidad',
      header: 'Cantidad',
      cell: info => <span>{info.getValue() as number}</span>,
    },
    {
      accessorKey: 'marca',
      header: 'Marca',
      cell: info => info.getValue() as string,
    },
    {
      accessorKey: 'modelo',
      header: 'Modelo',
      cell: info => info.getValue() as string,
    },
    {
      accessorKey: 'serial',
      header: 'Serial',
      cell: info => info.getValue() as string || 'N/A',
    },
    {
      accessorKey: 'costo',
      header: 'Costo',
      cell: info => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(info.getValue())),
    },
    {
      accessorKey: 'ubicacion',
      header: 'Ubicación',
      cell: info => info.getValue() as string,
    },
    {
      id: 'acciones',
      header: '',
      cell: info => <TableActions articulo={info.row.original} {...actions} />,
      enableSorting: false,
      enableHiding: false,
    },
  ]
} 