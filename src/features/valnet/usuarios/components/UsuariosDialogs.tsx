import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { useCreateUsuario } from '../hooks/useCreateUsuario'
import UsuarioForm from './UsuarioForm'
import { UsuariosEliminarDialog } from './UsuariosEliminarDialog'
import { UsuariosInvitarDialog } from './UsuariosInvitarDialog'
import { UsuariosEditarDialog } from './UsuariosEditarDialog'
import { Usuario } from '@/types/interfaces/valnet/usuario'

interface UsuariosDialogsProps {
  open: string | null
  setOpen: (modal: string | null) => void
  currentUser: Usuario | null
  setCurrentUser: (user: Usuario | null) => void
}

export function UsuariosDialogs({ open, setOpen, currentUser, setCurrentUser }: UsuariosDialogsProps) {
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
          <UsuariosEliminarDialog setOpen={setOpen} currentUser={currentUser} />
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para invitar usuario */}
      <Dialog 
        open={open === 'invitar'} 
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
      >
        <DialogContent className="max-w-xl">
          <UsuariosInvitarDialog setOpen={setOpen} />
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para editar usuario */}
      <Dialog 
        open={open === 'editar'} 
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
      >
        <DialogContent className="max-w-xl">
          <UsuariosEditarDialog setOpen={setOpen} currentUser={currentUser} />
        </DialogContent>
      </Dialog>
    </>
  )
} 