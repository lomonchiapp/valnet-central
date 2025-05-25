import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { useUsuarios } from '../context/usuarios-context'
import UsuarioForm from './UsuarioForm'
import { UsuariosEliminarDialog } from './UsuariosEliminarDialog'
import { UsuariosInvitarDialog } from './UsuariosInvitarDialog'
import { UsuariosEditarDialog } from './UsuariosEditarDialog'
import { useCreateUsuario } from '../hooks/useCreateUsuario'

export function UsuariosDialogs() {
  const { open, setOpen } = useUsuarios()
  const { createUsuario, loading, error } = useCreateUsuario()

  return (
    <>
      {/* Diálogo para agregar nuevo usuario */}
      <Dialog 
        open={open === 'agregar'} 
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
      >
        <DialogContent className="max-w-xl">
          <UsuarioForm 
            onSubmit={async (usuario) => {
              const res = await createUsuario(usuario)
              if (res.success) {
                setOpen(null)
              }
            }}
            isLoading={loading}
            onCancel={() => setOpen(null)}
          />
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para eliminar usuario */}
      <Dialog 
        open={open === 'eliminar'} 
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
      >
        <DialogContent className="max-w-lg">
          <UsuariosEliminarDialog />
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para invitar usuario */}
      <Dialog 
        open={open === 'invitar'} 
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
      >
        <DialogContent className="max-w-xl">
          <UsuariosInvitarDialog />
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para editar usuario */}
      <Dialog 
        open={open === 'editar'} 
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
      >
        <DialogContent className="max-w-xl">
          <UsuariosEditarDialog />
        </DialogContent>
      </Dialog>
    </>
  )
} 