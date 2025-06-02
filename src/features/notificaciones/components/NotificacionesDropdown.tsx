import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'
import {
  Notificacion,
  EstadoNotificacion,
  TipoNotificacion,
} from '@/types/interfaces/notificaciones/notificacion'
import { es } from 'date-fns/locale'
import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  useObtenerNotificaciones,
  useMarcarNotificacionLeida,
  useArchivarNotificacion,
} from '../hooks'

export function NotificacionesDropdown() {
  const navigate = useNavigate()
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const { obtenerNotificaciones } = useObtenerNotificaciones()
  const { marcarNotificacionLeida } = useMarcarNotificacionLeida()
  const { archivarNotificacion } = useArchivarNotificacion()

  const loadNotificaciones = useCallback(async () => {
    try {
      const notifs = await obtenerNotificaciones(EstadoNotificacion.PENDIENTE)
      setNotificaciones(notifs)
    } catch (error) {
      console.error('Error al cargar notificaciones:', error)
    }
  }, [obtenerNotificaciones])

  useEffect(() => {
    loadNotificaciones()
    // Refresh notifications every minute
    const interval = setInterval(loadNotificaciones, 60000)
    return () => clearInterval(interval)
  }, [loadNotificaciones])

  const handleNotificacionClick = async (notificacion: Notificacion) => {
    try {
      // Mark as read
      await marcarNotificacionLeida(notificacion.id, 'current-user-id') // TODO: Get actual user ID

      // Navigate based on action
      if (notificacion.accion) {
        switch (notificacion.accion.tipo) {
          case 'IR_A_PAGO':
            navigate(`/compras/pagos-recurrentes/${notificacion.accion.id}`)
            break
          case 'IR_A_CUENTA':
            navigate(`/contabilidad/cuentas/${notificacion.accion.id}`)
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
      default:
        return '📌'
    }
  }

  const getPrioridadColor = (prioridad: Notificacion['prioridad']) => {
    switch (prioridad) {
      case 'ALTA':
        return 'bg-red-100 text-red-800'
      case 'MEDIA':
        return 'bg-yellow-100 text-yellow-800'
      case 'BAJA':
        return 'bg-green-100 text-green-800'
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='relative'
          style={{ borderColor: '#F37021', borderWidth: '1px' }}
        >
          <Bell className='h-5 w-5 text-white' />
          {notificaciones.length > 0 && (
            <Badge
              variant='destructive'
              className='absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0'
            >
              {notificaciones.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-80'>
        <ScrollArea className='h-[400px]'>
          {notificaciones.length === 0 ? (
            <div className='p-4 text-center text-muted-foreground'>
              No hay notificaciones pendientes
            </div>
          ) : (
            notificaciones.map((notificacion) => (
              <DropdownMenuItem
                key={notificacion.id}
                className='flex flex-col items-start p-4 cursor-pointer hover:bg-accent'
                onClick={() => handleNotificacionClick(notificacion)}
              >
                <div className='flex items-center gap-2 w-full'>
                  <span className='text-lg'>
                    {getNotificacionIcon(notificacion.tipo)}
                  </span>
                  <span className='font-medium flex-1'>
                    {notificacion.titulo}
                  </span>
                  <Badge
                    variant='outline'
                    className={getPrioridadColor(notificacion.prioridad)}
                  >
                    {notificacion.prioridad}
                  </Badge>
                </div>
                <p className='text-sm text-muted-foreground mt-1'>
                  {notificacion.mensaje}
                </p>
                <div className='flex items-center justify-between w-full mt-2'>
                  <span className='text-xs text-muted-foreground'>
                    {format(new Date(notificacion.fechaNotificacion), 'PPP', {
                      locale: es,
                    })}
                  </span>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 px-2 text-xs'
                    onClick={(e) => handleArchivar(notificacion.id, e)}
                  >
                    Archivar
                  </Button>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
