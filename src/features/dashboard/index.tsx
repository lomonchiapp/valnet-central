import { useState } from 'react'
// Importing roles and auth - usar la misma fuente que AuthProvider
import { RoleUsuario } from 'shared-types'
import { useAuthStore } from '@/stores/authStore'
import { useAlmacenState } from '@/context/global/useAlmacenState'
// Global states
import { useVentasState } from '@/context/global/useVentasState'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Main } from '@/components/layout/main'
import GenericDashboard from './components/GenericDashboard'
// Components
import InventarioDashboard from './components/InventarioDashboard'
import SacDashboard from './components/SacDashboard'
import { VendedorDashboard } from './components/VendedorDashboard'

export default function Dashboard() {
  const { user } = useAuthStore()
  const { inventarios } = useAlmacenState()
  const { preRegistros } = useVentasState()
  const [activeTab, setActiveTab] = useState('overview')

  // Render dashboard based on user role
  const renderDashboard = () => {
    if (!user) return <div>Cargando...</div>

    switch (user.role) {
      case RoleUsuario.INVENTARIO:
        return <InventarioDashboard />
      case RoleUsuario.SAC:
        return <SacDashboard />
      default:
        return (
          <GenericDashboard
            inventarios={inventarios}
            preRegistros={preRegistros}
          />
        )
    }
  }

  // Si el usuario es vendedor, mostrar su dashboard
  if (user?.role === 'Vendedor') {
    return (
      <VendedorDashboard
        usuario={user}
        preRegistros={preRegistros}
        contratos={[]}
      />
    )
  }

  return (
    <>
      {/* ===== Main ===== */}
      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>
            {user?.role === RoleUsuario.INVENTARIO
              ? 'Panel de Inventario'
              : 'Panel de Administración'}
          </h1>
        </div>
        <Tabs
          orientation='vertical'
          value={activeTab}
          onValueChange={setActiveTab}
          className='space-y-4'
        >
          <TabsContent value='overview' className='space-y-4 mt-10'>
            {renderDashboard()}
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
