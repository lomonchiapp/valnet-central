import { TipoArticulo } from '@/types/interfaces/almacen/articulo'
import { TipoMovimiento } from '@/types/interfaces/almacen/movimiento'
import { Badge } from '@/components/ui/badge'

// Helper para obtener info de un artículo por ID
type Articulo = {
  id: string
  nombre: string
  tipo: TipoArticulo
  serial?: string
  mac?: string
  descripcion?: string
}

export function getArticuloInfo(articulos: Articulo[], articuloId: string) {
  const articulo = articulos.find((a) => a.id === articuloId)
  if (!articulo) return { nombre: 'Artículo desconocido' }
  if (articulo.tipo === TipoArticulo.EQUIPO) {
    let extra = articulo.serial ? `S/N: ${articulo.serial}` : 'Sin S/N'
    if (articulo.mac) extra += ` | MAC: ${articulo.mac}`
    return { nombre: articulo.nombre, extra }
  }
  return { nombre: articulo.nombre }
}

// Helper para formatear fechas
export function formatDate(
  dateValue: Date | string | { toDate?: () => Date } | null | undefined
) {
  if (!dateValue) return 'N/A'
  try {
    // Firestore Timestamp
    if (
      typeof dateValue === 'object' &&
      dateValue !== null &&
      'toDate' in dateValue &&
      typeof (dateValue as { toDate?: () => Date }).toDate === 'function'
    ) {
      return new Intl.DateTimeFormat('es-DO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format((dateValue as { toDate: () => Date }).toDate())
    }
    // String ISO
    if (typeof dateValue === 'string') {
      const d = new Date(dateValue)
      if (isNaN(d.getTime())) return 'N/A'
      return new Intl.DateTimeFormat('es-DO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d)
    }
    // Date
    if (dateValue instanceof Date) {
      return new Intl.DateTimeFormat('es-DO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(dateValue)
    }
    return 'N/A'
  } catch {
    return 'N/A'
  }
}

// Helper para obtener el badge de tipo de movimiento
export function getMovimientoBadge(tipo: TipoMovimiento) {
  switch (tipo) {
    case TipoMovimiento.ENTRADA:
      return (
        <Badge className='bg-green-100 text-green-800 border-green-300'>
          Entrada
        </Badge>
      )
    case TipoMovimiento.SALIDA:
      return (
        <Badge className='bg-red-100 text-red-800 border-red-300'>Salida</Badge>
      )
    case TipoMovimiento.TRANSFERENCIA:
      return (
        <Badge className='bg-blue-100 text-blue-800 border-blue-300'>
          Transferencia
        </Badge>
      )
    default:
      return <Badge>Desconocido</Badge>
  }
}
