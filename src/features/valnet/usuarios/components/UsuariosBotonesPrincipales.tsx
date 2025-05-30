import { useState } from 'react'
import {
  IconUserPlus,
  IconMailForward,
  IconFileExport,
  IconFileImport,
  IconSearch,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface UsuariosBotonesPrincipalesProps {
  setOpen: (modal: 'agregar' | 'invitar') => void
}

export function UsuariosBotonesPrincipales({
  setOpen,
}: UsuariosBotonesPrincipalesProps) {
  const [busqueda, setBusqueda] = useState('')

  return (
    <div className='flex flex-wrap items-center gap-3'>
      <div className='relative flex-1 min-w-[200px]'>
        <IconSearch
          size={18}
          className='absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground'
        />
        <Input
          placeholder='Buscar usuarios...'
          className='pl-9 max-w-xs'
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        <Button
          variant='default'
          className='gap-2'
          onClick={() => setOpen('agregar')}
        >
          <IconUserPlus size={18} />
          <span>Nuevo Usuario</span>
        </Button>

        <Button
          variant='outline'
          className='gap-2'
          onClick={() => setOpen('invitar')}
        >
          <IconMailForward size={18} />
          <span>Invitar</span>
        </Button>

        <div className='flex gap-1'>
          <Button variant='outline' size='icon' title='Importar usuarios'>
            <IconFileImport size={18} />
          </Button>

          <Button variant='outline' size='icon' title='Exportar usuarios'>
            <IconFileExport size={18} />
          </Button>
        </div>
      </div>
    </div>
  )
}
