import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { UsuariosBotonesPrincipales } from './components/UsuariosBotonesPrincipales'
import { UsuarioItem } from './components/UsuarioItem'
import UsuariosProvider from './context/usuarios-context'
import { UsuariosDialogs } from './components/UsuariosDialogs'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { IconUsers } from '@tabler/icons-react'
import { useValnetState } from '@/context/global/useValnetState'

export default function Usuarios() {
  const {users, subscribeToUsers} = useValnetState()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeToUsers()
    return () => unsubscribe()
  }, [subscribeToUsers])

  useEffect(() => {
    setIsLoading(false)
  }, [users])

  return (
    <UsuariosProvider>
      <Header fixed>
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='space-y-6'>
          {/* Título y descripción */}
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Gestión de Usuarios</h2>
            <p className='text-muted-foreground'>
              Administra los usuarios de la plataforma, sus roles y permisos.
            </p>
          </div>
          
          {/* Botones y acciones principales */}
          <UsuariosBotonesPrincipales />
          
          {/* Grid de usuarios */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-pulse space-y-6">
                <div className="h-2 w-48 bg-muted rounded"></div>
                <div className="h-2 w-64 bg-muted rounded"></div>
              </div>
            </div>
          ) : users.length > 0 ? (
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {users.map((usuario) => (
                <UsuarioItem
                  key={usuario.id}
                  user={usuario}
                />
              ))}
            </div>
          ) : (
            <Card className="py-12 flex flex-col items-center justify-center text-center px-4">
              <IconUsers size={48} className="text-muted-foreground opacity-20 mb-4" />
              <h3 className="text-lg font-medium">No hay usuarios registrados</h3>
              <p className="text-muted-foreground">
                Agrega usuarios para que aparezcan aquí
              </p>
            </Card>
          )}
        </div>
        
        {/* Diálogos para acciones */}
        <UsuariosDialogs />
      </Main>
    </UsuariosProvider>
  )
} 