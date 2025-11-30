import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  ArrowUpRight, 
  ArrowDownRight, 
  Repeat, 
  Calendar, 
  Package, 
  User,
  Download,
  FileText,
  Edit,
  Filter
} from 'lucide-react'
import { useAlmacenState } from '@/context/global/useAlmacenState'
import { Movimiento, TipoMovimiento } from '@/types/interfaces/almacen/movimiento'
import { Inventario } from 'shared-types'
import { Articulo } from 'shared-types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const ITEMS_PER_PAGE = 20

export default function MovimientosInventarioPage() {
  const { id: inventarioId } = useParams<{ id: string }>()
  const {
    inventarios,
    movimientos,
    articulos,
    subscribeToInventarios,
    subscribeToMovimientos,
    subscribeToArticulos,
  } = useAlmacenState()
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'movimientos' | 'ediciones'>('todos')
  const [tipoMovimientoFiltro, setTipoMovimientoFiltro] = useState<'todos' | TipoMovimiento>('todos')

  useEffect(() => {
    setIsLoading(true)
    const unsubscribeInventarios = subscribeToInventarios()
    const unsubscribeMovimientos = subscribeToMovimientos()
    const unsubscribeArticulos = subscribeToArticulos()

    const timer = setTimeout(() => setIsLoading(false), 500)

    return () => {
      unsubscribeInventarios()
      unsubscribeMovimientos()
      unsubscribeArticulos()
      clearTimeout(timer)
    }
  }, [subscribeToInventarios, subscribeToMovimientos, subscribeToArticulos])

  // Función helper para convertir fechas de Firestore
  const convertFirestoreDate = (dateValue: unknown): Date | null => {
    if (!dateValue) return null
    
    try {
      if (dateValue && typeof dateValue === 'object' && 'toDate' in dateValue) {
        const timestamp = dateValue as { toDate: () => Date }
        return timestamp.toDate()
      }
      if (dateValue instanceof Date) {
        return dateValue
      }
      if (typeof dateValue === 'string') {
        const date = new Date(dateValue)
        return isNaN(date.getTime()) ? null : date
      }
      return null
    } catch {
      return null
    }
  }

  const inventario = useMemo(() => {
    return inventarios.find((inv: Inventario) => inv.id === inventarioId)
  }, [inventarios, inventarioId])

  // Separar movimientos de ediciones
  const { movimientosReales, ediciones } = useMemo(() => {
    if (!inventarioId) return { movimientosReales: [], ediciones: [] }
    
    const todos = movimientos.filter((mov: Movimiento) => {
      return (
        mov.idinventario_origen === inventarioId ||
        mov.idinventario_destino === inventarioId
      )
    })

    // Las ediciones tienen valoresAnteriores y valoresNuevos
    const ediciones = todos.filter((mov: Movimiento & { valoresAnteriores?: unknown; valoresNuevos?: unknown }) => 
      mov.valoresAnteriores || mov.valoresNuevos
    )
    
    // Los movimientos reales son los que no son ediciones
    const movimientosReales = todos.filter((mov: Movimiento & { valoresAnteriores?: unknown; valoresNuevos?: unknown }) => 
      !mov.valoresAnteriores && !mov.valoresNuevos
    )

    return { 
      movimientosReales: movimientosReales.sort((a, b) => {
        const fechaA = convertFirestoreDate(a.fecha) || new Date(0)
        const fechaB = convertFirestoreDate(b.fecha) || new Date(0)
        return fechaB.getTime() - fechaA.getTime()
      }),
      ediciones: ediciones.sort((a, b) => {
        const fechaA = convertFirestoreDate(a.fecha) || new Date(0)
        const fechaB = convertFirestoreDate(b.fecha) || new Date(0)
        return fechaB.getTime() - fechaA.getTime()
      })
    }
  }, [movimientos, inventarioId])

  // Aplicar filtros
  const datosFiltrados = useMemo(() => {
    let datos: Movimiento[] = []
    
    if (tipoFiltro === 'movimientos') {
      datos = movimientosReales
    } else if (tipoFiltro === 'ediciones') {
      datos = ediciones
    } else {
      datos = [...movimientosReales, ...ediciones].sort((a, b) => {
        const fechaA = convertFirestoreDate(a.fecha) || new Date(0)
        const fechaB = convertFirestoreDate(b.fecha) || new Date(0)
        return fechaB.getTime() - fechaA.getTime()
      })
    }

    if (tipoMovimientoFiltro !== 'todos') {
      datos = datos.filter(mov => mov.tipo === tipoMovimientoFiltro)
    }

    return datos
  }, [movimientosReales, ediciones, tipoFiltro, tipoMovimientoFiltro])

  // Paginación
  const totalPages = Math.ceil(datosFiltrados.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const datosPaginados = datosFiltrados.slice(startIndex, endIndex)

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [tipoFiltro, tipoMovimientoFiltro])

  // Estadísticas
  const estadisticas = useMemo(() => {
    const entradas = movimientosReales.filter(
      (m: Movimiento) => m.tipo === TipoMovimiento.ENTRADA
    ).length
    const salidas = movimientosReales.filter(
      (m: Movimiento) => m.tipo === TipoMovimiento.SALIDA
    ).length
    const transferencias = movimientosReales.filter(
      (m: Movimiento) => m.tipo === TipoMovimiento.TRANSFERENCIA
    ).length

    return { 
      entradas, 
      salidas, 
      transferencias, 
      totalMovimientos: movimientosReales.length,
      totalEdiciones: ediciones.length,
      total: movimientosReales.length + ediciones.length
    }
  }, [movimientosReales, ediciones])

  const getMovimientoColor = (tipo: TipoMovimiento) => {
    switch (tipo) {
      case TipoMovimiento.ENTRADA:
        return 'bg-green-100 text-green-800 border-green-200'
      case TipoMovimiento.SALIDA:
        return 'bg-red-100 text-red-800 border-red-200'
      case TipoMovimiento.TRANSFERENCIA:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getMovimientoIcon = (tipo: TipoMovimiento) => {
    switch (tipo) {
      case TipoMovimiento.ENTRADA:
        return <ArrowUpRight className="h-4 w-4" />
      case TipoMovimiento.SALIDA:
        return <ArrowDownRight className="h-4 w-4" />
      case TipoMovimiento.TRANSFERENCIA:
        return <Repeat className="h-4 w-4" />
      default:
        return null
    }
  }

  const getMovimientoLabel = (tipo: TipoMovimiento) => {
    switch (tipo) {
      case TipoMovimiento.ENTRADA:
        return 'Entrada'
      case TipoMovimiento.SALIDA:
        return 'Salida'
      case TipoMovimiento.TRANSFERENCIA:
        return 'Transferencia'
      default:
        return tipo
    }
  }

  const formatDate = (date: Date | string | unknown) => {
    const dateObj = convertFirestoreDate(date) || (date instanceof Date ? date : new Date(String(date)))
    if (!dateObj || isNaN(dateObj.getTime())) return 'Fecha inválida'
    
    return format(dateObj, 'dd MMM yyyy HH:mm', { locale: es })
  }

  const getArticuloNombre = (articuloId: string) => {
    const articulo = articulos.find((a: Articulo) => a.id === articuloId)
    return articulo?.nombre || 'Artículo no encontrado'
  }

  const getInventarioNombre = (inventarioId?: string) => {
    if (!inventarioId) return 'N/A'
    const inv = inventarios.find((i: Inventario) => i.id === inventarioId)
    return inv?.nombre || 'Inventario no encontrado'
  }

  const esEdicion = (movimiento: Movimiento & { valoresAnteriores?: unknown; valoresNuevos?: unknown }) => {
    return !!(movimiento.valoresAnteriores || movimiento.valoresNuevos)
  }

  // Exportar a PDF
  const exportarPDF = () => {
    const doc = new jsPDF()
    
    // Título
    doc.setFontSize(18)
    doc.text(`Movimientos - ${inventario?.nombre || 'Inventario'}`, 14, 20)
    
    doc.setFontSize(10)
    doc.text(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 14, 30)
    
    // Estadísticas
    doc.setFontSize(12)
    doc.text('Estadísticas:', 14, 40)
    doc.setFontSize(10)
    doc.text(`Total Movimientos: ${estadisticas.totalMovimientos}`, 14, 48)
    doc.text(`Total Ediciones: ${estadisticas.totalEdiciones}`, 14, 54)
    doc.text(`Entradas: ${estadisticas.entradas}`, 14, 60)
    doc.text(`Salidas: ${estadisticas.salidas}`, 14, 66)
    doc.text(`Transferencias: ${estadisticas.transferencias}`, 14, 72)
    
    // Tabla
    const tableData = datosFiltrados.map((mov) => {
      const fecha = convertFirestoreDate(mov.fecha)
      const esEdic = esEdicion(mov as Movimiento & { valoresAnteriores?: unknown; valoresNuevos?: unknown })
      
      return [
        fecha ? format(fecha, 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A',
        esEdic ? 'Edición' : getMovimientoLabel(mov.tipo),
        getArticuloNombre(mov.idarticulo),
        mov.cantidad.toString(),
        getInventarioNombre(mov.idinventario_origen),
        getInventarioNombre(mov.idinventario_destino),
        mov.descripcion || 'Sin descripción'
      ]
    })

    autoTable(doc, {
      head: [['Fecha', 'Tipo', 'Artículo', 'Cantidad', 'Origen', 'Destino', 'Descripción']],
      body: tableData,
      startY: 80,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    })

    doc.save(`movimientos_${inventario?.nombre || 'inventario'}_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
  }

  // Generar números de página para paginación
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const maxVisible = 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!inventario) {
    return (
      <div className="p-4 md:p-6 lg:p-8 flex items-center justify-center py-20">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Inventario no encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p>El inventario solicitado no existe o no tienes permisos para verlo.</p>
            <Button asChild className="mt-4">
              <Link to="/almacen/inventarios">Volver a inventarios</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/almacen/inventarios/${inventarioId}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Historial de Movimientos
              </h1>
              <p className="text-muted-foreground">
                {inventario.nombre}
              </p>
            </div>
          </div>
        </div>
        <Button onClick={exportarPDF} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.total}</div>
            <p className="text-xs text-muted-foreground">Registros históricos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimientos</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{estadisticas.totalMovimientos}</div>
            <p className="text-xs text-muted-foreground">Entradas/Salidas/Transferencias</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ediciones</CardTitle>
            <Edit className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{estadisticas.totalEdiciones}</div>
            <p className="text-xs text-muted-foreground">Modificaciones de artículos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{estadisticas.entradas}</div>
            <p className="text-xs text-muted-foreground">Movimientos de entrada</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salidas</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{estadisticas.salidas}</div>
            <p className="text-xs text-muted-foreground">Movimientos de salida</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transferencias</CardTitle>
            <Repeat className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{estadisticas.transferencias}</div>
            <p className="text-xs text-muted-foreground">Movimientos entre inventarios</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>
                Filtra los movimientos por tipo
              </CardDescription>
            </div>
            <Filter className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Tipo de registro</label>
              <Select value={tipoFiltro} onValueChange={(value: 'todos' | 'movimientos' | 'ediciones') => setTipoFiltro(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="movimientos">Solo Movimientos</SelectItem>
                  <SelectItem value="ediciones">Solo Ediciones</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {tipoFiltro === 'movimientos' || tipoFiltro === 'todos' ? (
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Tipo de movimiento</label>
                <Select value={tipoMovimientoFiltro} onValueChange={(value: 'todos' | TipoMovimiento) => setTipoMovimientoFiltro(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value={TipoMovimiento.ENTRADA}>Entrada</SelectItem>
                    <SelectItem value={TipoMovimiento.SALIDA}>Salida</SelectItem>
                    <SelectItem value={TipoMovimiento.TRANSFERENCIA}>Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Tabla de movimientos */}
      <Card>
        <CardHeader>
          <CardTitle>Historial Detallado</CardTitle>
          <CardDescription>
            {datosFiltrados.length} registro(s) encontrado(s) - Página {currentPage} de {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {datosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay registros para mostrar con los filtros seleccionados</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Artículo</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Origen</TableHead>
                      <TableHead>Destino</TableHead>
                      <TableHead>Descripción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {datosPaginados.map((movimiento: Movimiento & { valoresAnteriores?: unknown; valoresNuevos?: unknown }) => {
                      const esEdic = esEdicion(movimiento)
                      return (
                        <TableRow key={movimiento.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{formatDate(movimiento.fecha)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {esEdic ? (
                              <Badge variant="outline" className="flex items-center gap-1 w-fit bg-purple-100 text-purple-800 border-purple-200">
                                <Edit className="h-4 w-4" />
                                Edición
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "flex items-center gap-1 w-fit",
                                  getMovimientoColor(movimiento.tipo)
                                )}
                              >
                                {getMovimientoIcon(movimiento.tipo)}
                                {getMovimientoLabel(movimiento.tipo)}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {getArticuloNombre(movimiento.idarticulo)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{movimiento.cantidad}</span>
                          </TableCell>
                          <TableCell>
                            {movimiento.idinventario_origen ? (
                              <span className="text-sm">
                                {getInventarioNombre(movimiento.idinventario_origen)}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {movimiento.idinventario_destino ? (
                              <span className="text-sm">
                                {getInventarioNombre(movimiento.idinventario_destino)}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {movimiento.descripcion || 'Sin descripción'}
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              
              {/* Paginación */}
              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault()
                            if (currentPage > 1) setCurrentPage(currentPage - 1)
                          }}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      
                      {getPageNumbers().map((page, index) => (
                        <PaginationItem key={index}>
                          {page === 'ellipsis' ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                setCurrentPage(page)
                              }}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault()
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                          }}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
