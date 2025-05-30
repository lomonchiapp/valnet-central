import { useAuth } from '@/hooks/useAuth'
import { RoleUsuario } from '@/types/interfaces/valnet/usuario'
import { AdminDashboard } from './AdminDashboard'
import { GenericDashboard } from './GenericDashboard'
import { Navigate } from 'react-router-dom'

export function DashboardRouter() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Renderizar el dashboard correspondiente según el rol
  const renderDashboard = () => {
    switch (user.role) {
      case RoleUsuario.ADMIN:
        return <AdminDashboard />
      case RoleUsuario.VENDEDOR:
      case RoleUsuario.SAC:
      case RoleUsuario.TECNICO:
      case RoleUsuario.TECNICO_LIDER:
      case RoleUsuario.COORDINADOR:
      case RoleUsuario.INVENTARIO:
      case RoleUsuario.CONTABILIDAD:
        return <GenericDashboard inventarios={[]} preRegistros={[]} />
      default:
        return <Navigate to="/unauthorized" replace />
    }
  }

  return renderDashboard()
}

export default DashboardRouter 