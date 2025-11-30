import {
  Plus,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Repeat,
  PackageCheck,
  History,
  Warehouse,
  Download,
  RefreshCw,
  BarChart3,
  Clock,
  DollarSign,
  MapPin,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAlmacenState } from '@/context/global/useAlmacenState'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { useEffect, useMemo, useState } from 'react'
import { TipoMovimiento } from '@/types/interfaces/almacen/movimiento'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'

function InventarioDashboard() {
  const navigate = useNavigate()
  const { 
    inventarios, 
    articulos, 
    movimientos, 
    subscribeToInventarios, 
    subscribeToArticulos, 
    subscribeToMovimientos 
  } = useAlmacenState()

  const [isLoading, setIsLoading] = useState(true)

  // Suscribirse a los datos en tiempo real
  useEffect(() => {
    setIsLoading(true)
    const unsubscribeInventarios = subscribeToInventarios()
    const unsubscribeArticulos = subscribeToArticulos()
    const unsubscribeMovimientos = subscribeToMovimientos()

    // Simular tiempo de carga
    const timer = setTimeout(() => setIsLoading(false), 1000)

    return () => {
      unsubscribeInventarios()
      unsubscribeArticulos()
      unsubscribeMovimientos()
      clearTimeout(timer)
    }
  }, [subscribeToInventarios, subscribeToArticulos, subscribeToMovimientos])

  // Función helper para convertir fechas de Firestore
  const convertFirestoreDate = (dateValue: unknown): Date | null => {
    if (!dateValue) return null
    
    try {
      // Firestore Timestamp
      if (dateValue && typeof dateValue === 'object' && 'toDate' in dateValue) {
        const timestamp = dateValue as { toDate: () => Date }
        return timestamp.toDate()
      }
      // Date object
      if (dateValue instanceof Date) {
        return dateValue
      }
      // String ISO
      if (typeof dateValue === 'string') {
        const date = new Date(dateValue)
        return isNaN(date.getTime()) ? null : date
      }
      return null
    } catch {
      return null
    }
  }

  // Calcular estadísticas en tiempo real
  const stats = useMemo(() => {
    const totalInventarios = inventarios.length
    const totalArticulos = articulos.length
    
    // Movimientos de hoy
    const hoy = new Date()
    const movimientosHoy = movimientos.filter(mov => {
      const fechaMov = convertFirestoreDate(mov.fecha)
      if (!fechaMov) return false
      return fechaMov.toDateString() === hoy.toDateString()
    }).length

    // Artículos con stock bajo
    const articulosBajoStock = articulos.filter(articulo => 
      articulo.cantidad_minima && articulo.cantidad <= articulo.cantidad_minima
    )

    // Valor total del inventario
    const valorTotal = articulos.reduce((sum, articulo) => 
      sum + (articulo.costo * articulo.cantidad), 0
    )

    // Artículos por tipo
    const equipos = articulos.filter(art => art.tipo === 'EQUIPO').length
    const materiales = articulos.filter(art => art.tipo === 'MATERIAL').length

    return {
      totalInventarios,
      totalArticulos,
      movimientosHoy,
      articulosBajoStock: articulosBajoStock.length,
      valorTotal,
      equipos,
      materiales
    }
  }, [inventarios, articulos, movimientos])

  // Estado para paginación de movimientos recientes
  const [currentPageMovimientos, setCurrentPageMovimientos] = useState(1)
  const ITEMS_PER_PAGE = 3
  const MAX_PAGES = 5

  // Obtener movimientos recientes (máximo 15 para 5 páginas)
  const todosMovimientosRecientes = useMemo(() => {
    return movimientos
      .sort((a, b) => {
        const fechaA = convertFirestoreDate(a.fecha) || new Date(0)
        const fechaB = convertFirestoreDate(b.fecha) || new Date(0)
        return fechaB.getTime() - fechaA.getTime()
      })
      .slice(0, MAX_PAGES * ITEMS_PER_PAGE) // Máximo 15 movimientos
      .map(mov => {
        const articulo = articulos.find(art => art.id === mov.idarticulo)
        const inventarioOrigen = inventarios.find(inv => inv.id === mov.idinventario_origen)
        const inventarioDestino = inventarios.find(inv => inv.id === mov.idinventario_destino)
        
        const fechaMov = convertFirestoreDate(mov.fecha)
        const fechaFormateada = fechaMov 
          ? formatDate(fechaMov, 'DD/MM/YYYY HH:mm')
          : 'Fecha no disponible'

        return {
          id: mov.id,
          tipo: mov.tipo,
          articulo: articulo?.nombre || 'Artículo no encontrado',
          cantidad: mov.cantidad,
          fecha: fechaFormateada,
          descripcion: mov.descripcion,
          inventarioOrigen: inventarioOrigen?.nombre,
          inventarioDestino: inventarioDestino?.nombre
        }
      })
  }, [movimientos, articulos, inventarios])

  // Calcular paginación
  const totalPagesMovimientos = Math.min(Math.ceil(todosMovimientosRecientes.length / ITEMS_PER_PAGE), MAX_PAGES)
  const startIndexMovimientos = (currentPageMovimientos - 1) * ITEMS_PER_PAGE
  const endIndexMovimientos = startIndexMovimientos + ITEMS_PER_PAGE
  const movimientosRecientes = todosMovimientosRecientes.slice(startIndexMovimientos, endIndexMovimientos)

  // Obtener artículos con stock bajo
  const articulosBajoStock = useMemo(() => {
    return articulos
      .filter(articulo => articulo.cantidad_minima && articulo.cantidad <= articulo.cantidad_minima)
      .slice(0, 6)
      .map(articulo => {
        const inventario = inventarios.find(inv => inv.id === articulo.idinventario)
        return {
          id: articulo.id,
          nombre: articulo.nombre,
          stockActual: articulo.cantidad,
          stockMinimo: articulo.cantidad_minima || 0,
          ubicacion: inventario?.nombre || 'Inventario no encontrado',
          costo: articulo.costo,
          tipo: articulo.tipo
        }
      })
  }, [articulos, inventarios])

  // Inventarios más activos
  const inventariosActivos = useMemo(() => {
    return inventarios
      .map(inv => {
        const articulosInv = articulos.filter(art => art.idinventario === inv.id)
        const movimientosInv = movimientos.filter(mov => 
          mov.idinventario_origen === inv.id || mov.idinventario_destino === inv.id
        )
        return {
          ...inv,
          totalArticulos: articulosInv.length,
          totalMovimientos: movimientosInv.length,
          valorTotal: articulosInv.reduce((sum, art) => sum + (art.costo * art.cantidad), 0)
        }
      })
      .sort((a, b) => b.totalMovimientos - a.totalMovimientos)
      .slice(0, 4)
  }, [inventarios, articulos, movimientos])

  // Función para navegar a inventario
  const navigateToInventario = (id: string) => {
    navigate(`/almacen/inventarios/${id}`)
  }

  // Función para obtener el color del badge según el tipo de movimiento
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

  // Función para obtener el ícono según el tipo de movimiento
  const getMovimientoIcon = (tipo: TipoMovimiento) => {
    switch (tipo) {
      case TipoMovimiento.ENTRADA:
        return <ArrowUpRight className="h-3 w-3" />
      case TipoMovimiento.SALIDA:
        return <ArrowDownRight className="h-3 w-3" />
      case TipoMovimiento.TRANSFERENCIA:
        return <Repeat className="h-3 w-3" />
      default:
        return <History className="h-3 w-3" />
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con acciones rápidas */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Inventario</h1>
          <p className="text-muted-foreground">
            Resumen completo y gestión de inventarios
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <Button onClick={() => navigate('/almacen/inventarios')}>
            <Plus className="mr-2 h-4 w-4" />
            Gestionar Inventarios
          </Button>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">
              Total Inventarios
            </CardTitle>
            <Warehouse className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.totalInventarios}</div>
            <p className="text-xs text-blue-700">
              Inventarios registrados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">
              Artículos en Stock
            </CardTitle>
            <PackageCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.totalArticulos}</div>
            <p className="text-xs text-green-700">
              {stats.equipos} equipos • {stats.materiales} materiales
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">
              Movimientos Hoy
            </CardTitle>
            <History className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats.movimientosHoy}</div>
            <p className="text-xs text-purple-700">
              Entradas, salidas y transferencias
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">
              Valor Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              ${stats.valorTotal.toLocaleString('es-DO')}
            </div>
            <p className="text-xs text-orange-700">
              Valor del inventario
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contenido principal */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Artículos con stock bajo */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Stock Bajo
              </CardTitle>
              <Badge variant="destructive">{stats.articulosBajoStock}</Badge>
            </div>
            <CardDescription>
              Artículos que necesitan reabastecimiento urgente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {articulosBajoStock.length > 0 ? (
                articulosBajoStock.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-3 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/almacen/inventarios`)}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm text-red-900">{item.nombre}</p>
                      <div className="flex items-center gap-2 text-xs text-red-700">
                        <MapPin className="h-3 w-3" />
                        {item.ubicacion}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="text-red-600 font-bold text-sm">
                          {item.stockActual}
                        </span>
                        <span className="text-red-500 text-xs">/</span>
                        <span className="text-red-700 text-xs">
                          {item.stockMinimo}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {item.tipo}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <PackageCheck className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <p className="font-medium">¡Excelente!</p>
                  <p className="text-sm">No hay artículos con stock bajo</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" onClick={() => navigate('/almacen/inventarios')}>
              Ver todos los artículos
            </Button>
          </CardFooter>
        </Card>

        {/* Movimientos recientes */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Actividad Reciente
              </CardTitle>
              <Badge variant="secondary">{movimientosRecientes.length}</Badge>
            </div>
            <CardDescription>
              Últimos movimientos del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {movimientosRecientes.length > 0 ? (
                <>
                  {movimientosRecientes.map((movement) => (
                    <div
                      key={movement.id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => navigate('/almacen/inventarios')}
                    >
                      <div className={`p-1 rounded-full ${getMovimientoColor(movement.tipo)}`}>
                        {getMovimientoIcon(movement.tipo)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{movement.articulo}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium">{movement.cantidad} unidades</span>
                          {movement.inventarioOrigen && movement.inventarioDestino && (
                            <span>• {movement.inventarioOrigen} → {movement.inventarioDestino}</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{movement.fecha}</p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Paginación */}
                  {totalPagesMovimientos > 1 && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentPageMovimientos(prev => Math.max(1, prev - 1))
                        }}
                        disabled={currentPageMovimientos === 1}
                        className="h-8"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        Página {currentPageMovimientos} de {totalPagesMovimientos}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setCurrentPageMovimientos(prev => Math.min(totalPagesMovimientos, prev + 1))
                        }}
                        disabled={currentPageMovimientos === totalPagesMovimientos}
                        className="h-8"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="font-medium">Sin actividad</p>
                  <p className="text-sm">No hay movimientos recientes</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" onClick={() => navigate('/almacen/inventarios')}>
              Ver todos los movimientos
            </Button>
          </CardFooter>
        </Card>

        {/* Inventarios más activos */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                Inventarios Activos
              </CardTitle>
              <Badge variant="outline">Top 4</Badge>
            </div>
            <CardDescription>
              Inventarios con mayor actividad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventariosActivos.length > 0 ? (
                inventariosActivos.map((inventario) => (
                  <div
                    key={inventario.id}
                    className="flex justify-between items-center p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigateToInventario(inventario.id)}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{inventario.nombre}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{inventario.totalArticulos} artículos</span>
                        <span>{inventario.totalMovimientos} movimientos</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        ${inventario.valorTotal.toLocaleString('es-DO')}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {inventario.principal ? 'Principal' : 'Secundario'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Warehouse className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="font-medium">Sin inventarios</p>
                  <p className="text-sm">Crea tu primer inventario</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" onClick={() => navigate('/almacen/inventarios')}>
              Ver todos los inventarios
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Acciones Rápidas
          </CardTitle>
          <CardDescription>
            Acceso directo a las funciones más utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/almacen/entradas/nuevo')}
            >
              <ArrowUpRight className="h-6 w-6 text-green-600" />
              <span className="text-sm">Nueva Entrada</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/almacen/salidas/nuevo')}
            >
              <ArrowDownRight className="h-6 w-6 text-red-600" />
              <span className="text-sm">Nueva Salida</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/almacen/transferencias/nuevo')}
            >
              <Repeat className="h-6 w-6 text-blue-600" />
              <span className="text-sm">Transferencia</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/almacen/inventarios')}
            >
              <Warehouse className="h-6 w-6 text-purple-600" />
              <span className="text-sm">Gestionar</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { InventarioDashboard }
export default InventarioDashboard
