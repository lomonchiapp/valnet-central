import UsuarioForm from './UsuarioForm'
import { useUpdateUsuario } from '../hooks/useUpdateUsuario'
import { Usuario } from '@/types/interfaces/valnet/usuario'

interface UsuariosEditarDialogProps {
  setOpen: (modal: string | null) => void
  currentUser: Usuario | null
}

function mapUserToUsuario(user: Usuario): Partial<Usuario> {
  return {
    nombres: user.nombres || '',
    apellidos: user.apellidos || '',
    email: user.email || '',
    role: user.role,
    cedula: user.cedula || '',
    status: user.status,
    telefono: user.telefono || '',
    direccion: user.direccion || '',
    fechaNacimiento: user.fechaNacimiento || '',
    brigadaId: user.brigadaId || '',
    updatedAt: user.updatedAt,
    createdAt: user.createdAt,
  }
}


export function UsuariosEditarDialog({ setOpen, currentUser }: UsuariosEditarDialogProps) {
  const { updateUsuario, loading, error } = useUpdateUsuario()
  
  return (
    <>
      <UsuarioForm
        usuario={currentUser ? mapUserToUsuario(currentUser) : undefined}
        onSubmit={async (usuario) => {
          if (!currentUser) return
          const res = await updateUsuario(currentUser.id, usuario)
          if (res.success) setOpen(null)
        }}
        isLoading={loading}
        onCancel={() => setOpen(null)}
      />
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </>
  )
} 