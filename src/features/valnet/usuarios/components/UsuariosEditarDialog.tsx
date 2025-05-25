import UsuarioForm from './UsuarioForm'
import { useUsuarios } from '../context/usuarios-context'
import { RoleUsuario, StatusUsuario, Usuario } from '@/types/interfaces/valnet/usuario'
import { User } from '../data/schema'
import { useUpdateUsuario } from '../hooks/useUpdateUsuario'

function mapUserToUsuario(user: User): Partial<Usuario> {
  return {
    nombres: user.firstName || '',
    apellidos: user.lastName || '',
    email: user.email || '',
    role: mapRole(user.role),
    cedula: '',
    status: mapStatus(user.status),
    telefono: user.phoneNumber || '',
    direccion: '',
    fechaNacimiento: '',
    brigadaId: '',
    updatedAt: user.updatedAt,
    createdAt: user.createdAt,
  }
}

function mapRole(role: string): RoleUsuario {
  switch (role) {
    case 'admin': return RoleUsuario.ADMIN
    case 'vendedor': return RoleUsuario.VENDEDOR
    case 'tecnico': return RoleUsuario.TECNICO
    case 'tecnico_lider': return RoleUsuario.TECNICO_LIDER
    case 'coordinador': return RoleUsuario.COORDINADOR
    case 'inventario': return RoleUsuario.INVENTARIO
    case 'contabilidad': return RoleUsuario.CONTABILIDAD
    case 'sac': return RoleUsuario.SAC
    default: return RoleUsuario.VENDEDOR
  }
}

function mapStatus(status: string): StatusUsuario {
  switch (status) {
    case 'online': return StatusUsuario.ONLINE
    case 'offline': return StatusUsuario.OFFLINE
    case 'on_break': return StatusUsuario.ON_BREAK
    case 'busy': return StatusUsuario.BUSY
    default: return StatusUsuario.OFFLINE
  }
}

export function UsuariosEditarDialog() {
  const { setOpen, currentUser } = useUsuarios()
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