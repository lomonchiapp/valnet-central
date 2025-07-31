import { useState, useEffect } from 'react'
import { Inventario } from '@/types/interfaces/almacen/inventario'
import {
  Plus,
  Warehouse,
  ChevronDown,
  Search,
  PackageOpen,
  PackageMinus,
  ArrowLeftRight,
  ClipboardCheck,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAlmacenState } from '@/context/global/useAlmacenState'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu'
import { UserMenu } from '@/components/layout/UserMenu'
import { NotificacionesDropdown } from '@/features/notificaciones/components/NotificacionesDropdown'

export function InventarioTopBar() {
  const navigate = useNavigate()
  const { inventarios, subscribeToInventarios } = useAlmacenState()
  const [currentInventario, setCurrentInventario] = useState<Inventario | null>(
    null
  )
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Subscribe to inventarios from Firestore
    const unsubscribe = subscribeToInventarios()
    return () => unsubscribe()
  }, [subscribeToInventarios])

  useEffect(() => {
    // Set current inventario to the first one when inventarios are loaded
    // or if current one doesn't exist anymore
    if (inventarios.length > 0) {
      if (
        !currentInventario ||
        !inventarios.find((inv) => inv.id === currentInventario.id)
      ) {
        // Find principal inventario first
        const principalInventario = inventarios.find((inv) => inv.principal)
        setCurrentInventario(principalInventario || inventarios[0])
      }
    }
  }, [inventarios, currentInventario])

  // Acciones para el botón "Crear" con íconos y atajos
  const createActions = [
    {
      label: 'Entrada de artículos',
      icon: <PackageOpen className='mr-2 h-4 w-4' />,
      shortcut: '⌘E',
      action: () => navigate('/almacen/entradas/nuevo'),
    },
    {
      label: 'Salida de artículos',
      icon: <PackageMinus className='mr-2 h-4 w-4' />,
      shortcut: '⌘S',
      action: () => navigate('/almacen/salidas/nuevo'),
    },
    {
      label: 'Transferencia',
      icon: <ArrowLeftRight className='mr-2 h-4 w-4' />,
      shortcut: '⌘T',
      action: () => navigate('/almacen/transferencias/nuevo'),
    },
    {
      label: 'Selección de inventario',
      icon: <ClipboardCheck className='mr-2 h-4 w-4' />,
      shortcut: '⌘I',
      action: () => navigate('/almacen/inventarios'),
    },
  ]

  // Register keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'e':
            e.preventDefault()
            navigate('/almacen/entradas/nuevo')
            break
          case 's':
            e.preventDefault()
            navigate('/almacen/salidas/nuevo')
            break
          case 't':
            e.preventDefault()
            navigate('/almacen/transferencias/nuevo')
            break
          case 'i':
            e.preventDefault()
            navigate('/almacen/inventarios')
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [navigate])

  const handleInventarioChange = (inventario: Inventario) => {
    setCurrentInventario(inventario)
    // Navigate to the selected inventory
    navigate(`/almacen/inventarios/${inventario.id}`)
  }

  // Filter inventarios based on search term
  const filteredInventarios =
    searchTerm && inventarios
      ? inventarios.filter(
          (inv) =>
            inv.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : inventarios

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
            placeholder='Buscar artículos en inventario...'
            className='bg-transparent outline-none border-none w-full text-gray-700 placeholder-gray-400'
            disabled
          />
        </div>
      </div>

      {/* Botones de acción a la derecha */}
      <div className='flex items-center gap-3 ml-6'>
        <NotificacionesDropdown />

        {currentInventario && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='secondary'
                className='bg-white hover:bg-gray-100 border border-gray-200'
              >
                <Warehouse className='mr-2 h-4 w-4 text-[#005BAA]' />
                {currentInventario.nombre}
                <ChevronDown className='ml-2 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-64'>
              <div className='p-2'>
                <div className='flex items-center border rounded-md px-3 py-1 mb-2'>
                  <Search className='h-4 w-4 text-gray-500 mr-2' />
                  <input
                    type='text'
                    placeholder='Buscar inventario...'
                    className='border-none outline-none flex-1 text-sm'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className='max-h-60 overflow-y-auto'>
                {filteredInventarios && filteredInventarios.length > 0 ? (
                  filteredInventarios.map((inventario) => (
                    <DropdownMenuItem
                      key={inventario.id}
                      onClick={() => handleInventarioChange(inventario)}
                      className='cursor-pointer'
                    >
                      <Warehouse className='mr-2 h-4 w-4 text-[#005BAA]' />
                      <div>
                        <div>{inventario.nombre}</div>
                        {inventario.descripcion && (
                          <div className='text-xs text-gray-500'>
                            {inventario.descripcion}
                          </div>
                        )}
                      </div>
                      {inventario.principal && (
                        <div className='ml-auto text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full'>
                          Principal
                        </div>
                      )}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className='px-2 py-1 text-sm text-gray-500 text-center'>
                    No se encontraron inventarios
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              style={{ backgroundColor: '#F37021', borderColor: '#F37021' }}
              className='hover:bg-orange-500 text-white border-none'
            >
              <Plus className='mr-2 h-4 w-4' />
              Crear
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            <div className='p-2 text-sm font-medium text-muted-foreground'>
              Acciones rápidas
            </div>
            <DropdownMenuSeparator />
            {createActions.map((action) => (
              <DropdownMenuItem
                key={action.label}
                onClick={action.action}
                className='cursor-pointer flex items-center'
              >
                {action.icon}
                <span>{action.label}</span>
                <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className='ml-4'>
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
