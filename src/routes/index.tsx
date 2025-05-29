import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout'
import Dashboard from '@/features/dashboard'
import SignIn from '@/features/auth/sign-in'
import Inventarios from '@/features/almacen/inventarios'
// Coordinacion
import Brigadas from '@/features/coordinacion/brigadas'
import TicketDetail from '@/features/SAC/tickets/TicketDetail'
import BrigadaDetail from '@/features/coordinacion/brigadas/BrigadaDetail'
// Almacen
import Inventario from '@/features/almacen/inventarios/inventario'
// Ventas
import Ventas from '@/features/ventas'
import NuevoPreRegistro from '@/features/ventas/components/NuevoPreRegistro'
// Almacen
import Ubicaciones from '@/features/almacen/inventarios/ubicaciones'
import Marcas from '@/features/almacen/inventarios/marcas'
import Proveedores from '@/features/almacen/inventarios/proveedores'
import PreRegistros from '@/features/ventas/pre-registros'
// Valnet
import Users from '@/features/valnet/usuarios'
import Instalaciones from '@/features/instalaciones'
import Tickets from '@/features/SAC/tickets'
import CombustibleDashboard from '@/features/coordinacion/combustible'
import WallNet from '@/features/valnet/wallNet'
import { WallNetConfig } from '@/features/valnet/wallNet'


// Componente para manejar rutas protegidas
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuthStore()
  const location = useLocation()

  // Mientras se verifica la autenticación, no mostrar nada
  if (isLoading) return null

  // Si no hay usuario, redirigir al login
  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />
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
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return children
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route 
        path="/sign-in" 
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
        <Route path="/" element={<Dashboard />} />
        {/* Rutas de la aplicación */}
        {/* Almacen */}
        <Route path="/almacen/inventarios" element={<Inventarios />}>
          <Route path="ubicaciones" element={<Ubicaciones />} />
          <Route path="marcas" element={<Marcas />} />
          <Route path="proveedores" element={<Proveedores />} />
        </Route>
        <Route path="/almacen/inventarios/:id" element={<Inventario />} />
        {/* Coordinacion */}
        <Route path="/coordinacion/brigadas" element={<Brigadas />} />
        <Route path="/soporte/tickets" element={<Tickets />} />
        <Route path="/coordinacion/brigadas/:id" element={<BrigadaDetail />} />
        <Route path="/soporte/tickets/:id" element={<TicketDetail />} />
        <Route path="/coordinacion/combustible" element={<CombustibleDashboard />} />
        {/* Ventas */}
        <Route path="/ventas/pre-registros" element={<Ventas />} />
        <Route path="/ventas/pre-registros/todos" element={<PreRegistros />} />
        <Route path="/ventas/pre-registros/nuevo" element={<NuevoPreRegistro />} />
        {/* Usuarios */}
        <Route path="/valnet/usuarios" element={<Users />} />
        {/* WallNet - Muro social */}
        <Route path="/valnet/wallnet" element={<WallNet />} />
        {/* WallNet - Configuración */}
        <Route path="/valnet/wallnet/config" element={<WallNetConfig />} />
        {/* Instalaciones */}
        <Route path="/instalaciones" element={<Instalaciones />} />
      </Route>

      {/* Ruta 404 - Redirige al dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
