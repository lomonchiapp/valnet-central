import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout'
import Dashboard from '@/features/dashboard'
import SignIn from '@/features/auth/sign-in'
import Inventarios from '@/features/almacen/inventarios'
import Brigadas from '@/features/coordinacion/brigadas'
import Inventario from '@/features/almacen/inventarios/inventario'

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

// Componente para manejar rutas públicas
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuthStore()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  // Mientras se verifica la autenticación, no mostrar nada
  if (isLoading) return null

  // Si hay usuario, redirigir a la ruta protegida
  if (user) {
    return <Navigate to={from} replace />
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
        <Route path="/almacen/inventarios" element={<Inventarios />} />
        <Route path="/almacen/inventarios/:id" element={<Inventario />} />
        {/* Coordinacion */}
        <Route path="/coordinacion/brigadas" element={<Brigadas />} />
        {/* Ventas */}


      </Route>

      {/* Ruta 404 - Redirige al dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
