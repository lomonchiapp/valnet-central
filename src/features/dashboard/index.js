import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
// Importing roles and auth - usar la misma fuente que AuthProvider
import { RoleUsuario } from 'shared-types';
import { useAuthStore } from '@/stores/authStore';
import { useAlmacenState } from '@/context/global/useAlmacenState';
// Global states
import { useVentasState } from '@/context/global/useVentasState';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Main } from '@/components/layout/main';
import GenericDashboard from './components/GenericDashboard';
// Components
import InventarioDashboard from './components/InventarioDashboard';
import SacDashboard from './components/SacDashboard';
import { VendedorDashboard } from './components/VendedorDashboard';
export default function Dashboard() {
    const { user } = useAuthStore();
    const { inventarios } = useAlmacenState();
    const { preRegistros } = useVentasState();
    const [activeTab, setActiveTab] = useState('overview');
    // Render dashboard based on user role
    const renderDashboard = () => {
        if (!user)
            return _jsx("div", { children: "Cargando..." });
        switch (user.role) {
            case RoleUsuario.INVENTARIO:
                return _jsx(InventarioDashboard, {});
            case RoleUsuario.SAC:
                return _jsx(SacDashboard, {});
            default:
                return (_jsx(GenericDashboard, { inventarios: inventarios, preRegistros: preRegistros }));
        }
    };
    // Si el usuario es vendedor, mostrar su dashboard
    if (user?.role === 'Vendedor') {
        return (_jsx(VendedorDashboard, { usuario: user, preRegistros: preRegistros, contratos: [] }));
    }
    return (_jsx(_Fragment, { children: _jsxs(Main, { children: [_jsx("div", { className: 'mb-2 flex items-center justify-between space-y-2', children: _jsx("h1", { className: 'text-2xl font-bold tracking-tight', children: user?.role === RoleUsuario.INVENTARIO
                            ? 'Panel de Inventario'
                            : 'Panel de Administración' }) }), _jsx(Tabs, { orientation: 'vertical', value: activeTab, onValueChange: setActiveTab, className: 'space-y-4', children: _jsx(TabsContent, { value: 'overview', className: 'space-y-4 mt-10', children: renderDashboard() }) })] }) }));
}
