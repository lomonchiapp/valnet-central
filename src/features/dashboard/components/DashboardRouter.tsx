import { useState, useEffect, useCallback } from 'react'
import { database } from '@/firebase'
import { RoleUsuario, Usuario } from '@/types/interfaces/valnet/usuario'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { AdminDashboard } from './AdminDashboard'
import { GenericDashboard } from './GenericDashboard'
import { VendedorDashboard } from './VendedorDashboard'
import { InventarioDashboard } from './InventarioDashboard'

interface RegistroResumen {
  id: string
  descripcion?: string
}

export function DashboardRouter() {
  const { user, isLoading } = useAuthStore()
  const [preRegistros, setPreRegistros] = useState<RegistroResumen[]>([])
  const [contratos, setContratos] = useState<RegistroResumen[]>([])

  // Debug: Log del usuario para depuración
  useEffect(() => {
    if (user) {
      console.log('DashboardRouter - Usuario cargado:', {
        id: user.id,
        email: user.email,
        role: user.role,
        nombres: user.nombres,
        apellidos: user.apellidos
      })
    }
  }, [user])

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
  }, [user])

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900'></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to='/login' replace />
  }

  // Mapeo de roles a dashboards específicos
  const dashboardMap = {
    [RoleUsuario.ADMIN]: () => <AdminDashboard />,
    [RoleUsuario.VENDEDOR]: () => (
      <VendedorDashboard
        usuario={user as Usuario}
        preRegistros={preRegistros}
        contratos={contratos}
      />
    ),
    [RoleUsuario.INVENTARIO]: () => <InventarioDashboard />,
    [RoleUsuario.SAC]: () => <GenericDashboard inventarios={[]} preRegistros={[]} />,
    [RoleUsuario.TECNICO]: () => <GenericDashboard inventarios={[]} preRegistros={[]} />,
    [RoleUsuario.TECNICO_LIDER]: () => <GenericDashboard inventarios={[]} preRegistros={[]} />,
    [RoleUsuario.COORDINADOR]: () => <GenericDashboard inventarios={[]} preRegistros={[]} />,
    [RoleUsuario.CONTABILIDAD]: () => <GenericDashboard inventarios={[]} preRegistros={[]} />,
  }

  // Renderizar el dashboard correspondiente según el rol
  const renderDashboard = () => {
    // Verificar que el usuario tenga un rol válido
    if (!user.role) {
      console.warn('Usuario sin rol definido:', user)
      return (
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center'>
            <h2 className='text-xl font-semibold mb-2'>Error de configuración</h2>
            <p className='text-gray-600'>Tu cuenta no tiene un rol asignado. Contacta al administrador.</p>
          </div>
        </div>
      )
    }

    // Obtener el dashboard correspondiente al rol
    const dashboardComponent = dashboardMap[user.role as keyof typeof dashboardMap]
    
    if (dashboardComponent) {
      return dashboardComponent()
    }

    // Si el rol no está mapeado
    console.warn('Rol no reconocido:', user.role)
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <h2 className='text-xl font-semibold mb-2'>Rol no reconocido</h2>
          <p className='text-gray-600'>Tu rol "{user.role}" no está configurado en el sistema.</p>
        </div>
      </div>
    )
  }

  return renderDashboard()
}

export default DashboardRouter
