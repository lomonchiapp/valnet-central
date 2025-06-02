import { useEffect, useState, useMemo } from 'react'
import { PlusCircle } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useAlmacenState } from '@/context/global/useAlmacenState'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  getArticuloInfo,
  formatDate,
  getMovimientoBadge,
} from '@/features/almacen/inventarios/helpers/inventarioHelpers'
import { ArticulosTable } from './components/ArticulosTable'
import { NuevoArticuloForm } from './components/NuevoArticuloForm'

// Helper para parsear fechas de distintos formatos
function parseFecha(fecha: unknown): Date {
  if (fecha instanceof Date) return fecha
  if (
    typeof fecha === 'object' &&
    fecha &&
    (fecha as { toDate?: () => Date }).toDate
  )
    return (fecha as { toDate: () => Date }).toDate()
  if (typeof fecha === 'string') {
    // Si es ISO, Date lo entiende
    if (!isNaN(Date.parse(fecha))) return new Date(fecha)
    // Si es formato DD/MM/YYYY, HH:mm a. m./p. m.
    const match = fecha.match(
      /(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}) (a|p)\. m\./
    )
    if (match) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [__, d, m, y, h, min, ap] = match
      let hour = parseInt(h, 10)
      if (ap === 'p' && hour < 12) hour += 12
      if (ap === 'a' && hour === 12) hour = 0
      return new Date(
        `${y}-${m}-${d}T${hour.toString().padStart(2, '0')}:${min}:00`
      )
    }
  }
  return new Date(0) // fallback
}

export default function Inventario() {
  const { id } = useParams()
  const {
    inventarios,
    articulos,
    movimientos,
    subscribeToArticulos,
    subscribeToMovimientos,
  } = useAlmacenState()
  const [showNuevoArticulo, setShowNuevoArticulo] = useState(false)

  // Suscribirse a artículos y movimientos
  useEffect(() => {
    const unsubArticulos = subscribeToArticulos()
    const unsubMovimientos = subscribeToMovimientos()
    return () => {
      unsubArticulos()
      unsubMovimientos()
    }
  }, [subscribeToArticulos, subscribeToMovimientos])

  const inventario = inventarios.find((inventario) => inventario.id === id)
  const articulosInventario = articulos.filter(
    (articulo) => articulo.idinventario === id
  )

  // Filtrar movimientos relevantes para este inventario
  const movimientosInventario = useMemo(() => {
    return movimientos
      .filter(
        (m) => m.idinventario_origen === id || m.idinventario_destino === id
      )
      .sort(
        (a, b) => parseFecha(b.fecha).getTime() - parseFecha(a.fecha).getTime()
      )
  }, [movimientos, id])

  if (!inventario) {
    return (
      <div className='flex items-center justify-center h-full'>
        <Card className='w-[350px]'>
          <CardHeader>
            <CardTitle>Inventario no encontrado</CardTitle>
            <CardDescription>
              El inventario solicitado no existe o ha sido eliminado.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className='min-h-full bg-muted'>
      <div className='container mx-auto py-6 space-y-6'>
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              {inventario.nombre}
            </h1>
            <p className='text-muted-foreground'>{inventario.descripcion}</p>
          </div>
          <Button onClick={() => setShowNuevoArticulo(true)}>
            <PlusCircle className='mr-2 h-4 w-4' />
            Agregar Artículo
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalles del Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-sm font-medium'>Tipo</p>
                <p className='text-sm text-muted-foreground'>
                  {inventario.tipo}
                </p>
              </div>
              <div>
                <p className='text-sm font-medium'>ID</p>
                <p className='text-sm text-muted-foreground'>{inventario.id}</p>
              </div>
              <div>
                <p className='text-sm font-medium'>Fecha de creación</p>
                <p className='text-sm text-muted-foreground'>
                  {inventario.createdAt instanceof Date
                    ? inventario.createdAt.toLocaleDateString()
                    : new Date(inventario.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className='text-sm font-medium'>Última actualización</p>
                <p className='text-sm text-muted-foreground'>
                  {inventario.updatedAt instanceof Date
                    ? inventario.updatedAt.toLocaleDateString()
                    : new Date(inventario.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue='articulos' className='w-full'>
          <TabsList className='bg-white'>
            <TabsTrigger value='articulos'>
              Artículos ({articulosInventario.length})
            </TabsTrigger>
            <TabsTrigger value='movimientos'>Movimientos</TabsTrigger>
          </TabsList>
          <TabsContent value='articulos' className='space-y-4 pt-4'>
            <ArticulosTable articulos={articulosInventario} />
          </TabsContent>
          <TabsContent value='movimientos'>
            <Card>
              <CardHeader>
                <CardTitle>Historial de Movimientos</CardTitle>
                <CardDescription>
                  Visualiza todas las entradas, salidas y transferencias de
                  artículos de este inventario.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {movimientosInventario.length === 0 ? (
                  <div className='flex flex-col items-center py-8 text-muted-foreground'>
                    <img
                      src='https://cdn-icons-png.flaticon.com/512/4072/4072155.png'
                      alt='Sin movimientos'
                      className='h-24 w-24 mb-4 opacity-60'
                    />
                    <p>No hay movimientos registrados para este inventario.</p>
                  </div>
                ) : (
                  <ScrollArea className='h-[500px]'>
                    <Table className='border rounded-lg overflow-hidden shadow-sm bg-white'>
                      <TableHeader className='bg-gray-50'>
                        <TableRow>
                          <TableHead className='font-semibold text-gray-700'>
                            Fecha
                          </TableHead>
                          <TableHead className='font-semibold text-gray-700'>
                            Tipo
                          </TableHead>
                          <TableHead className='font-semibold text-gray-700'>
                            Artículo
                          </TableHead>
                          <TableHead className='font-semibold text-gray-700'>
                            Cantidad
                          </TableHead>
                          <TableHead className='font-semibold text-gray-700'>
                            Descripción
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {movimientosInventario.map((movimiento) => {
                          const info = getArticuloInfo(
                            articulos,
                            movimiento.idarticulo
                          )
                          return (
                            <TableRow
                              key={movimiento.id}
                              className='hover:bg-gray-50 transition-colors group'
                            >
                              <TableCell className='whitespace-nowrap'>
                                {formatDate(movimiento.fecha)}
                              </TableCell>
                              <TableCell>
                                {getMovimientoBadge(movimiento.tipo)}
                              </TableCell>
                              <TableCell className='font-medium'>
                                {info.nombre}
                                {info.extra && (
                                  <span className='block text-xs text-muted-foreground mt-1'>
                                    {info.extra}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className='text-center'>
                                {movimiento.cantidad}
                              </TableCell>
                              <TableCell className='max-w-xs truncate group-hover:whitespace-normal group-hover:max-w-2xl transition-all'>
                                {movimiento.descripcion}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <NuevoArticuloForm
          open={showNuevoArticulo}
          onOpenChange={setShowNuevoArticulo}
          inventarioId={id || ''}
        />
      </div>
    </div>
  )
}
