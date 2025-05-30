import { useState, useEffect, useCallback } from 'react'
import { database } from '@/firebase'
import { RoleUsuario, Usuario } from '@/types/interfaces/valnet/usuario'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AdminDashboard } from './AdminDashboard'
import { GenericDashboard } from './GenericDashboard'
import { VendedorDashboard } from './VendedorDashboard'

interface RegistroResumen {
  id: string
  descripcion?: string
}

export function DashboardRouter() {
  const { user, loading } = useAuth()
  const [preRegistros, setPreRegistros] = useState<RegistroResumen[]>([])
  const [contratos, setContratos] = useState<RegistroResumen[]>([])

  const fetchVendedorData = useCallback(async () => {
    try {
      // Obtener pre-registros del vendedor
      const preRegistrosQuery = query(
        collection(database, 'pre-registros'),
        where('vendedorId', '==', user?.id)
      )
      const preRegistrosSnapshot = await getDocs(preRegistrosQuery)
      const preRegistrosData = preRegistrosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as RegistroResumen[]
      setPreRegistros(preRegistrosData)

      // Obtener contratos del vendedor
      const contratosQuery = query(
        collection(database, 'contratos'),
        where('vendedorId', '==', user?.id)
      )
      const contratosSnapshot = await getDocs(contratosQuery)
      const contratosData = contratosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as RegistroResumen[]
      setContratos(contratosData)
    } catch (error) {
      console.error('Error fetching vendedor data:', error)
    }
  }, [user])

  useEffect(() => {
    if (user?.role === RoleUsuario.VENDEDOR) {
      fetchVendedorData()
    }
  }, [user, fetchVendedorData])

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900'></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to='/login' replace />
  }

  // Renderizar el dashboard correspondiente según el rol
  const renderDashboard = () => {
    switch (user.role) {
      case RoleUsuario.ADMIN:
        return <AdminDashboard />
      case RoleUsuario.VENDEDOR:
        return (
          <VendedorDashboard
            usuario={user as Usuario}
            preRegistros={preRegistros}
            contratos={contratos}
          />
        )
      case RoleUsuario.SAC:
      case RoleUsuario.TECNICO:
      case RoleUsuario.TECNICO_LIDER:
      case RoleUsuario.COORDINADOR:
      case RoleUsuario.INVENTARIO:
      case RoleUsuario.CONTABILIDAD:
        return <GenericDashboard inventarios={[]} preRegistros={[]} />
      default:
        console.warn('Rol no reconocido:', user.role)
        return <Navigate to='/unauthorized' replace />
    }
  }

  return renderDashboard()
}

export default DashboardRouter
