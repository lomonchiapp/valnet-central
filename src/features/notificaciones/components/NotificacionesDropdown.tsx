import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'
import {
  Notificacion,
  EstadoNotificacion,
  TipoNotificacion,
  TipoAccionNotificacion,
  PrioridadNotificacion,
} from '@/types/interfaces/notificaciones/notificacion'
import { es } from 'date-fns/locale'
import { Bell, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  useObtenerNotificaciones,
  useMarcarNotificacionLeida,
  useArchivarNotificacion,
} from '../hooks'

export function NotificacionesDropdown() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const { obtenerNotificaciones } = useObtenerNotificaciones()
  const { marcarNotificacionLeida } = useMarcarNotificacionLeida()
  const { archivarNotificacion } = useArchivarNotificacion()

  const loadNotificaciones = useCallback(async () => {
    try {
      const notifs = await obtenerNotificaciones(EstadoNotificacion.PENDIENTE)
      // Filter notifications for current user
      const userNotifs = notifs.filter((notif) => {
        if (notif.idUsuarioDestino === user?.id) return true
        if (notif.idUsuariosAdicionales?.includes(user?.id || '')) return true
        if (user?.role && notif.roles?.includes(user.role)) return true
        return false
      })
      setNotificaciones(userNotifs)
    } catch (error) {
      console.error('Error al cargar notificaciones:', error)
    }
  }, [obtenerNotificaciones, user])

  useEffect(() => {
    if (user) {
      loadNotificaciones()
      // Refresh notifications every minute
      const interval = setInterval(loadNotificaciones, 60000)
      return () => clearInterval(interval)
    }
  }, [loadNotificaciones, user])

  const handleNotificacionClick = async (notificacion: Notificacion) => {
    try {
      // Mark as read
      if (user?.id) {
        await marcarNotificacionLeida(notificacion.id, user.id)
      }

      // Navigate based on action
      if (notificacion.accion) {
        switch (notificacion.accion.tipo) {
          case TipoAccionNotificacion.NAVEGACION:
            navigate(notificacion.accion.destino)
            break
          case TipoAccionNotificacion.MODAL:
            // For modal actions, you could trigger a modal or navigate to detail view
            navigate(`/notificaciones/${notificacion.id}`)
            break
          case TipoAccionNotificacion.ACCION_DIRECTA:
            // Handle direct actions if needed
            console.log('Acción directa:', notificacion.accion.destino)
            break
          case TipoAccionNotificacion.ENLACE_EXTERNO:
            window.open(notificacion.accion.destino, '_blank')
            break
        }
      } else {
        // Default navigation based on notification type
        switch (notificacion.tipo) {
          case TipoNotificacion.PAGO_RECURRENTE:
          case TipoNotificacion.PAGO_VENCIDO:
          case TipoNotificacion.PAGO_PROXIMO:
            navigate('/compras/pagos-recurrentes')
            break
          case TipoNotificacion.TAREA_ASIGNADA:
          case TipoNotificacion.TAREA_VENCIDA:
          case TipoNotificacion.TAREA_COMPLETADA:
            navigate('/tareas')
            break
          case TipoNotificacion.INVENTARIO_STOCK_BAJO:
          case TipoNotificacion.INVENTARIO_STOCK_CRITICO:
            navigate('/almacen/inventarios')
            break
          default:
            // General navigation
            break
        }
      }

      // Close dropdown
      setIsOpen(false)
    } catch (error) {
      console.error('Error al manejar notificación:', error)
    }
  }

  const handleArchivar = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await archivarNotificacion(id)
      setNotificaciones((prev) => prev.filter((n) => n.id !== id))
    } catch (error) {
      console.error('Error al archivar notificación:', error)
    }
  }

  const getNotificacionIcon = (tipo: TipoNotificacion) => {
    switch (tipo) {
      case TipoNotificacion.PAGO_RECURRENTE:
        return '💰'
      case TipoNotificacion.PAGO_VENCIDO:
        return '⚠️'
      case TipoNotificacion.PAGO_PROXIMO:
        return '🔔'
      case TipoNotificacion.TAREA_ASIGNADA:
        return '📋'
      case TipoNotificacion.TAREA_VENCIDA:
        return '⏰'
      case TipoNotificacion.TAREA_COMPLETADA:
        return '✅'
      case TipoNotificacion.WALLNET_MENSAJE:
        return '💬'
      case TipoNotificacion.WALLNET_MENCION:
        return '👤'
      case TipoNotificacion.INVENTARIO_STOCK_BAJO:
      case TipoNotificacion.INVENTARIO_STOCK_CRITICO:
        return '📦'
      case TipoNotificacion.BRIGADA_ASIGNACION:
        return '🚗'
      case TipoNotificacion.CLIENTE_NUEVO:
        return '👥'
      case TipoNotificacion.SISTEMA_ACTUALIZACION:
        return '🔄'
      case TipoNotificacion.VENTA_NUEVA:
        return '💵'
      default:
        return '📌'
    }
  }

  const getPrioridadColor = (prioridad: PrioridadNotificacion) => {
    switch (prioridad) {
      case PrioridadNotificacion.CRITICA:
        return 'bg-red-500 text-white'
      case PrioridadNotificacion.ALTA:
        return 'bg-red-100 text-red-800'
      case PrioridadNotificacion.MEDIA:
        return 'bg-yellow-100 text-yellow-800'
      case PrioridadNotificacion.BAJA:
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'PAGOS':
        return 'bg-blue-100 text-blue-800'
      case 'TAREAS':
        return 'bg-purple-100 text-purple-800'
      case 'WALLNET':
        return 'bg-green-100 text-green-800'
      case 'INVENTARIO':
        return 'bg-orange-100 text-orange-800'
      case 'SISTEMA':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const getTimeAgo = (fecha: string) => {
    const now = new Date()
    const notifDate = new Date(fecha)
    const diffInHours = Math.floor(
      (now.getTime() - notifDate.getTime()) / (1000 * 60 * 60)
    )

    if (diffInHours < 1) return 'Hace menos de 1 hora'
    if (diffInHours < 24)
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7)
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`

    return format(notifDate, 'dd MMM yyyy', { locale: es })
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='relative hover:bg-white/10'
        >
          <Bell className='h-5 w-5 text-white' />
          {notificaciones.length > 0 && (
            <Badge
              variant='destructive'
              className='absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 animate-pulse'
            >
              {notificaciones.length > 99 ? '99+' : notificaciones.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-96'>
        <div className='p-3 border-b'>
          <div className='flex items-center justify-between'>
            <h3 className='font-semibold'>Notificaciones</h3>
            <span className='text-sm text-muted-foreground'>
              {notificaciones.length} pendiente
              {notificaciones.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <ScrollArea className='max-h-[400px]'>
          {notificaciones.length === 0 ? (
            <div className='p-6 text-center'>
              <Bell className='mx-auto h-8 w-8 text-muted-foreground mb-2' />
              <p className='text-muted-foreground text-sm'>
                No hay notificaciones pendientes
              </p>
            </div>
          ) : (
            notificaciones.map((notificacion, index) => (
              <div key={notificacion.id}>
                <DropdownMenuItem
                  className='flex flex-col items-start p-4 cursor-pointer hover:bg-accent/50 focus:bg-accent/50'
                  onClick={() => handleNotificacionClick(notificacion)}
                >
                  <div className='flex items-start gap-3 w-full'>
                    <span className='text-xl mt-0.5 flex-shrink-0'>
                      {getNotificacionIcon(notificacion.tipo)}
                    </span>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1'>
                        <span className='font-medium text-sm truncate'>
                          {notificacion.titulo}
                        </span>
                        <Badge
                          variant='outline'
                          className={`${getPrioridadColor(notificacion.prioridad)} text-xs flex-shrink-0`}
                        >
                          {notificacion.prioridad}
                        </Badge>
                      </div>
                      <p className='text-xs text-muted-foreground mb-2 line-clamp-2'>
                        {notificacion.mensaje}
                      </p>
                      <div className='flex items-center justify-between w-full'>
                        <div className='flex items-center gap-2'>
                          <Badge
                            variant='secondary'
                            className={`${getCategoriaColor(notificacion.categoria)} text-xs`}
                          >
                            {notificacion.categoria}
                          </Badge>
                          <span className='text-xs text-muted-foreground'>
                            {getTimeAgo(notificacion.fechaNotificacion)}
                          </span>
                        </div>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground'
                          onClick={(e) => handleArchivar(notificacion.id, e)}
                        >
                          <X className='h-3 w-3' />
                        </Button>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
                {index < notificaciones.length - 1 && <DropdownMenuSeparator />}
              </div>
            ))
          )}
        </ScrollArea>
        {notificaciones.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className='p-2'>
              <Button
                variant='ghost'
                className='w-full text-sm'
                onClick={() => {
                  navigate('/notificaciones')
                  setIsOpen(false)
                }}
              >
                Ver todas las notificaciones
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
