import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Repeat,
  Package,
  Edit,
  FileText,
  User,
  Calendar,
  TrendingUp,
  TrendingDown,
  MapPin,
  Building,
  Plus,
  MessageSquare,
} from 'lucide-react'
import { useAlmacenState } from '@/context/global/useAlmacenState'
import { Movimiento, TipoMovimiento } from '@/types/interfaces/almacen/movimiento'
import { Articulo, TipoArticulo } from '@/types/interfaces/almacen/articulo'
import { Inventario } from 'shared-types'
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
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { database } from '@/firebase'
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore'
import { getAuthState } from '@/stores/authStore'
import { NotaArticulo } from '@/types/interfaces/almacen/notaArticulo'
import { useInstalacionesStore } from '@/stores/instalacionesStore'

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

export default function ArticuloPage() {
  const { id: articuloId } = useParams<{ id: string }>()
  const {
    inventarios,
    movimientos,
    articulos,
    subscribeToInventarios,
    subscribeToMovimientos,
    subscribeToArticulos,
  } = useAlmacenState()
  const instalaciones = useInstalacionesStore((s) => s.instalaciones)
  const [isLoading, setIsLoading] = useState(true)
  const [notas, setNotas] = useState<NotaArticulo[]>([])
  const [isNotaDialogOpen, setIsNotaDialogOpen] = useState(false)
  const [nuevaNota, setNuevaNota] = useState({ contenido: '', tipo: 'general' as NotaArticulo['tipo'] })

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

  // Cargar notas del artículo
  useEffect(() => {
    if (!articuloId) return

    const cargarNotas = async () => {
      try {
        const notasRef = collection(database, 'notasArticulos')
        const q = query(
          notasRef,
          where('idarticulo', '==', articuloId),
          orderBy('fecha', 'desc')
        )
        const snapshot = await getDocs(q)
        const notasData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fecha: convertFirestoreDate(doc.data().fecha) || new Date()
        })) as NotaArticulo[]
        setNotas(notasData)
      } catch (error) {
        console.error('Error al cargar notas:', error)
      }
    }

    cargarNotas()
  }, [articuloId])

  const articulo = useMemo(() => {
    return articulos.find((a: Articulo) => a.id === articuloId)
  }, [articulos, articuloId])

  const inventario = useMemo(() => {
    if (!articulo?.idinventario) return null
    return inventarios.find((inv: Inventario) => inv.id === articulo.idinventario)
  }, [inventarios, articulo])

  // Filtrar movimientos de este artículo
  const movimientosArticulo = useMemo(() => {
    if (!articuloId) return []
    
    return movimientos
      .filter((mov: Movimiento) => mov.idarticulo === articuloId)
      .sort((a, b) => {
        const fechaA = convertFirestoreDate(a.fecha) || new Date(0)
        const fechaB = convertFirestoreDate(b.fecha) || new Date(0)
        return fechaB.getTime() - fechaA.getTime()
      })
  }, [movimientos, articuloId])

  // Separar movimientos de ediciones
  const { movimientosReales, ediciones } = useMemo(() => {
    const ediciones = movimientosArticulo.filter((mov: Movimiento & { valoresAnteriores?: unknown; valoresNuevos?: unknown }) => 
      mov.valoresAnteriores || mov.valoresNuevos
    )
    
    const movimientosReales = movimientosArticulo.filter((mov: Movimiento & { valoresAnteriores?: unknown; valoresNuevos?: unknown }) => 
      !mov.valoresAnteriores && !mov.valoresNuevos
    )

    return { movimientosReales, ediciones }
  }, [movimientosArticulo])

  // Estadísticas
  const estadisticas = useMemo(() => {
    const entradas = movimientosReales.filter(
      (m: Movimiento) => m.tipo === TipoMovimiento.ENTRADA
    )
    const salidas = movimientosReales.filter(
      (m: Movimiento) => m.tipo === TipoMovimiento.SALIDA
    )
    const transferencias = movimientosReales.filter(
      (m: Movimiento) => m.tipo === TipoMovimiento.TRANSFERENCIA
    )

    const cantidadEntradas = entradas.reduce((sum, e) => sum + e.cantidad, 0)
    const cantidadSalidas = salidas.reduce((sum, s) => sum + s.cantidad, 0)
    const cantidadTransferencias = transferencias.length

    return {
      totalEntradas: entradas.length,
      totalSalidas: salidas.length,
      totalTransferencias: transferencias.length,
      cantidadEntradas,
      cantidadSalidas,
      cantidadTransferencias,
      totalMovimientos: movimientosReales.length,
      totalEdiciones: ediciones.length,
    }
  }, [movimientosReales, ediciones])

  // Para equipos: buscar instalación por serial
  const instalacionEquipo = useMemo(() => {
    if (!articulo || articulo.tipo !== TipoArticulo.EQUIPO || !articulo.serial) return null
    
    // Buscar instalación que tenga este serial (asumiendo que el serial se almacena en algún campo)
    // Esto es un ejemplo - necesitarías adaptarlo según tu estructura de datos
    return instalaciones.find(inst => 
      inst.serial === articulo.serial || 
      inst.N_orden === articulo.serial
    ) || null
  }, [articulo, instalaciones])

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

  const formatDate = (date: Date | string | unknown) => {
    const dateObj = convertFirestoreDate(date) || (date instanceof Date ? date : new Date(String(date)))
    if (!dateObj || isNaN(dateObj.getTime())) return 'Fecha inválida'
    
    return format(dateObj, 'dd MMM yyyy HH:mm', { locale: es })
  }

  const getInventarioNombre = (inventarioId?: string) => {
    if (!inventarioId) return 'N/A'
    const inv = inventarios.find((i: Inventario) => i.id === inventarioId)
    return inv?.nombre || 'Inventario no encontrado'
  }

  const agregarNota = async () => {
    if (!articuloId || !nuevaNota.contenido.trim()) {
      toast.error('El contenido de la nota es requerido')
      return
    }

    try {
      const { user } = getAuthState()
      const userId = user?.id || 'unknown'

      await addDoc(collection(database, 'notasArticulos'), {
        idarticulo: articuloId,
        idusuario: userId,
        contenido: nuevaNota.contenido.trim(),
        tipo: nuevaNota.tipo,
        fecha: new Date(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      toast.success('Nota agregada exitosamente')
      setNuevaNota({ contenido: '', tipo: 'general' })
      setIsNotaDialogOpen(false)

      // Recargar notas
      const notasRef = collection(database, 'notasArticulos')
      const q = query(
        notasRef,
        where('idarticulo', '==', articuloId),
        orderBy('fecha', 'desc')
      )
      const snapshot = await getDocs(q)
      const notasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fecha: convertFirestoreDate(doc.data().fecha) || new Date()
      })) as NotaArticulo[]
      setNotas(notasData)
    } catch (error) {
      console.error('Error al agregar nota:', error)
      toast.error('Error al agregar la nota')
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!articulo) {
    return (
      <div className="p-4 md:p-6 lg:p-8 flex items-center justify-center py-20">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Artículo no encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p>El artículo solicitado no existe o no tienes permisos para verlo.</p>
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
              <Link to={`/almacen/inventarios/${articulo.idinventario}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                {articulo.nombre || 'Sin nombre'}
                <Badge variant={articulo.tipo === TipoArticulo.EQUIPO ? 'default' : 'secondary'}>
                  {articulo.tipo}
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                {inventario?.nombre || 'Inventario no encontrado'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Información del artículo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Descripción:</span>
              <p className="text-sm">{articulo.descripcion || 'Sin descripción'}</p>
            </div>
            {articulo.marca && (
              <div>
                <span className="text-sm text-muted-foreground">Marca:</span>
                <p className="text-sm">{articulo.marca}</p>
              </div>
            )}
            {articulo.modelo && (
              <div>
                <span className="text-sm text-muted-foreground">Modelo:</span>
                <p className="text-sm">{articulo.modelo}</p>
              </div>
            )}
            {articulo.serial && (
              <div>
                <span className="text-sm text-muted-foreground">Serial:</span>
                <p className="text-sm font-mono">{articulo.serial}</p>
              </div>
            )}
            <div>
              <span className="text-sm text-muted-foreground">Ubicación:</span>
              <p className="text-sm">{articulo.ubicacion || 'Sin ubicación'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas de movimientos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Estadísticas de Movimientos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm">Entradas</span>
              </div>
              <div className="text-right">
                <div className="font-bold">{estadisticas.totalEntradas}</div>
                <div className="text-xs text-muted-foreground">{estadisticas.cantidadEntradas} unidades</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-sm">Salidas</span>
              </div>
              <div className="text-right">
                <div className="font-bold">{estadisticas.totalSalidas}</div>
                <div className="text-xs text-muted-foreground">{estadisticas.cantidadSalidas} unidades</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Transferencias</span>
              </div>
              <div className="text-right">
                <div className="font-bold">{estadisticas.totalTransferencias}</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm font-medium">Total Movimientos</span>
              <div className="font-bold">{estadisticas.totalMovimientos}</div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Ediciones</span>
              <div className="font-bold">{estadisticas.totalEdiciones}</div>
            </div>
          </CardContent>
        </Card>

        {/* Para equipos: información de instalación */}
        {articulo.tipo === TipoArticulo.EQUIPO && instalacionEquipo && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Instalación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Cliente:</span>
                <p className="text-sm font-medium">{instalacionEquipo.cliente}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Dirección:</span>
                <p className="text-sm">{instalacionEquipo.direccion}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Teléfono:</span>
                <p className="text-sm">{instalacionEquipo.telefono || instalacionEquipo.movil}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Estado:</span>
                <Badge variant={instalacionEquipo.estate === 'INSTALADO' ? 'default' : 'secondary'}>
                  {instalacionEquipo.estate}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cantidad actual */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Stock Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{articulo.cantidad}</div>
            <p className="text-sm text-muted-foreground">{articulo.unidad}</p>
            {articulo.cantidad_minima && (
              <div className="mt-2">
                <span className="text-xs text-muted-foreground">Mínimo: {articulo.cantidad_minima}</span>
                {articulo.cantidad <= articulo.cantidad_minima && (
                  <Badge variant="destructive" className="ml-2">Bajo Stock</Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notas del artículo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Notas</CardTitle>
              <CardDescription>
                Notas y comentarios sobre este artículo
              </CardDescription>
            </div>
            <Dialog open={isNotaDialogOpen} onOpenChange={setIsNotaDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Nota
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Nota</DialogTitle>
                  <DialogDescription>
                    Agrega una nota o comentario sobre este artículo
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Tipo de nota</Label>
                    <Select
                      value={nuevaNota.tipo}
                      onValueChange={(value: NotaArticulo['tipo']) => 
                        setNuevaNota({ ...nuevaNota, tipo: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                        <SelectItem value="instalacion">Instalación</SelectItem>
                        <SelectItem value="reparacion">Reparación</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Contenido</Label>
                    <Textarea
                      value={nuevaNota.contenido}
                      onChange={(e) => setNuevaNota({ ...nuevaNota, contenido: e.target.value })}
                      placeholder="Escribe tu nota aquí..."
                      rows={5}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNotaDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={agregarNota}>Agregar Nota</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {notas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay notas para este artículo</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notas.map((nota) => (
                <div key={nota.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{nota.tipo}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(nota.fecha)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{nota.contenido}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historial de movimientos recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Movimientos Recientes</CardTitle>
          <CardDescription>
            Últimos 10 movimientos de este artículo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {movimientosArticulo.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay movimientos registrados</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Origen</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Descripción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimientosArticulo.slice(0, 10).map((movimiento: Movimiento & { valoresAnteriores?: unknown; valoresNuevos?: unknown }) => {
                    const esEdic = !!(movimiento.valoresAnteriores || movimiento.valoresNuevos)
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
                            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                              <Edit className="h-3 w-3 mr-1" />
                              Edición
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className={getMovimientoColor(movimiento.tipo)}
                            >
                              {getMovimientoIcon(movimiento.tipo)}
                              {movimiento.tipo}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{movimiento.cantidad}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {getInventarioNombre(movimiento.idinventario_origen)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {getInventarioNombre(movimiento.idinventario_destino)}
                          </span>
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}

