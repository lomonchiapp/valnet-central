import { useState, useEffect } from 'react'
import { IconUsers } from '@tabler/icons-react'
import { Usuario } from '@/types/interfaces/valnet/usuario'
import { useValnetState } from '@/context/global/useValnetState'
import { Card } from '@/components/ui/card'
import { Main } from '@/components/layout/main'
import { UsuarioItem } from './components/UsuarioItem'
import { UsuariosBotonesPrincipales } from './components/UsuariosBotonesPrincipales'
import { UsuariosDialogs } from './components/UsuariosDialogs'

export default function Usuarios() {
  const { users, subscribeToUsers } = useValnetState()
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState<
    null | 'agregar' | 'invitar' | 'editar' | 'eliminar'
  >(null)
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeToUsers()
    return () => unsubscribe()
  }, [subscribeToUsers])

  useEffect(() => {
    setIsLoading(false)
  }, [users])

  return (
    <Main>
      <div className='space-y-6'>
        {/* Título y descripción */}
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Gestión de Usuarios
          </h2>
          <p className='text-muted-foreground'>
            Administra los usuarios de la plataforma, sus roles y permisos.
          </p>
        </div>
        {/* Botones y acciones principales */}
        <UsuariosBotonesPrincipales setOpen={setOpen} />
        {/* Grid de usuarios */}
        {isLoading ? (
          <div className='flex justify-center items-center py-12'>
            <div className='animate-pulse space-y-6'>
              <div className='h-2 w-48 bg-muted rounded'></div>
              <div className='h-2 w-64 bg-muted rounded'></div>
            </div>
          </div>
        ) : users.length > 0 ? (
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {users.map((usuario) => (
              <UsuarioItem
                key={usuario.id}
                user={usuario}
                setOpen={setOpen as (modal: string | null) => void}
                setCurrentUser={setCurrentUser}
              />
            ))}
          </div>
        ) : (
          <Card className='py-12 flex flex-col items-center justify-center text-center px-4'>
            <IconUsers
              size={48}
              className='text-muted-foreground opacity-20 mb-4'
            />
            <h3 className='text-lg font-medium'>No hay usuarios registrados</h3>
            <p className='text-muted-foreground'>
              Agrega usuarios para que aparezcan aquí
            </p>
          </Card>
        )}
      </div>
      {/* Diálogos para acciones */}
      <UsuariosDialogs
        open={open}
        setOpen={setOpen as (modal: string | null) => void}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />
    </Main>
  )
}
