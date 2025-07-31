import { ClipboardPlus, List, Search, HeadphonesIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { UserMenu } from '@/components/layout/UserMenu'
import { NotificacionesDropdown } from '@/features/notificaciones/components/NotificacionesDropdown'

export function SacTopBar() {
  const navigate = useNavigate()

  return (
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
            placeholder='Buscar tickets o pre-registros...'
            className='bg-transparent outline-none border-none w-full text-gray-700 placeholder-gray-400'
            disabled
          />
        </div>
      </div>

      {/* Botones de acción a la derecha */}
      <div className='flex items-center gap-3 ml-6'>
        <NotificacionesDropdown />

        <Button
          style={{ backgroundColor: '#F37021', borderColor: '#F37021' }}
          className='hover:bg-orange-500 text-white'
          onClick={() => navigate('/ventas/pre-registros/nuevo')}
        >
          <ClipboardPlus className='mr-2 h-4 w-4' />
          Nuevo Pre-Registro
        </Button>

        <Button
          variant='secondary'
          className='bg-white hover:bg-gray-100 text-[#005BAA] border border-gray-200'
          onClick={() => navigate('/ventas/pre-registros')}
        >
          <List className='mr-2 h-4 w-4 text-[#005BAA]' />
          Ver Pre-Registros
        </Button>

        <Button
          variant='secondary'
          className='bg-white hover:bg-gray-100 text-[#005BAA] border border-gray-200'
          onClick={() => navigate('/sac/tickets')}
        >
          <HeadphonesIcon className='mr-2 h-4 w-4 text-[#005BAA]' />
          Tickets
        </Button>

        <div className='ml-4'>
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
