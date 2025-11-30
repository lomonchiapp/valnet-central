import { useState, useMemo, useCallback, useEffect, Fragment } from 'react'
import { Link } from 'react-router-dom'
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, ChevronRight, MoreHorizontal, Edit } from 'lucide-react'
import { Articulo, TipoArticulo } from 'shared-types'
import { useAlmacenState } from '@/context/global/useAlmacenState'
import { useActualizarArticulo } from '../hooks/useActualizarArticulo'
import { useAjustarCantidad } from '../hooks/useAjustarCantidad'
import { useEliminarArticulo } from '../hooks/useEliminarArticulo'
import { useSalidaArticulo } from '../hooks/useSalidaArticulo'
import { getAuthState } from '@/stores/authStore'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useArticulosColumns } from './ArticulosDataTable/useArticulosColumns'
import { ArticulosTableToolbar } from './ArticulosDataTable/ArticulosTableToolbar'
import { SpreadsheetNameCell } from '@/features/almacen/inventarios/inventario/components/SpreadsheetNameCell'
import { SpreadsheetEditableCell } from '@/features/almacen/inventarios/inventario/components/SpreadsheetEditableCell'
import { SpreadsheetSelectCell } from '@/features/almacen/inventarios/inventario/components/SpreadsheetSelectCell'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface ArticulosDataTableProps {
  articulos: Articulo[]
}

interface EquipoGroup {
  marca: string
  modelo: string
  equipos: Articulo[]
  key: string
}

type EquipoConDetalles = Articulo & {
  serial?: string
  mac?: string
  cantidad_minima?: number
}

export function ArticulosDataTable({ articulos }: ArticulosDataTableProps) {
  const [viewMode, setViewMode] = useState<'materiales' | 'equipos'>('materiales')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [isSpreadsheetMode, setIsSpreadsheetMode] = useState(false)

  // Hotkey para activar/desactivar modo edición (Ctrl+E o Cmd+E)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Verificar si es Ctrl+E o Cmd+E (sin Shift, Alt, etc.)
      if ((e.ctrlKey || e.metaKey) && e.key === 'e' && !e.shiftKey && !e.altKey) {
        // Prevenir el comportamiento por defecto y detener la propagación
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        
        // Usar el estado previo para determinar el mensaje correcto
        setIsSpreadsheetMode(prev => {
          const nuevoEstado = !prev
          if (nuevoEstado) {
            toast.info('Modo edición activado. Haz clic en cualquier celda para editar.', {
              duration: 3000,
            })
          } else {
            toast.info('Modo edición desactivado.')
          }
          return nuevoEstado
        })
        
        return false
      }
    }

    // Usar capture: true para capturar el evento antes que otros listeners
    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [])

  const { ubicaciones, marcas } = useAlmacenState()
  const { actualizarArticulo } = useActualizarArticulo()
  const { ajustarCantidad } = useAjustarCantidad()
  const { eliminarArticulo } = useEliminarArticulo()
  const { realizarSalida } = useSalidaArticulo()

  // Función para manejar entrada de artículos al inventario
  const handleEntrada = useCallback(async (art: Articulo, cantidad: number) => {
    if (!art.id || !art.idinventario) {
      toast.error('Error: Artículo sin ID o inventario')
      return
    }

    const cantidadAnterior = art.cantidad
    const cantidadNueva = cantidadAnterior + cantidad

    const success = await ajustarCantidad(
      art.id,
      cantidadAnterior,
      cantidadNueva,
      'incremento',
      `Entrada registrada: ${cantidad} ${art.unidad} agregadas al inventario`
    )

    if (success) {
      toast.success(`Se agregaron ${cantidad} ${art.unidad} de ${art.nombre}`)
    }
  }, [ajustarCantidad])

  // Función para manejar salida o transferencia de artículos del inventario
  const handleSalida = useCallback(async (art: Articulo, cantidad: number, descripcion: string, inventarioDestinoId?: string) => {
    if (!art.id || !art.idinventario) {
      toast.error('Error: Artículo sin ID o inventario')
      return
    }

    const { user } = getAuthState()
    const userId = user?.id || 'unknown'

    // Si hay inventario destino, es una transferencia
    if (inventarioDestinoId) {
      const descripcionFinal = descripcion 
        ? `Transferencia de ${cantidad} ${art.unidad} de ${art.nombre} a otro inventario. Notas: ${descripcion}`
        : `Transferencia de ${cantidad} ${art.unidad} de ${art.nombre} a otro inventario`

      const result = await realizarSalida({
        articuloId: art.id,
        inventarioOrigenId: art.idinventario,
        inventarioDestinoId,
        cantidad,
        descripcion: descripcionFinal,
        usuarioId: userId
      })

      if (result.success) {
        toast.success(`Se transfirieron ${cantidad} ${art.unidad} de ${art.nombre}`)
      } else {
        toast.error(result.message || 'Error al transferir el artículo')
      }
    } else {
      // Es una salida pura
      const descripcionFinal = descripcion 
        ? `Salida de ${cantidad} ${art.unidad} de ${art.nombre}. Razón: ${descripcion}`
        : `Salida de ${cantidad} ${art.unidad} de ${art.nombre}`

      const result = await realizarSalida({
        articuloId: art.id,
        inventarioOrigenId: art.idinventario,
        cantidad,
        descripcion: descripcionFinal,
        usuarioId: userId
      })

      if (result.success) {
        toast.success(`Se dieron de salida ${cantidad} ${art.unidad} de ${art.nombre}`)
      } else {
        toast.error(result.message || 'Error al dar salida del artículo')
      }
    }
  }, [realizarSalida])

  // Mantener estas funciones para compatibilidad con el código existente (modo spreadsheet)
  const handleIncrementQuantity = useCallback(async (art: Articulo) => {
    await handleEntrada(art, 1)
  }, [handleEntrada])

  const handleDecrementQuantity = useCallback(async (art: Articulo) => {
    if (art.cantidad <= 0) return
    await handleSalida(art, 1, '')
  }, [handleSalida])

  const handleDirectQuantityEdit = useCallback(async (art: Articulo, newQuantity: number) => {
    if (newQuantity === art.cantidad) return
    await ajustarCantidad(art.id!, art.cantidad, newQuantity, 'directo')
  }, [ajustarCantidad])

  const handleUpdateLocation = useCallback(async (id: string, newLocationId: string) => {
    try {
        await actualizarArticulo({ id, ubicacion: newLocationId })
        toast.success('Ubicación actualizada')
    } catch {
        toast.error('Error al actualizar ubicación')
    }
  }, [actualizarArticulo])

  const handleUpdateCosto = useCallback(async (id: string, newCosto: number) => {
    try {
        await actualizarArticulo({ id, costo: newCosto })
        toast.success('Costo actualizado')
    } catch {
        toast.error('Error al actualizar costo')
    }
  }, [actualizarArticulo])

  const handleUpdateNombre = useCallback(async (id: string, newNombre: string) => {
    try {
        await actualizarArticulo({ id, nombre: newNombre })
        toast.success('Nombre actualizado')
    } catch {
        toast.error('Error al actualizar nombre')
    }
  }, [actualizarArticulo])

  const handleUpdateDescripcion = useCallback(async (id: string, newDescripcion: string) => {
    try {
        await actualizarArticulo({ id, descripcion: newDescripcion })
        toast.success('Descripción actualizada')
    } catch {
        toast.error('Error al actualizar descripción')
    }
  }, [actualizarArticulo])

  const handleUpdateSerial = useCallback(async (id: string, newSerial: string) => {
    try {
        await actualizarArticulo({ id, serial: newSerial })
        toast.success('Serial actualizado')
    } catch {
        toast.error('Error al actualizar serial')
    }
  }, [actualizarArticulo])

  const handleUpdateMac = useCallback(async (id: string, newMac: string) => {
    try {
        await actualizarArticulo({ id, mac: newMac })
        toast.success('MAC actualizada')
    } catch {
        toast.error('Error al actualizar MAC')
    }
  }, [actualizarArticulo])

  const handleUpdateMarca = useCallback(async (id: string, newMarcaId: string) => {
    try {
        await actualizarArticulo({ id, marca: newMarcaId } as { id: string; marca: string })
        toast.success('Marca actualizada')
    } catch {
        toast.error('Error al actualizar marca')
    }
  }, [actualizarArticulo])

  const handleUpdateModelo = useCallback(async (id: string, newModelo: string) => {
    try {
        await actualizarArticulo({ id, modelo: newModelo } as { id: string; modelo: string })
        toast.success('Modelo actualizado')
    } catch {
        toast.error('Error al actualizar modelo')
    }
  }, [actualizarArticulo])
  
  const handleDelete = useCallback(async (id: string) => {
      if (confirm('¿Estás seguro de eliminar este artículo?')) {
          try {
            await eliminarArticulo(id)
            toast.success('Artículo eliminado')
          } catch {
              toast.error('Error al eliminar')
          }
      }
  }, [eliminarArticulo])

  // Obtener columnas usando el hook
  const { baseColumns, materialColumns, equipoColumns, sharedColumns } = useArticulosColumns({
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
  })

  // Filtrar artículos según el modo de vista
  const articulosFiltrados = useMemo(() => {
    return articulos.filter(art => {
      if (viewMode === 'materiales') {
        return art.tipo === TipoArticulo.MATERIAL
      } else {
        return art.tipo === TipoArticulo.EQUIPO
      }
    })
  }, [articulos, viewMode])

  // Obtener el valor del filtro de búsqueda
  const searchFilterValue = useMemo(() => {
    const nombreFilter = columnFilters.find(f => f.id === 'nombre')
    return (nombreFilter?.value as string || '').toLowerCase()
  }, [columnFilters])

  // Aplicar filtro de búsqueda antes de agrupar
  const equiposFiltradosPorBusqueda = useMemo(() => {
    if (viewMode !== 'equipos') return []
    
    if (!searchFilterValue) return articulosFiltrados
    
    return articulosFiltrados.filter(equipo => {
      const nombreMatch = equipo.nombre.toLowerCase().includes(searchFilterValue)
      const equipoConDetalles = equipo as EquipoConDetalles
      const serial = (equipoConDetalles.serial || '').toLowerCase()
      const mac = (equipoConDetalles.mac || '').toLowerCase()
      return nombreMatch || serial.includes(searchFilterValue) || mac.includes(searchFilterValue)
    })
  }, [articulosFiltrados, viewMode, searchFilterValue])

  // Agrupar equipos por marca y modelo (solo si hay más de uno)
  const equiposAgrupados = useMemo(() => {
    if (viewMode !== 'equipos') return { grupos: [], individuales: [] }
    
    const grupos = new Map<string, EquipoGroup>()
    
    equiposFiltradosPorBusqueda.forEach(equipo => {
      const key = `${equipo.marca}-${equipo.modelo}`
      if (!grupos.has(key)) {
        grupos.set(key, {
          marca: equipo.marca,
          modelo: equipo.modelo,
          equipos: [],
          key
        })
      }
      grupos.get(key)!.equipos.push(equipo)
    })
    
    // Separar grupos con múltiples equipos de los individuales
    const gruposMultiples: EquipoGroup[] = []
    const equiposIndividuales: Articulo[] = []
    
    grupos.forEach((grupo) => {
      if (grupo.equipos.length > 1) {
        gruposMultiples.push(grupo)
      } else {
        equiposIndividuales.push(grupo.equipos[0])
      }
    })
    
    return { grupos: gruposMultiples, individuales: equiposIndividuales }
  }, [equiposFiltradosPorBusqueda, viewMode])

  const toggleGroup = useCallback((key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  // Combinar columnas según el modo de vista
  const columns = useMemo(() => [
    ...baseColumns,
    ...(viewMode === 'materiales' ? materialColumns : equipoColumns),
    ...sharedColumns,
  ], [baseColumns, viewMode, materialColumns, equipoColumns, sharedColumns])

  // Para equipos, usar datos vacíos en la tabla ya que renderizamos manualmente
  // Para materiales, usar los datos filtrados normalmente
  const tableData = useMemo(() => {
    if (viewMode === 'equipos') {
      return []
    }
    return articulosFiltrados
  }, [viewMode, articulosFiltrados])

  const table = useReactTable({
    data: tableData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full space-y-4">
      <ArticulosTableToolbar
        table={table}
        articulos={articulos}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isSpreadsheetMode={isSpreadsheetMode}
        setIsSpreadsheetMode={setIsSpreadsheetMode}
      />

      <div className={cn(
        "rounded-md border transition-all",
        isSpreadsheetMode && "border-primary border-2 shadow-lg ring-2 ring-primary/20"
      )}>
        {isSpreadsheetMode && (
          <div className="bg-primary/10 border-b border-primary/30 px-4 py-2 flex items-center gap-2">
            <Edit className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Modo Edición Activo - Haz clic en cualquier celda para editar</span>
            <Badge variant="secondary" className="ml-auto text-xs">
              Ctrl+E para salir
            </Badge>
          </div>
        )}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {viewMode === 'equipos' && (equiposAgrupados.grupos.length > 0 || equiposAgrupados.individuales.length > 0) ? (
              <>
              {/* Renderizado agrupado para equipos */}
              {equiposAgrupados.grupos.map((grupo) => {
                const isExpanded = expandedGroups.has(grupo.key)
                const marcaNombre = marcas.find(m => m.id === grupo.marca)?.nombre || 'GENERICO'
                const primerEquipo = grupo.equipos[0]
                
                return (
                  <Fragment key={grupo.key}>
                    {/* Fila del grupo */}
                    <TableRow 
                        className="bg-gradient-to-r from-muted/40 to-muted/20 hover:from-muted/60 hover:to-muted/30 cursor-pointer transition-all border-l-4 border-l-primary/30"
                        onClick={() => toggleGroup(grupo.key)}
                    >
                        {/* Estado */}
                        <TableCell className="w-[40px]">
                        <div className={cn(
                            "transition-transform inline-block",
                            isExpanded && "rotate-90"
                        )}>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        </TableCell>
                        
                        {/* Nombre */}
                        <TableCell onClick={(e) => e.stopPropagation()}>
                        {isSpreadsheetMode ? (
                            <SpreadsheetNameCell
                                nombre={primerEquipo.nombre}
                                descripcion={primerEquipo.descripcion}
                                onSaveNombre={(val: string) => {
                                    // Actualizar nombre de todos los equipos del grupo
                                    grupo.equipos.forEach(equipo => {
                                        handleUpdateNombre(equipo.id!, val)
                                    })
                                }}
                                onSaveDescripcion={(val: string) => {
                                    // Actualizar descripción de todos los equipos del grupo
                                    grupo.equipos.forEach(equipo => {
                                        handleUpdateDescripcion(equipo.id!, val)
                                    })
                                }}
                                isEditingMode={isSpreadsheetMode}
                            />
                        ) : (
                            <>
                                <Link
                                    to={`/almacen/inventarios/${primerEquipo.idinventario}/articulo/${primerEquipo.id}`}
                                    onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation()
                                    }}
                                    className="font-medium hover:text-primary hover:underline cursor-pointer transition-colors"
                                >
                                    {primerEquipo.nombre}
                                </Link>
                                {primerEquipo.descripcion && (
                                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                    {primerEquipo.descripcion}
                                    </div>
                                )}
                                {!primerEquipo.descripcion && (
                                    <div className="text-xs text-muted-foreground/50 italic">Sin descripción</div>
                                )}
                            </>
                        )}
                        </TableCell>
                        
                        {/* Marca / Modelo */}
                        <TableCell onClick={(e) => e.stopPropagation()}>
                        {isSpreadsheetMode ? (
                            <div className="space-y-1">
                                <SpreadsheetSelectCell
                                    value={primerEquipo.marca || ''}
                                    options={marcas}
                                    onSave={(val: string) => {
                                        // Actualizar marca de todos los equipos del grupo
                                        grupo.equipos.forEach(equipo => {
                                            handleUpdateMarca(equipo.id!, val)
                                        })
                                    }}
                                    placeholder="Seleccionar marca"
                                    isEditingMode={isSpreadsheetMode}
                                    className="text-sm font-medium"
                                />
                                <SpreadsheetEditableCell
                                    value={grupo.modelo || ''}
                                    onSave={(val: string | number) => {
                                        // Actualizar modelo de todos los equipos del grupo
                                        grupo.equipos.forEach(equipo => {
                                            handleUpdateModelo(equipo.id!, String(val))
                                        })
                                    }}
                                    type="text"
                                    isEditingMode={isSpreadsheetMode}
                                    className="text-xs text-muted-foreground"
                                />
                            </div>
                        ) : (
                            <div className="text-sm">
                                <div className="font-medium">{marcaNombre}</div>
                                <div className="text-muted-foreground text-xs">{grupo.modelo || 'GENERICO'}</div>
                            </div>
                        )}
                        </TableCell>
                        
                        {/* Tipo */}
                        <TableCell>
                        <Badge variant="default" className="text-xs">EQUIPO</Badge>
                        </TableCell>
                        
                        {/* Serial - Mostrar cantidad aquí (no editable en grupo) */}
                        <TableCell>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="font-mono text-xs">
                            {grupo.equipos.length} {grupo.equipos.length === 1 ? 'serial' : 'seriales'}
                            </Badge>
                        </div>
                        </TableCell>
                        
                        {/* MAC - Mostrar cantidad aquí (no editable en grupo) */}
                        <TableCell>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="font-mono text-xs">
                            {grupo.equipos.length} {grupo.equipos.length === 1 ? 'MAC' : 'MACs'}
                            </Badge>
                        </div>
                        </TableCell>
                        
                        {/* Ubicación - Mostrar info del grupo (no editable en grupo) */}
                        <TableCell>
                        {primerEquipo.ubicacion ? (
                            <span className="text-sm">
                            {ubicaciones.find(u => u.id === primerEquipo.ubicacion)?.nombre || primerEquipo.ubicacion}
                            </span>
                        ) : (
                            <span className="text-sm text-muted-foreground">Sin ubicación</span>
                        )}
                        </TableCell>
                        
                        {/* Costo - Mostrar info del grupo (no editable en grupo) */}
                        <TableCell>
                        <div className="text-right text-sm font-medium">
                            {new Intl.NumberFormat('es-MX', {
                            style: 'currency',
                            currency: 'MXN',
                            }).format(primerEquipo.costo)}
                        </div>
                        </TableCell>
                        
                        {/* Acciones */}
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones del grupo</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => toast.info('Acciones de grupo no implementadas')}>
                                Ver todos los equipos
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    
                    {/* Filas expandidas de los equipos individuales */}
                    {isExpanded && grupo.equipos.map((equipo) => {
                        // Usamos una fila de tabla estándar para renderizar el contenido
                        // Pero para simular las celdas editables, necesitamos renderizar manualmente 
                        // usando los componentes de celda que tenemos en useArticulosColumns
                        // O simplificar y usar una tabla anidada (pero eso anida tablas que no es ideal)
                        // O mejor aún: usar una instancia temporal de tabla para renderizar la fila
                        
                        // SIMPLIFICACIÓN: Renderizar manualmente usando los mismos componentes que las columnas
                        // Esto es repetitivo pero funciona sin romper el layout de tabla
                        const marcaNombre = marcas.find(m => m.id === equipo.marca)?.nombre || 'GENERICO'
                        
                        // Obtenemos las celdas renderizadas llamando a las funciones de renderizado de columnas manualmente
                        // Esto es un poco hacky pero evita duplicar TODA la lógica de renderizado
                        // NOTA: Para una solución más limpia, deberíamos extraer los renderers de celda a componentes puros
                        
                        // Renderizado MANUAL de la fila expandida
                        return (
                            <TableRow
                            key={equipo.id}
                            className="bg-background/50 hover:bg-muted/20 border-l-4 border-l-primary/10 transition-colors"
                            >
                                {/* Estado */}
                                <TableCell className="w-[40px]">
                                    {(() => {
                                        const equipoDetalles = equipo as EquipoConDetalles
                                        return equipoDetalles.cantidad_minima && equipo.cantidad <= equipoDetalles.cantidad_minima ? (
                                            <AlertTriangle className="h-4 w-4 text-destructive" />
                                        ) : (
                                            <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
                                        )
                                    })()}
                                </TableCell>
                                
                                {/* Nombre - No editable en equipos individuales (se edita en el grupo) */}
                                <TableCell>
                                    <div className="font-medium text-muted-foreground/70">{equipo.nombre}</div>
                                    {equipo.descripcion && <div className="text-xs text-muted-foreground">{equipo.descripcion}</div>}
                                </TableCell>
                                
                                {/* Marca / Modelo - No editable en equipos individuales (se edita en el grupo) */}
                                <TableCell>
                                    <div className="text-sm">
                                        <div className="font-medium text-muted-foreground/70">{marcaNombre}</div>
                                        <div className="text-muted-foreground text-xs">{equipo.modelo || 'GENERICO'}</div>
                                    </div>
                                </TableCell>
                                
                                {/* Tipo */}
                                <TableCell>
                                    <Badge variant="default" className="text-xs">EQUIPO</Badge>
                                </TableCell>
                                
                                {/* Serial */}
                                <TableCell>
                                    {isSpreadsheetMode ? (
                                        <SpreadsheetEditableCell
                                            value={(equipo as EquipoConDetalles).serial || ''}
                                            onSave={(val: string | number) => handleUpdateSerial(equipo.id!, String(val))}
                                            type="text"
                                            isEditingMode={isSpreadsheetMode}
                                            className="font-mono text-sm"
                                            placeholder="Sin serial"
                                        />
                                    ) : (
                                        <span className="font-mono text-sm">{(equipo as EquipoConDetalles).serial || 'Sin serial'}</span>
                                    )}
                                </TableCell>
                                
                                {/* MAC */}
                                <TableCell>
                                    {isSpreadsheetMode ? (
                                        <SpreadsheetEditableCell
                                            value={(equipo as EquipoConDetalles).mac || ''}
                                            onSave={(val: string | number) => handleUpdateMac(equipo.id!, String(val))}
                                            type="text"
                                            isEditingMode={isSpreadsheetMode}
                                            className="font-mono text-sm"
                                            placeholder="Sin MAC"
                                        />
                                    ) : (
                                        <span className="font-mono text-sm">{(equipo as EquipoConDetalles).mac || 'Sin MAC'}</span>
                                    )}
                                </TableCell>
                                
                                {/* Ubicación */}
                                <TableCell>
                                    {isSpreadsheetMode ? (
                                        <SpreadsheetSelectCell
                                            value={equipo.ubicacion || ''}
                                            options={ubicaciones}
                                            onSave={(val: string) => handleUpdateLocation(equipo.id!, val)}
                                            placeholder="Sin ubicación"
                                            isEditingMode={isSpreadsheetMode}
                                        />
                                    ) : (
                                        <span>{ubicaciones.find(u => u.id === equipo.ubicacion)?.nombre || equipo.ubicacion || 'Sin ubicación'}</span>
                                    )}
                                </TableCell>
                                
                                {/* Costo */}
                                <TableCell className="text-right">
                                    {isSpreadsheetMode ? (
                                        <SpreadsheetEditableCell
                                            value={equipo.costo}
                                            onSave={(val: string | number) => handleUpdateCosto(equipo.id!, Number(val))}
                                            type="currency"
                                            isEditingMode={isSpreadsheetMode}
                                            className="text-right"
                                        />
                                    ) : (
                                        <span>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(equipo.costo)}</span>
                                    )}
                                </TableCell>
                                
                                {/* Acciones */}
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(equipo.id!)}>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                  </Fragment>
                )
              })}
              
              {/* Equipos individuales (sin agrupar) */}
              {equiposAgrupados.individuales.map((equipo) => {
                const marcaNombre = marcas.find(m => m.id === equipo.marca)?.nombre || 'GENERICO'
                const equipoDetalles = equipo as EquipoConDetalles
                 
                 return (
                    <TableRow key={equipo.id}>
                        <TableCell>
                            {equipoDetalles.cantidad_minima && equipo.cantidad <= equipoDetalles.cantidad_minima ? (
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                            ) : (
                                <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
                            )}
                        </TableCell>
                        <TableCell>
                            {isSpreadsheetMode ? (
                                <SpreadsheetNameCell
                                    nombre={equipo.nombre}
                                    descripcion={equipo.descripcion}
                                    onSaveNombre={(val: string) => handleUpdateNombre(equipo.id!, val)}
                                    onSaveDescripcion={(val: string) => handleUpdateDescripcion(equipo.id!, val)}
                                    isEditingMode={isSpreadsheetMode}
                                />
                            ) : (
                                <>
                                    <div className="font-medium">{equipo.nombre}</div>
                                    {equipo.descripcion && <div className="text-xs text-muted-foreground">{equipo.descripcion}</div>}
                                </>
                            )}
                        </TableCell>
                        <TableCell>
                            {isSpreadsheetMode ? (
                                <div className="space-y-1">
                                    <SpreadsheetSelectCell
                                        value={equipo.marca || ''}
                                        options={marcas}
                                        onSave={(val: string) => handleUpdateMarca(equipo.id!, val)}
                                        placeholder="Seleccionar marca"
                                        isEditingMode={isSpreadsheetMode}
                                        className="text-sm font-medium"
                                    />
                                    <SpreadsheetEditableCell
                                        value={equipo.modelo || ''}
                                        onSave={(val: string | number) => handleUpdateModelo(equipo.id!, String(val))}
                                        type="text"
                                        isEditingMode={isSpreadsheetMode}
                                        className="text-xs text-muted-foreground"
                                    />
                                </div>
                            ) : (
                                <div className="text-sm">
                                    <div className="font-medium">{marcaNombre}</div>
                                    <div className="text-muted-foreground text-xs">{equipo.modelo || 'GENERICO'}</div>
                                </div>
                            )}
                        </TableCell>
                        <TableCell><Badge variant="default">EQUIPO</Badge></TableCell>
                        <TableCell>
                            {isSpreadsheetMode ? (
                                <SpreadsheetEditableCell
                                    value={equipoDetalles.serial || ''}
                                    onSave={(val: string | number) => handleUpdateSerial(equipo.id!, String(val))}
                                    type="text"
                                    isEditingMode={isSpreadsheetMode}
                                    className="font-mono text-sm"
                                    placeholder="Sin serial"
                                />
                            ) : (
                                <span className="font-mono text-sm">{equipoDetalles.serial || ''}</span>
                            )}
                        </TableCell>
                        <TableCell>
                            {isSpreadsheetMode ? (
                                <SpreadsheetEditableCell
                                    value={equipoDetalles.mac || ''}
                                    onSave={(val: string | number) => handleUpdateMac(equipo.id!, String(val))}
                                    type="text"
                                    isEditingMode={isSpreadsheetMode}
                                    className="font-mono text-sm"
                                    placeholder="Sin MAC"
                                />
                            ) : (
                                <span className="font-mono text-sm">{equipoDetalles.mac || ''}</span>
                            )}
                        </TableCell>
                        <TableCell>
                            {isSpreadsheetMode ? (
                                <SpreadsheetSelectCell
                                    value={equipo.ubicacion || ''}
                                    options={ubicaciones}
                                    onSave={(val: string) => handleUpdateLocation(equipo.id!, val)}
                                    placeholder="Sin ubicación"
                                    isEditingMode={isSpreadsheetMode}
                                />
                            ) : (
                                <span>{ubicaciones.find(u => u.id === equipo.ubicacion)?.nombre || equipo.ubicacion}</span>
                            )}
                        </TableCell>
                        <TableCell className="text-right">
                            {isSpreadsheetMode ? (
                                <SpreadsheetEditableCell
                                    value={equipo.costo}
                                    onSave={(val: string | number) => handleUpdateCosto(equipo.id!, Number(val))}
                                    type="currency"
                                    isEditingMode={isSpreadsheetMode}
                                    className="text-right"
                                />
                            ) : (
                                <span>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(equipo.costo)}</span>
                            )}
                        </TableCell>
                        <TableCell>
                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(equipo.id!)}>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                 )
              })}
              </>
            ) : table.getRowModel().rows?.length ? (
              // Renderizado normal para materiales o equipos sin agrupar
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{' '}
          {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}