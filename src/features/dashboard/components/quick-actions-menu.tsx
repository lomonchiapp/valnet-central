import { IconPlus } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function QuickActionsMenu() {
  const navigate = useNavigate()

  const actions = [
    {
      label: 'Agregar Contribuyente',
      href: '/citizens/new',
    },
    {
      label: 'Agregar Servicio',
      href: '/services/new',
    },
    {
      label: 'Agregar Sector',
      href: '/sectors/new',
    },
    {
      label: 'Asignar Servicio',
      href: '/service-assignments/new',
    },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <IconPlus className='mr-2 h-4 w-4' />
          Acciones Rápidas
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.href}
            onClick={() => navigate(action.href)}
          >
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
