import { useState } from 'react'
import {
  Users,
  Shield,
  Search,
  Plus,
  CreditCard,
  UserPlus,
  Repeat,
  TrendingUp,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { UserMenu } from '@/components/layout/UserMenu'
import { PagoUnicoForm } from '@/features/compras/gastos/components/PagoUnicoForm'
import NuevoPagoRecurrenteForm from '@/features/compras/pagos-recurrentes/NuevoPagoRecurrenteForm'
import { NuevoIngresoForm } from '@/features/contabilidad/ingresos/components/NuevoIngresoForm'
import { NotificacionesDropdown } from '@/features/notificaciones/components/NotificacionesDropdown'
import { UsuarioForm } from '@/features/valnet/usuarios/components/UsuarioForm'

export function AdminTopBar() {
  const navigate = useNavigate()

  // Estados para modales
  const [showGastoForm, setShowGastoForm] = useState(false)
  const [showUsuarioForm, setShowUsuarioForm] = useState(false)
  const [showPagoRecurrenteForm, setShowPagoRecurrenteForm] = useState(false)
  const [showIngresoForm, setShowIngresoForm] = useState(false)

  // Acciones para el menú de creación
  const createActions = [
    {
      label: 'Nuevo Gasto/Pago',
      icon: <CreditCard className='mr-2 h-4 w-4' />,
      action: () => setShowGastoForm(true),
    },
    {
      label: 'Nuevo Ingreso',
      icon: <TrendingUp className='mr-2 h-4 w-4' />,
      action: () => setShowIngresoForm(true),
    },
    {
      label: 'Nuevo Usuario',
      icon: <UserPlus className='mr-2 h-4 w-4' />,
      action: () => setShowUsuarioForm(true),
    },
    {
      label: 'Nuevo Pago Recurrente',
      icon: <Repeat className='mr-2 h-4 w-4' />,
      action: () => setShowPagoRecurrenteForm(true),
    },
  ]

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

  const handleGastoSuccess = () => {
    setShowGastoForm(false)
  }

  const handleIngresoSuccess = () => {
    setShowIngresoForm(false)
  }

  const handleUsuarioSubmit = () => {
    setShowUsuarioForm(false)
  }

  const handlePagoRecurrenteClose = () => {
    setShowPagoRecurrenteForm(false)
  }

  return (
    <>
      <header className='w-full bg-[#005BAA] shadow z-50 h-20 flex items-center px-6'>
        {/* Logo */}
        <div className='flex items-center min-w-[160px]'>
          <img src='/valdesk-white.png' alt='logo' className='w-36 h-auto' />
        </div>

        {/* Buscador centrado */}
        <div className='flex-1 flex justify-center'>
          <div className='w-full max-w-xl flex items-center bg-gray-100 rounded-md px-4 py-2'>
            <Search className='h-5 w-5 text-gray-400 mr-2' />
            <input
              type='text'
              placeholder='Buscar'
              className='bg-transparent outline-none border-none w-full text-gray-700 placeholder-gray-400'
              disabled
            />
          </div>
        </div>

        {/* Botones de acción a la derecha */}
        <div className='flex items-center gap-3 ml-6'>
          <NotificacionesDropdown />

          {/* Menú de creación con botón + */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size='sm'
                className='bg-green-600 hover:bg-green-700 text-white border-none h-10 w-10 p-0 rounded-full'
                title='Crear nuevo'
              >
                <Plus className='h-5 w-5' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              <div className='px-2 py-1.5 text-sm font-semibold text-gray-900'>
                Crear nuevo
              </div>
              <DropdownMenuSeparator />
              {createActions.map((action) => (
                <DropdownMenuItem
                  key={action.label}
                  onClick={action.action}
                  className='cursor-pointer'
                >
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => navigate('/admin/users')}
            variant='secondary'
            className='bg-white hover:bg-gray-100 text-[#005BAA] border border-gray-200'
          >
            <Users className='mr-2 h-4 w-4 text-[#005BAA]' />
            Usuarios
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                style={{ backgroundColor: '#F37021', borderColor: '#F37021' }}
                className='hover:bg-orange-500 text-white border-none'
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

          <div className='ml-4'>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Modales */}
      <PagoUnicoForm
        open={showGastoForm}
        onOpenChange={setShowGastoForm}
        onSuccess={handleGastoSuccess}
      />

      <NuevoIngresoForm
        open={showIngresoForm}
        onOpenChange={setShowIngresoForm}
        onSuccess={handleIngresoSuccess}
      />

      <Dialog open={showUsuarioForm} onOpenChange={setShowUsuarioForm}>
        <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
          <UsuarioForm
            onSubmit={handleUsuarioSubmit}
            onCancel={() => setShowUsuarioForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Sheet
        open={showPagoRecurrenteForm}
        onOpenChange={setShowPagoRecurrenteForm}
      >
        <SheetContent side='top' className='max-w-2xl mx-auto'>
          <SheetHeader>
            <SheetTitle>Nuevo pago recurrente</SheetTitle>
          </SheetHeader>
          <NuevoPagoRecurrenteForm onClose={handlePagoRecurrenteClose} />
        </SheetContent>
      </Sheet>
    </>
  )
}
