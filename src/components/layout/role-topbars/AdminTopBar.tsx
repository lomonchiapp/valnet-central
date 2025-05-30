import { Users, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function AdminTopBar() {
  const navigate = useNavigate()

  // Acciones para el botón "Administrar"
  const adminActions = [
    {
      label: 'Gestionar Usuarios',
      action: () => navigate('/admin/users'),
    },
    {
      label: 'Configuración del Sistema',
      action: () => navigate('/admin/settings'),
    },
    {
      label: 'Logs del Sistema',
      action: () => navigate('/admin/logs'),
    },
  ]

  return (
    <div className="sticky top-0 z-40 bg-[#005BAA]">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className='flex-1'>
          <h2 className='text-xl font-medium text-white'>Panel de Administración</h2>
          <p className='text-sm text-muted-foreground text-white'>
            Control y gestión del sistema
          </p>
        </div>

        <div className='flex gap-3'>
          <Button
            onClick={() => navigate('/admin/users')}
            variant='secondary'
            className='bg-white hover:bg-gray-100'
          >
            <Users className='mr-2 h-4 w-4 text-[#005BAA]' />
            Usuarios
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                style={{ backgroundColor: '#F37021', borderColor: '#F37021' }}
                className='hover:bg-orange-500'
              >
                <Shield className='mr-2 h-4 w-4' />
                Administrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {adminActions.map((action) => (
                <DropdownMenuItem
                  key={action.label}
                  onClick={action.action}
                  className='cursor-pointer'
                >
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
