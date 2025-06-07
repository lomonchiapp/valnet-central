import { useState } from 'react'
import { signOut } from 'firebase/auth'
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
  CheckSquare,
  MessageSquare,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useTareasStore } from '@/stores/tareasStore'
import { auth } from '@/lib/firebase'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const mockWallNetMessages = [
  {
    id: '1',
    userName: 'María García',
    content: 'Nueva actualización del sistema de facturación disponible',
    timestamp: '2024-12-16T10:30:00Z',
    isUnread: true,
  },
  {
    id: '2',
    userName: 'Carlos López',
    content: 'Recordatorio: Mantenimiento programado para mañana',
    timestamp: '2024-12-16T09:15:00Z',
    isUnread: true,
  },
  {
    id: '3',
    userName: 'Ana Martínez',
    content: 'Felicitaciones al equipo por cumplir las metas del mes',
    timestamp: '2024-12-15T16:45:00Z',
    isUnread: false,
  },
]

const mockNotifications = [
  {
    id: '1',
    type: 'task',
    title: 'Tarea vencida',
    message: 'La tarea "Revisar inventario" está vencida',
    timestamp: '2024-12-16T11:00:00Z',
    isRead: false,
  },
  {
    id: '2',
    type: 'payment',
    title: 'Pago próximo',
    message: 'Pago a proveedor vence en 2 días',
    timestamp: '2024-12-16T10:30:00Z',
    isRead: false,
  },
  {
    id: '3',
    type: 'general',
    title: 'Actualización del sistema',
    message: 'Nueva versión disponible',
    timestamp: '2024-12-16T09:00:00Z',
    isRead: true,
  },
]

export function UserMenu() {
  const navigate = useNavigate()
  const { user, clearUser } = useAuthStore()
  const { getTareasPorUsuario, getTareasVencidas } = useTareasStore()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  // Get user's tasks
  const userTasks = getTareasPorUsuario(user.id)
  const overdueTasks = getTareasVencidas()

  const getInitials = (name: string, lastName: string) => {
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      clearUser()
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión exitosamente',
      })
      navigate('/login')
      setIsOpen(false)
    } catch (error: unknown) {
      console.error('Error al cerrar sesión:', error)
      toast({
        title: 'Error',
        description: 'Hubo un error al cerrar sesión',
        variant: 'destructive',
      })
    }
  }

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente':
        return 'bg-red-100 text-red-800'
      case 'alta':
        return 'bg-orange-100 text-orange-800'
      case 'media':
        return 'bg-yellow-100 text-yellow-800'
      case 'baja':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'completada':
        return <CheckCircle className='h-4 w-4 text-green-500' />
      case 'en_progreso':
        return <Clock className='h-4 w-4 text-blue-500' />
      case 'pendiente':
        return <AlertCircle className='h-4 w-4 text-orange-500' />
      default:
        return <Clock className='h-4 w-4 text-gray-500' />
    }
  }

  const getPrioridadLabel = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente':
        return 'Urgente'
      case 'alta':
        return 'Alta'
      case 'media':
        return 'Media'
      case 'baja':
        return 'Baja'
      default:
        return prioridad
    }
  }

  const formatFecha = (fecha: Date) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const unreadCount =
    mockWallNetMessages.filter((m) => m.isUnread).length +
    mockNotifications.filter((n) => !n.isRead).length +
    overdueTasks.length

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant='ghost' className='relative h-10 rounded-full p-0'>
          <div className='flex items-center bg-white/10 hover:bg-white/20 rounded-full px-3 py-2 transition-colors'>
            <Avatar className='h-8 w-8'>
              <AvatarImage src={user.avatar} alt={user.nombres} />
              <AvatarFallback className='bg-[#F37021] text-white text-sm font-semibold'>
                {getInitials(user.nombres, user.apellidos)}
              </AvatarFallback>
            </Avatar>
            <div className='ml-2 text-left'>
              <p className='text-sm font-medium text-white'>{user.nombres}</p>
            </div>
            <ChevronDown className='h-4 w-4 text-white ml-2' />
            {unreadCount > 0 && (
              <Badge
                variant='destructive'
                className='absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs'
              >
                {unreadCount}
              </Badge>
            )}
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent side='right' className='w-[480px] sm:w-[540px]'>
        <SheetHeader className='space-y-4'>
          <div className='flex items-center space-x-4'>
            <Avatar className='h-16 w-16'>
              <AvatarImage src={user.avatar} alt={user.nombres} />
              <AvatarFallback className='bg-[#F37021] text-white text-lg font-bold'>
                {getInitials(user.nombres, user.apellidos)}
              </AvatarFallback>
            </Avatar>
            <div className='space-y-1'>
              <SheetTitle className='text-left'>
                {user.nombres} {user.apellidos}
              </SheetTitle>
              <p className='text-sm text-muted-foreground'>{user.email}</p>
              <Badge variant='outline' className='text-xs'>
                {user.rol || 'Usuario'}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <Separator className='my-6' />

        <Tabs defaultValue='notifications' className='w-full'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='notifications' className='text-xs'>
              <Bell className='h-4 w-4 mr-1' />
              Notificaciones
            </TabsTrigger>
            <TabsTrigger value='tasks' className='text-xs'>
              <CheckSquare className='h-4 w-4 mr-1' />
              Tareas ({userTasks.length})
            </TabsTrigger>
            <TabsTrigger value='wallnet' className='text-xs'>
              <MessageSquare className='h-4 w-4 mr-1' />
              WallNet
            </TabsTrigger>
          </TabsList>

          <ScrollArea className='h-[400px] mt-4'>
            <TabsContent value='notifications' className='space-y-3'>
              <div className='space-y-3'>
                {mockNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`transition-colors ${!notification.isRead ? 'border-blue-200 bg-blue-50/50' : ''}`}
                  >
                    <CardContent className='p-4'>
                      <div className='flex items-start justify-between'>
                        <div className='space-y-1 flex-1'>
                          <div className='flex items-center gap-2'>
                            <h4 className='text-sm font-medium'>
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className='h-2 w-2 bg-blue-500 rounded-full' />
                            )}
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            {notification.message}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant='outline' className='text-xs'>
                          {notification.type === 'task'
                            ? 'Tarea'
                            : notification.type === 'payment'
                              ? 'Pago'
                              : 'General'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value='tasks' className='space-y-3'>
              <div className='space-y-3'>
                {userTasks.length === 0 ? (
                  <Card>
                    <CardContent className='p-4 text-center'>
                      <p className='text-sm text-muted-foreground'>
                        No tienes tareas asignadas
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  userTasks.slice(0, 5).map((task) => (
                    <Card key={task.id}>
                      <CardContent className='p-4'>
                        <div className='space-y-2'>
                          <div className='flex items-center justify-between'>
                            <h4 className='text-sm font-medium'>{task.titulo}</h4>
                            {getStatusIcon(task.estado)}
                          </div>
                          <p className='text-xs text-muted-foreground line-clamp-2'>
                            {task.descripcion}
                          </p>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                              <Calendar className='h-3 w-3 text-muted-foreground' />
                              <span className='text-xs text-muted-foreground'>
                                {task.fechaVencimiento 
                                  ? formatFecha(task.fechaVencimiento)
                                  : 'Sin fecha'
                                }
                              </span>
                            </div>
                            <Badge className={getPrioridadColor(task.prioridad)}>
                              {getPrioridadLabel(task.prioridad)}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
                {userTasks.length > 5 && (
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full'
                    onClick={() => {
                      navigate('/tareas')
                      setIsOpen(false)
                    }}
                  >
                    Ver todas las tareas ({userTasks.length})
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value='wallnet' className='space-y-3'>
              <div className='space-y-3'>
                {mockWallNetMessages.map((message) => (
                  <Card
                    key={message.id}
                    className={`transition-colors ${message.isUnread ? 'border-green-200 bg-green-50/50' : ''}`}
                  >
                    <CardContent className='p-4'>
                      <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <h4 className='text-sm font-medium'>
                            {message.userName}
                          </h4>
                          {message.isUnread && (
                            <div className='h-2 w-2 bg-green-500 rounded-full' />
                          )}
                        </div>
                        <p className='text-sm text-muted-foreground'>
                          {message.content}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {new Date(message.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <Separator className='my-6' />

        <div className='space-y-2'>
          <Button
            variant='ghost'
            className='w-full justify-start'
            onClick={() => {
              navigate('/tareas')
              setIsOpen(false)
            }}
          >
            <CheckSquare className='mr-2 h-4 w-4' />
            Gestión de Tareas
          </Button>
          <Button
            variant='ghost'
            className='w-full justify-start'
            onClick={() => {
              navigate('/perfil')
              setIsOpen(false)
            }}
          >
            <User className='mr-2 h-4 w-4' />
            Mi Perfil
          </Button>
          <Button
            variant='ghost'
            className='w-full justify-start'
            onClick={() => {
              navigate('/configuracion')
              setIsOpen(false)
            }}
          >
            <Settings className='mr-2 h-4 w-4' />
            Configuración
          </Button>
          <Button
            variant='ghost'
            className='w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50'
            onClick={handleLogout}
          >
            <LogOut className='mr-2 h-4 w-4' />
            Cerrar Sesión
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
