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
import { ArticulosDataTable } from '@/features/almacen/inventarios/inventario/components/ArticulosDataTable'

interface InventarioTableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inventario: Inventario | null
}

export function InventarioTableDialog({
  open,
  onOpenChange,
  inventario,
}: InventarioTableDialogProps) {
  const { articulos, subscribeToArticulos } = useAlmacenState()

  useEffect(() => {
    if (open) {
      const unsubscribe = subscribeToArticulos()
      return () => unsubscribe()
    }
  }, [open, subscribeToArticulos])

  const articulosInventario = useMemo(() => {
    if (!inventario?.id) return []
    return articulos.filter((art: Articulo) => art.idinventario === inventario.id)
  }, [articulos, inventario])

  if (!inventario) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{inventario.nombre}</span>
            <Badge variant="secondary">{articulosInventario.length} artículos</Badge>
          </DialogTitle>
          <DialogDescription>
            {inventario.descripcion || 'Gestión de artículos del inventario'}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <ArticulosDataTable articulos={articulosInventario} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

