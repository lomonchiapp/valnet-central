import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NivelVendedor } from '@/types/interfaces/valnet/usuario';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { BronzeIcon, SilverIcon, GoldIcon, DiamondIcon, } from '@/components/icons/VendedorNivelIcons';
import { UserMenu } from '@/components/layout/UserMenu';
import { NotificacionesDropdown } from '@/features/notificaciones/components/NotificacionesDropdown';
const nivelIcons = {
    [NivelVendedor.BRONZE]: BronzeIcon,
    [NivelVendedor.SILVER]: SilverIcon,
    [NivelVendedor.GOLD]: GoldIcon,
    [NivelVendedor.DIAMOND]: DiamondIcon,
};
export function VendedorTopBar() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    if (!user)
        return null;
    const nivel = user.nivelVendedor || NivelVendedor.BRONZE;
    const NivelIcon = nivelIcons[nivel];
    return (_jsxs("header", { className: 'flex w-full items-center h-20 bg-[#005BAA] shadow z-50 px-6', children: [_jsx("div", { className: 'flex items-center min-w-[160px]', children: _jsx("img", { src: '/valdesk-white.png', alt: 'logo', className: 'w-36 h-auto' }) }), _jsxs("div", { className: 'flex items-center gap-3 min-w-[260px] ml-4', children: [_jsx(NivelIcon, { width: 36, height: 36 }), _jsxs("div", { children: [_jsxs("h2", { className: 'text-xl font-bold text-white', children: [user.nombres, " ", user.apellidos] }), _jsxs("div", { className: 'flex items-center gap-2 text-sm text-white/90', children: [_jsxs("span", { className: 'font-semibold', children: ["Nivel: ", nivel] }), _jsxs("span", { className: 'ml-2 px-2 py-0.5 rounded bg-white/20 text-xs font-medium', children: [user.contratosMes || 0, " contratos este mes"] })] })] })] }), _jsx("div", { className: 'flex-1 flex justify-center px-6', children: _jsxs("div", { className: 'w-full max-w-xl flex items-center bg-gray-100 rounded-md px-4 py-2', children: [_jsx(Search, { className: 'h-5 w-5 text-gray-400 mr-2' }), _jsx("input", { type: 'text', placeholder: 'Buscar', className: 'bg-transparent outline-none border-none w-full text-gray-700 placeholder-gray-400', disabled: true })] }) }), _jsxs("div", { className: 'flex items-center pr-6 gap-3 min-w-[260px] justify-end', children: [_jsx(NotificacionesDropdown, {}), _jsx(Button, { style: {
                            backgroundColor: '#F37021',
                            borderColor: '#F37021',
                            marginRight: '10px',
                        }, className: 'hover:bg-orange-500 text-white font-semibold shadow', onClick: () => navigate('/ventas/pre-registros/nuevo'), children: "+" }), _jsx(UserMenu, {})] })] }));
}
