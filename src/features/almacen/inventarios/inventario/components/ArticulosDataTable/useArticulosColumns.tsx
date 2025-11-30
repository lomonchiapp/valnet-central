import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ColumnDef } from '@tanstack/react-table'
import { Articulo, TipoArticulo } from 'shared-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowUpDown, Minus, MoreHorizontal, Plus } from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { EditableCell, QuantityCell } from '../EditableCell'
import { EntradaDialog } from '../EntradaDialog'
import { SalidaDialog } from '../SalidaDialog'
import { EditableSelectCell } from '../EditableSelectCell'
import { SpreadsheetEditableCell } from '../SpreadsheetEditableCell'
import { SpreadsheetNameCell } from '../SpreadsheetNameCell'
import { SpreadsheetSelectCell } from '../SpreadsheetSelectCell'

interface UseArticulosColumnsProps {
  marcas: any[]
  ubicaciones: any[]
  isSpreadsheetMode: boolean
  handleUpdateNombre: (id: string, val: string) => void
  handleUpdateDescripcion: (id: string, val: string) => void
  handleUpdateMarca: (id: string, val: string) => void
  handleUpdateModelo: (id: string, val: string) => void
  handleUpdateSerial: (id: string, val: string) => void
  handleUpdateMac: (id: string, val: string) => void
  handleUpdateLocation: (id: string, val: string) => void
  handleUpdateCosto: (id: string, val: number) => void
  handleEntrada: (art: Articulo, cantidad: number) => void
  handleSalida: (art: Articulo, cantidad: number, descripcion: string) => void
  handleIncrementQuantity: (art: Articulo) => void
  handleDecrementQuantity: (art: Articulo) => void
  handleDirectQuantityEdit: (art: Articulo, val: number) => void
  handleDelete: (id: string) => void
}

export function useArticulosColumns({
  marcas,
  ubicaciones,
  isSpreadsheetMode,
  handleUpdateNombre,
  handleUpdateDescripcion,
  handleUpdateMarca,
  handleUpdateModelo,
  handleUpdateSerial,
  handleUpdateMac,
  handleUpdateLocation,
  handleUpdateCosto,
  handleEntrada,
  handleSalida,
  handleIncrementQuantity,
  handleDecrementQuantity,
  handleDirectQuantityEdit,
  handleDelete
}: UseArticulosColumnsProps) {

  const baseColumns: ColumnDef<Articulo>[] = useMemo(() => [
    {
      accessorKey: 'estado',
      header: '',
      cell: ({ row }) => {
        const art = row.original
        if (art.tipo === TipoArticulo.MATERIAL) {
          const bajoStock = art.cantidad_minima && art.cantidad <= art.cantidad_minima
          return bajoStock ? (
              <div title="Bajo Stock">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
          ) : null
        }
        return null
      },
      size: 40,
    },
    {
        accessorKey: 'nombre',
        header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Nombre
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const art = row.original
        // Solo usar SpreadsheetNameCell cuando está en modo edición
        if (isSpreadsheetMode) {
          return (
            <SpreadsheetNameCell
              nombre={art.nombre}
              descripcion={art.descripcion}
              onSaveNombre={(val) => handleUpdateNombre(art.id!, val)}
              onSaveDescripcion={(val) => handleUpdateDescripcion(art.id!, val)}
              isEditingMode={isSpreadsheetMode}
            />
          )
        }
        // En modo normal, hacer el nombre clickeable para ver detalles
        const nombreVacio = !art.nombre || art.nombre.trim() === ''
        return (
          <div className="space-y-1 px-2">
            {nombreVacio ? (
              <div className="font-medium text-muted-foreground/50 italic">Sin nombre</div>
            ) : (
              <Link
                to={`/almacen/inventarios/${art.idinventario}/articulo/${art.id}`}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                }}
                className="font-medium hover:text-primary hover:underline cursor-pointer transition-colors"
              >
                {art.nombre}
              </Link>
            )}
            {art.descripcion ? (
              <div className="text-xs text-muted-foreground">{art.descripcion}</div>
            ) : (
              <div className="text-xs text-muted-foreground/50 italic">Sin descripción</div>
            )}
          </div>
        )
      },
      filterFn: (row, id, value) => {
        const searchValue = String(value || '').toLowerCase()
        if (!searchValue) return true
        
        const art = row.original
        const nombreMatch = art.nombre.toLowerCase().includes(searchValue)
        
        if (art.tipo === TipoArticulo.EQUIPO) {
          const serial = ((art as any).serial || '').toLowerCase()
          const mac = ((art as any).mac || '').toLowerCase()
          return nombreMatch || serial.includes(searchValue) || mac.includes(searchValue)
        }
        
        return nombreMatch
      },
    },
    {
        accessorKey: 'marca',
        header: 'Marca / Modelo',
        cell: ({ row }) => {
            const marcaId = row.original.marca
            const marcaNombre = marcas.find(m => m.id === marcaId)?.nombre || 'GENERICO'
            const modelo = row.original.modelo || 'GENERICO'
            if (isSpreadsheetMode) {
              return (
                <div className="space-y-1">
                  <SpreadsheetSelectCell
                    value={marcaId || ''}
                    options={marcas}
                    onSave={(val) => handleUpdateMarca(row.original.id!, val)}
                    placeholder="Seleccionar marca"
                    isEditingMode={isSpreadsheetMode}
                    className="text-sm font-medium"
                  />
                  <SpreadsheetEditableCell
                    value={modelo}
                    onSave={(val) => handleUpdateModelo(row.original.id!, String(val))}
                    type="text"
                    isEditingMode={isSpreadsheetMode}
                    className="text-xs text-muted-foreground"
                  />
                </div>
              )
            }
            return (
                <div className="text-sm">
                    <div className="font-medium">{marcaNombre}</div>
                    <div className="text-muted-foreground text-xs">{modelo}</div>
                </div>
            )
        }
    },
    {
        accessorKey: 'tipo',
        header: 'Tipo',
        cell: ({ row }) => {
            const tipo = row.getValue('tipo') as string
            return (
                <Badge variant={tipo === TipoArticulo.EQUIPO ? 'default' : 'outline'}>
                    {tipo}
                </Badge>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
  ], [marcas, handleUpdateNombre, handleUpdateDescripcion, handleUpdateMarca, handleUpdateModelo, isSpreadsheetMode])

  const materialColumns: ColumnDef<Articulo>[] = useMemo(() => [
    {
        accessorKey: 'cantidad',
        header: 'Cantidad',
        cell: ({ row }) => {
            const art = row.original
            // Usar QuantityCell tanto en modo normal como en spreadsheet
            // QuantityCell maneja los diálogos internamente
            return (
                <QuantityCell
                    articulo={art}
                    onEntrada={(cantidad) => handleEntrada(art, cantidad)}
                    onSalida={(cantidad, descripcion) => handleSalida(art, cantidad, descripcion)}
                    onDirectEdit={(newVal) => handleDirectQuantityEdit(art, newVal)}
                    isMaterial={true}
                />
            )
        }
    },
  ], [handleEntrada, handleSalida, handleIncrementQuantity, handleDecrementQuantity, handleDirectQuantityEdit, isSpreadsheetMode])

  const equipoColumns: ColumnDef<Articulo>[] = useMemo(() => [
    {
        accessorKey: 'serial',
        header: 'Serial (S/N)',
        cell: ({ row }) => {
            const art = row.original
            const serial = (art as any).serial || ''
            if (isSpreadsheetMode) {
              return (
                <SpreadsheetEditableCell
                  value={serial}
                  onSave={(val) => handleUpdateSerial(art.id!, String(val))}
                  type="text"
                  isEditingMode={isSpreadsheetMode}
                  className="font-mono text-sm"
                  placeholder="Sin serial"
                />
              )
            }
            return (
                <EditableCell
                    value={serial}
                    onSave={(val) => handleUpdateSerial(art.id!, String(val))}
                    type="text"
                    className="font-mono text-sm"
                    placeholder="Sin serial"
                />
            )
        }
    },
    {
        accessorKey: 'mac',
        header: 'MAC Address',
        cell: ({ row }) => {
            const art = row.original
            const mac = (art as any).mac || ''
            if (isSpreadsheetMode) {
              return (
                <SpreadsheetEditableCell
                  value={mac}
                  onSave={(val) => handleUpdateMac(art.id!, String(val))}
                  type="text"
                  isEditingMode={isSpreadsheetMode}
                  className="font-mono text-sm"
                  placeholder="Sin MAC"
                />
              )
            }
            return (
                <EditableCell
                    value={mac}
                    onSave={(val) => handleUpdateMac(art.id!, String(val))}
                    type="text"
                    className="font-mono text-sm"
                    placeholder="Sin MAC"
                />
            )
        }
    },
  ], [handleUpdateSerial, handleUpdateMac, isSpreadsheetMode])

  const sharedColumns: ColumnDef<Articulo>[] = useMemo(() => [
    {
        accessorKey: 'ubicacion',
        header: 'Ubicación',
        cell: ({ row }) => {
            const art = row.original
            // Usar SpreadsheetSelectCell en modo spreadsheet y EditableSelectCell en modo normal
            if (isSpreadsheetMode) {
              return (
                <SpreadsheetSelectCell
                  value={art.ubicacion || ''}
                  options={ubicaciones}
                  onSave={(val) => handleUpdateLocation(art.id!, val)}
                  placeholder="Sin ubicación"
                  isEditingMode={isSpreadsheetMode}
                />
              )
            }
            return (
                <EditableSelectCell
                    value={art.ubicacion || ''}
                    options={ubicaciones}
                    onSave={(val) => handleUpdateLocation(art.id!, val)}
                    placeholder="Sin ubicación"
                />
            )
        }
    },
    {
        accessorKey: 'costo',
        header: () => <div className="text-right">Costo</div>,
        cell: ({ row }) => {
            const art = row.original
            if (isSpreadsheetMode) {
              return (
                <div className="text-right">
                  <SpreadsheetEditableCell
                    value={art.costo}
                    onSave={(val) => handleUpdateCosto(art.id!, Number(val))}
                    type="currency"
                    isEditingMode={isSpreadsheetMode}
                    className="text-right"
                  />
                </div>
              )
            }
            return (
                <div className="text-right">
                    <EditableCell
                        value={art.costo}
                        onSave={(val) => handleUpdateCosto(art.id!, Number(val))}
                        type="currency"
                        className="text-right"
                    />
                </div>
            )
        },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const art = row.original
 
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(art.id!)}
              >
                Copiar ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast.info('Detalles no implementado')}>Ver detalles</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info('Historial no implementado')}>Ver historial</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => handleDelete(art.id!)}
              >
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [ubicaciones, handleUpdateLocation, handleUpdateCosto, handleDelete, isSpreadsheetMode])

  return {
    baseColumns,
    materialColumns,
    equipoColumns,
    sharedColumns
  }
}
