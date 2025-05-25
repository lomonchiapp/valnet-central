import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  IconEdit, 
  IconKey, 
  IconUserOff, 
  IconUserCheck 
} from '@tabler/icons-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { StatusUsuario, Usuario } from '@/types'
import { useUsuarios } from '../context/usuarios-context'

interface UsuarioItemProps {
  user: Usuario
}

export function UsuarioItem({ user }: UsuarioItemProps) {
  const { setCurrentUser, setOpen } = useUsuarios()

  const handleEdit = () => {
    // Mapear Usuario a User
    setCurrentUser({
      id: user.id,
      firstName: user.nombres,
      lastName: user.apellidos,
      username: user.email, // o algún campo adecuado
      email: user.email,
      phoneNumber: user.telefono,
      status: mapStatusToString(user.status),
      role: mapRoleToString(user.role),
      sucursal: '',
      departamento: '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
    setOpen('editar')
  }

  // Helpers para mapear enums a string
  function mapStatusToString(status: string) {
    switch (status) {
      case 'Online': return 'activo'
      case 'Offline': return 'inactivo'
      case 'En Pausa': return 'invitado'
      case 'Ocupado': return 'suspendido'
      default: return 'inactivo'
    }
  }

  function mapRoleToString(role: string) {
    switch (role) {
      case 'Admin': return 'admin'
      case 'Inventario': return 'inventario'
      case 'Vendedor': return 'vendedor'
      case 'Servicio al Cliente': return 'soporte'
      case 'Gerente': return 'gerente'
      case 'Cajero': return 'cajero'
      case 'Superadmin': return 'superadmin'
      default: return 'vendedor'
    }
  }

  // Obtiene iniciales para el avatar
  const getInitials = () => {
    return `${user.nombres.charAt(0)}${user.apellidos.charAt(0)}`.toUpperCase()
  }

  // Determina el color del badge según el estado
  const getBadgeVariant = () => {
    switch (user.status) {
      case StatusUsuario.ONLINE: return 'default'
      case StatusUsuario.OFFLINE: return 'secondary'
      case StatusUsuario.ON_BREAK: return 'outline'
      case StatusUsuario.BUSY: return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{user.nombres} {user.apellidos}</h3>
              <Badge variant={getBadgeVariant()} className="capitalize">
                {user.status}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{user.email}</p>
              <p>{user.telefono}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="capitalize">{user.role}</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 px-6 py-3 flex justify-between">
        <TooltipProvider>
          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => {}}>
                  <IconKey size={18} className="text-amber-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Resetear contraseña</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => {}}>
                  {user.status === StatusUsuario.ONLINE ? 
                    <IconUserOff size={18} className="text-zinc-500" /> : 
                    <IconUserCheck size={18} className="text-emerald-500" />
                  }
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {user.status === StatusUsuario.ONLINE ? 'Desactivar usuario' : 'Activar usuario'}
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={handleEdit}>
            <IconEdit size={16} className="mr-1" /> Editar
          </Button>
          {/* <Button variant="ghost" size="sm" className="text-destructive" onClick={handleDelete}>
            <IconTrash size={16} className="mr-1" /> Eliminar
          </Button> */}
        </div>
      </CardFooter>
    </Card>
  )
} 