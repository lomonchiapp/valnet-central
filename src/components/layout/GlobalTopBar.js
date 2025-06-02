import { jsx as _jsx } from "react/jsx-runtime";
import { RoleUsuario } from 'shared-types';
import { useAuthStore } from '@/stores/authStore';
import { AdminTopBar, InventarioTopBar, SacTopBar, VendedorTopBar, } from '@/components/layout/role-topbars';
export function GlobalTopBar() {
    const { user } = useAuthStore();
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
        default:
            return null;
    }
}
