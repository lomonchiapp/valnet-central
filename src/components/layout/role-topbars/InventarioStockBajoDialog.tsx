import { useEffect, useMemo } from 'react'
import { Inventario } from '@/types/interfaces/almacen/inventario'
import { Articulo } from '@/types/interfaces/almacen/articulo'
import { useAlmacenState } from '@/context/global/useAlmacenState'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'

interface InventarioStockBajoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inventario: Inventario | null
}

export function InventarioStockBajoDialog({
  open,
  onOpenChange,
  inventario,
}: InventarioStockBajoDialogProps) {
  const { articulos, subscribeToArticulos } = useAlmacenState()

  useEffect(() => {
    if (open) {
      const unsubscribe = subscribeToArticulos()
      return () => unsubscribe()
    }
  }, [open, subscribeToArticulos])

  const articulosBajoStock = useMemo(() => {
    if (!inventario?.id) return []
    return articulos
      .filter((art: Articulo) => 
        art.idinventario === inventario.id &&
        art.cantidad_minima !== undefined &&
        art.cantidad <= art.cantidad_minima
      )
      .sort((a, b) => {
        const porcentajeA = a.cantidad_minima ? (a.cantidad / a.cantidad_minima) * 100 : 100
        const porcentajeB = b.cantidad_minima ? (b.cantidad / b.cantidad_minima) * 100 : 100
        return porcentajeA - porcentajeB
      })
  }, [articulos, inventario])

  if (!inventario) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>Stock Bajo - {inventario.nombre}</span>
            <Badge variant="destructive">{articulosBajoStock.length} artículos</Badge>
          </DialogTitle>
          <DialogDescription>
            Artículos que necesitan reabastecimiento urgente
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {articulosBajoStock.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-green-500 opacity-50" />
              <p className="text-lg font-medium">¡Excelente!</p>
              <p className="text-sm">No hay artículos con stock bajo en este inventario</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artículo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-center">Stock Actual</TableHead>
                    <TableHead className="text-center">Stock Mínimo</TableHead>
                    <TableHead className="text-center">Diferencia</TableHead>
                    <TableHead className="text-center">Unidad</TableHead>
                    <TableHead className="text-right">Costo Unitario</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articulosBajoStock.map((articulo: Articulo) => {
                    const diferencia = (articulo.cantidad_minima || 0) - articulo.cantidad
                    const porcentaje = articulo.cantidad_minima 
                      ? ((articulo.cantidad / articulo.cantidad_minima) * 100).toFixed(1)
                      : '0'
                    
                    return (
                      <TableRow key={articulo.id}>
                        <TableCell>
                          <div>
                            <Link
                              to={`/almacen/inventarios/${inventario.id}/articulo/${articulo.id}`}
                              className="font-medium hover:text-primary hover:underline"
                              onClick={() => onOpenChange(false)}
                            >
                              {articulo.nombre || 'Sin nombre'}
                            </Link>
                            {articulo.descripcion && (
                              <div className="text-xs text-muted-foreground">{articulo.descripcion}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={articulo.tipo === 'EQUIPO' ? 'default' : 'secondary'}>
                            {articulo.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-bold text-red-600">{articulo.cantidad}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">{articulo.cantidad_minima}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="destructive">
                            -{diferencia} ({porcentaje}%)
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground">
                          {articulo.unidad}
                        </TableCell>
                        <TableCell className="text-right">
                          {new Intl.NumberFormat('es-MX', {
                            style: 'currency',
                            currency: 'MXN',
                          }).format(articulo.costo)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

