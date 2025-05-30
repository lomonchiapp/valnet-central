import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NivelVendedor } from '@/types/interfaces/valnet/usuario';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { BronzeIcon, SilverIcon, GoldIcon, DiamondIcon, } from '@/components/icons/VendedorNivelIcons';
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
    return (_jsxs("div", { className: 'flex-1 flex items-center gap-6', children: [_jsxs("div", { className: 'flex items-center gap-3', children: [_jsx(NivelIcon, { width: 36, height: 36 }), _jsxs("div", { children: [_jsxs("h2", { className: 'text-xl font-bold text-white', children: [user.nombres, " ", user.apellidos] }), _jsxs("div", { className: 'flex items-center gap-2 text-sm text-white/90', children: [_jsxs("span", { className: 'font-semibold', children: ["Nivel: ", nivel] }), _jsxs("span", { className: 'ml-2 px-2 py-0.5 rounded bg-white/20 text-xs font-medium', children: [user.contratosMes || 0, " contratos este mes"] })] })] })] }), _jsx("div", { className: 'flex gap-3 ml-auto', children: _jsx(Button, { style: { backgroundColor: '#F37021', borderColor: '#F37021' }, className: 'hover:bg-orange-500 text-white font-semibold shadow', onClick: () => navigate('/ventas/pre-registros/nuevo'), children: "+ Nueva Venta" }) })] }));
}
