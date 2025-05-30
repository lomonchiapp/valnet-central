import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ChevronLeftCircle } from 'lucide-react';
import { RoleUsuario } from 'shared-types';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { AdminTopBar, InventarioTopBar, SacTopBar, VendedorTopBar, } from '@/components/layout/role-topbars';
export function GlobalTopBar() {
    const { user } = useAuthStore();
    const { toggleSidebar } = useSidebar();
    // Contenido específico según el rol
    const renderRoleSpecificContent = () => {
        if (!user)
            return null;
        switch (user.role) {
            case RoleUsuario.INVENTARIO:
                return _jsx(InventarioTopBar, {});
            case RoleUsuario.ADMIN:
                return _jsx(AdminTopBar, {});
            case RoleUsuario.SAC:
                return _jsx(SacTopBar, {});
            case RoleUsuario.VENDEDOR:
                return _jsx(VendedorTopBar, {});
            // Agregar más casos según sea necesario para otros roles
            default:
                return (_jsx(_Fragment, { children: _jsxs("div", { className: 'flex-1 ', children: [_jsx("h2", { className: 'text-xl font-medium', children: "ValNet Central" }), _jsx("p", { className: 'text-sm text-muted-foreground', children: "Sistema de gesti\u00F3n integral" })] }) }));
        }
    };
    return (_jsx("div", { className: 'w-full sticky top-0 flex justify-between items-center rounded-lg p-4 shadow mb-6 bg-[#005BAA]', children: _jsxs("div", { className: 'flex items-center gap-4 w-full', children: [_jsx(Button, { variant: 'ghost', size: 'icon', onClick: toggleSidebar, className: 'hover:bg-accent text-[#005BAA]', children: _jsx(ChevronLeftCircle, { className: 'h-8 w-8 text-white hover:text-[#005BAA]' }) }), renderRoleSpecificContent()] }) }));
}
