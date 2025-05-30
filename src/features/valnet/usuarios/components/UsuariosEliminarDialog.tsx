import { useState } from 'react'
import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-react'
import { Usuario } from '@/types/interfaces/valnet/usuario'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface UsuariosEliminarDialogProps {
  setOpen: (modal: string | null) => void
  currentUser: Usuario | null
}

export function UsuariosEliminarDialog({
  setOpen,
  currentUser,
}: UsuariosEliminarDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleEliminar = async () => {
    if (!currentUser) return

    try {
      setIsLoading(true)
      // Simulación de eliminación - Reemplazar con lógica real
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsLoading(false)
      setOpen(null)
      toast({
        title: 'Usuario eliminado',
        description: 'El usuario ha sido eliminado exitosamente',
      })
    } catch (error) {
      setIsLoading(false)
      toast({
        variant: 'destructive',
        title: 'Error al eliminar el usuario',
        description:
          error instanceof Error ? error.message : 'Error desconocido',
      })
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Eliminar Usuario</DialogTitle>
        <DialogDescription>
          Esta acción no se puede deshacer. Esto eliminará permanentemente al
          usuario y eliminará sus datos de nuestros servidores.
        </DialogDescription>
      </DialogHeader>

      <div className='flex items-center gap-4 py-4'>
        <div className='bg-amber-50 dark:bg-amber-950 p-3 rounded-full'>
          <IconAlertTriangle size={24} className='text-amber-500' />
        </div>
        <div>
          <h4 className='text-lg font-medium'>
            ¿Está seguro que desea eliminar este usuario?
          </h4>
          {currentUser && (
            <p className='text-sm text-muted-foreground'>
              {currentUser.nombres} {currentUser.apellidos} ({currentUser.email}
              )
            </p>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button variant='outline' onClick={() => setOpen(null)}>
          Cancelar
        </Button>
        <Button
          variant='destructive'
          onClick={handleEliminar}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <IconLoader2 size={16} className='mr-2 animate-spin' />
              Eliminando...
            </>
          ) : (
            'Eliminar Usuario'
          )}
        </Button>
      </DialogFooter>
    </>
  )
}
