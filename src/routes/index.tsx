import { PerfilPage } from '@/pages/PerfilPage'
import { TareasPage } from '@/pages/TareasPage'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout'
import Tickets from '@/features/SAC/tickets'
import TicketDetail from '@/features/SAC/tickets/TicketDetail'
import Inventarios from '@/features/almacen/inventarios'
// Almacen
import Inventario from '@/features/almacen/inventarios/inventario'
import Marcas from '@/features/almacen/inventarios/marcas'
import Proveedores from '@/features/almacen/inventarios/proveedores'
// Almacen
import Ubicaciones from '@/features/almacen/inventarios/ubicaciones'
import SignIn from '@/features/auth/sign-in'
import Compras from '@/features/compras'
import Gastos from '@/features/compras/gastos'
import GastosMenores from '@/features/compras/gastos-menores'
import OrdenesCompra from '@/features/compras/ordenes'
import PagosRecurrentes from '@/features/compras/pagos-recurrentes'
import ProveedoresCompras from '@/features/compras/proveedores'
import Contabilidad from '@/features/contabilidad'
import AsientosContables from '@/features/contabilidad/asientos'
import Cuentas from '@/features/contabilidad/cuentas'
import DiarioGeneral from '@/features/contabilidad/diario-general'
import LibroDiario from '@/features/contabilidad/libro-diario'
import Reportes from '@/features/contabilidad/reportes'
// Coordinacion
import Brigadas from '@/features/coordinacion/brigadas'
import BrigadaDetail from '@/features/coordinacion/brigadas/BrigadaDetail'
import CombustibleDashboard from '@/features/coordinacion/combustible'
import { DashboardRouter } from '@/features/dashboard/components/DashboardRouter'
import Instalaciones from '@/features/instalaciones'
// Valnet
import Users from '@/features/valnet/usuarios'
import WallNet from '@/features/valnet/wallNet'
import { WallNetConfig } from '@/features/valnet/wallNet'
// Ventas
import Ventas from '@/features/ventas'
import NuevoPreRegistro from '@/features/ventas/components/NuevoPreRegistro'
import PreRegistros from '@/features/ventas/pre-registros'
import FacturasPagadas from '@/features/contabilidad/ingresos/facturas/pagadas'
import FacturasPendientes from '@/features/contabilidad/ingresos/facturas/pendientes'

// Componente para manejar rutas protegidas
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuthStore()
  const location = useLocation()

  // Mientras se verifica la autenticación, no mostrar nada
  if (isLoading) return null

  // Si no hay usuario, redirigir al login
  if (!user) {
    return <Navigate to='/sign-in' state={{ from: location }} replace />
  }

  return children
}

// Componente para rutas públicas (accesibles solo cuando NO hay sesión)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuthStore()
  const location = useLocation()

  // Mientras se verifica la autenticación, no mostrar nada
  if (isLoading) return null

  // Si hay un usuario autenticado, redirigir al dashboard
  if (user) {
    return <Navigate to='/' state={{ from: location }} replace />
  }

  return children
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route
        path='/sign-in'
        element={
          <PublicRoute>
            <SignIn />
          </PublicRoute>
        }
      />

      {/* Layout autenticado con rutas protegidas */}
      <Route
        element={
          <PrivateRoute>
            <AuthenticatedLayout />
          </PrivateRoute>
        }
      >
        {/* Dashboard como ruta principal */}
        <Route path='/' element={<DashboardRouter />} />
        {/* Rutas de la aplicación */}
        {/* Almacen */}
        <Route path='/almacen/inventarios' element={<Inventarios />}>
          <Route path='ubicaciones' element={<Ubicaciones />} />
          <Route path='marcas' element={<Marcas />} />
          <Route path='proveedores' element={<Proveedores />} />
        </Route>
        <Route path='/almacen/inventarios/:id' element={<Inventario />} />
        {/* Coordinacion */}
        <Route path='/coordinacion/brigadas' element={<Brigadas />} />
        <Route path='/soporte/tickets' element={<Tickets />} />
        <Route path='/coordinacion/brigadas/:id' element={<BrigadaDetail />} />
        <Route path='/soporte/tickets/:id' element={<TicketDetail />} />
        <Route
          path='/coordinacion/combustible'
          element={<CombustibleDashboard />}
        />
        {/* Ventas */}
        <Route path='/ventas/pre-registros' element={<Ventas />} />
        <Route path='/ventas/pre-registros/todos' element={<PreRegistros />} />
        <Route
          path='/ventas/pre-registros/nuevo'
          element={<NuevoPreRegistro />}
        />
        {/* Usuarios */}
        <Route path='/valnet/usuarios' element={<Users />} />
        {/* WallNet - Muro social */}
        <Route path='/valnet/wallnet' element={<WallNet />} />
        {/* WallNet - Configuración */}
        <Route path='/valnet/wallnet/config' element={<WallNetConfig />} />
        {/* Instalaciones */}
        <Route path='/instalaciones' element={<Instalaciones />} />
        {/* Compras */}
        <Route path='/compras' element={<Compras />} />
        <Route path='/compras/gastos' element={<Gastos />} />
        <Route
          path='/compras/pagos-recurrentes'
          element={<PagosRecurrentes />}
        />
        <Route path='/compras/ordenes' element={<OrdenesCompra />} />
        <Route path='/compras/gastos-menores' element={<GastosMenores />} />
        <Route path='/compras/proveedores' element={<ProveedoresCompras />} />
        {/* Contabilidad */}
        <Route path='/contabilidad' element={<Contabilidad />} />
        <Route
          path='/contabilidad/diario-general'
          element={<DiarioGeneral />}
        />
        <Route path='/contabilidad/asientos' element={<AsientosContables />} />
        <Route path='/contabilidad/cuentas' element={<Cuentas />} />
        <Route path='/contabilidad/libro-diario' element={<LibroDiario />} />
        <Route path='/contabilidad/reportes' element={<Reportes />} />
        {/* Ingresos */}
        <Route path='/ingresos/facturas/pendientes' element={<FacturasPendientes />} />
        <Route path='/ingresos/facturas/pagadas' element={<FacturasPagadas />} />
        {/* Tareas */}
        <Route path='/tareas' element={<TareasPage />} />
        {/* Perfil */}
        <Route path='/perfil' element={<PerfilPage />} />
      </Route>

      {/* Ruta 404 - Redirige al dashboard */}
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  )
}
