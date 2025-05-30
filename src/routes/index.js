import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import Tickets from '@/features/SAC/tickets';
import TicketDetail from '@/features/SAC/tickets/TicketDetail';
import Inventarios from '@/features/almacen/inventarios';
// Almacen
import Inventario from '@/features/almacen/inventarios/inventario';
import Marcas from '@/features/almacen/inventarios/marcas';
import Proveedores from '@/features/almacen/inventarios/proveedores';
// Almacen
import Ubicaciones from '@/features/almacen/inventarios/ubicaciones';
import SignIn from '@/features/auth/sign-in';
// Coordinacion
import Brigadas from '@/features/coordinacion/brigadas';
import BrigadaDetail from '@/features/coordinacion/brigadas/BrigadaDetail';
import CombustibleDashboard from '@/features/coordinacion/combustible';
import Dashboard from '@/features/dashboard';
import Instalaciones from '@/features/instalaciones';
// Valnet
import Users from '@/features/valnet/usuarios';
import WallNet from '@/features/valnet/wallNet';
import { WallNetConfig } from '@/features/valnet/wallNet';
// Ventas
import Ventas from '@/features/ventas';
import NuevoPreRegistro from '@/features/ventas/components/NuevoPreRegistro';
import PreRegistros from '@/features/ventas/pre-registros';
// Componente para manejar rutas protegidas
const PrivateRoute = ({ children }) => {
    const { user, isLoading } = useAuthStore();
    const location = useLocation();
    // Mientras se verifica la autenticación, no mostrar nada
    if (isLoading)
        return null;
    // Si no hay usuario, redirigir al login
    if (!user) {
        return _jsx(Navigate, { to: '/sign-in', state: { from: location }, replace: true });
    }
    return children;
};
// Componente para rutas públicas (accesibles solo cuando NO hay sesión)
const PublicRoute = ({ children }) => {
    const { user, isLoading } = useAuthStore();
    const location = useLocation();
    // Mientras se verifica la autenticación, no mostrar nada
    if (isLoading)
        return null;
    // Si hay un usuario autenticado, redirigir al dashboard
    if (user) {
        return _jsx(Navigate, { to: '/', state: { from: location }, replace: true });
    }
    return children;
};
export function AppRoutes() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: '/sign-in', element: _jsx(PublicRoute, { children: _jsx(SignIn, {}) }) }), _jsxs(Route, { element: _jsx(PrivateRoute, { children: _jsx(AuthenticatedLayout, {}) }), children: [_jsx(Route, { path: '/', element: _jsx(Dashboard, {}) }), _jsxs(Route, { path: '/almacen/inventarios', element: _jsx(Inventarios, {}), children: [_jsx(Route, { path: 'ubicaciones', element: _jsx(Ubicaciones, {}) }), _jsx(Route, { path: 'marcas', element: _jsx(Marcas, {}) }), _jsx(Route, { path: 'proveedores', element: _jsx(Proveedores, {}) })] }), _jsx(Route, { path: '/almacen/inventarios/:id', element: _jsx(Inventario, {}) }), _jsx(Route, { path: '/coordinacion/brigadas', element: _jsx(Brigadas, {}) }), _jsx(Route, { path: '/soporte/tickets', element: _jsx(Tickets, {}) }), _jsx(Route, { path: '/coordinacion/brigadas/:id', element: _jsx(BrigadaDetail, {}) }), _jsx(Route, { path: '/soporte/tickets/:id', element: _jsx(TicketDetail, {}) }), _jsx(Route, { path: '/coordinacion/combustible', element: _jsx(CombustibleDashboard, {}) }), _jsx(Route, { path: '/ventas/pre-registros', element: _jsx(Ventas, {}) }), _jsx(Route, { path: '/ventas/pre-registros/todos', element: _jsx(PreRegistros, {}) }), _jsx(Route, { path: '/ventas/pre-registros/nuevo', element: _jsx(NuevoPreRegistro, {}) }), _jsx(Route, { path: '/valnet/usuarios', element: _jsx(Users, {}) }), _jsx(Route, { path: '/valnet/wallnet', element: _jsx(WallNet, {}) }), _jsx(Route, { path: '/valnet/wallnet/config', element: _jsx(WallNetConfig, {}) }), _jsx(Route, { path: '/instalaciones', element: _jsx(Instalaciones, {}) })] }), _jsx(Route, { path: '*', element: _jsx(Navigate, { to: '/', replace: true }) })] }));
}
