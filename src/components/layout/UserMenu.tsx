import { User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { useToast } from '@/hooks/use-toast'

export function UserMenu() {
  const navigate = useNavigate()
  const { user, clearUser } = useAuthStore()
  const { toast } = useToast()

  if (!user) return null

  const getInitials = (name: string, lastName: string) => {
    return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      clearUser()
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      })
      navigate('/login')
    } catch (error: unknown) {
      console.error('Error al cerrar sesión:', error)
      toast({
        title: "Error",
        description: "Hubo un error al cerrar sesión",
        variant: "destructive",
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <div className="flex items-center bg-white/10 hover:bg-white/20 rounded-full px-2 py-1.5">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} alt={user.nombres} />
              <AvatarFallback className="bg-[#F37021] text-white">
                {getInitials(user.nombres, user.apellidos)}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-4 w-4 text-white ml-1" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.nombres} {user.apellidos}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/perfil')}>
          <User className="mr-2 h-4 w-4" />
          <span>Mi Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/configuracion')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configuración</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 