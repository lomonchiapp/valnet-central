import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { NivelVendedor } from '@/types/interfaces/valnet/usuario';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BronzeIcon, SilverIcon, GoldIcon, DiamondIcon, } from '@/components/icons/VendedorNivelIcons';
import { WallNetDashboardWidget } from './SacDashboard';
const niveles = [
    {
        nivel: NivelVendedor.BRONZE,
        min: 1,
        max: 15,
        comision: 20,
        icon: BronzeIcon,
        color: 'from-[#FDE68A] to-[#F59E42]',
    },
    {
        nivel: NivelVendedor.SILVER,
        min: 18,
        max: 25,
        comision: 25,
        icon: SilverIcon,
        color: 'from-[#E5E7EB] to-[#A3A3A3]',
    },
    {
        nivel: NivelVendedor.GOLD,
        min: 28,
        max: 35,
        comision: 30,
        icon: GoldIcon,
        color: 'from-[#FFF9C4] to-[#FFD700]',
    },
    {
        nivel: NivelVendedor.DIAMOND,
        min: 45,
        max: Infinity,
        comision: 40,
        icon: DiamondIcon,
        color: 'from-[#B9F2FF] to-[#5BC0EB]',
    },
];
function getNivelInfo(contratosMes) {
    return (niveles.find((n) => contratosMes >= n.min && contratosMes <= n.max) ||
        niveles[0]);
}
export function VendedorDashboard({ usuario, preRegistros, contratos, }) {
    const nivelInfo = getNivelInfo(usuario.contratosMes || 0);
    const siguienteNivel = niveles[niveles.indexOf(nivelInfo) + 1];
    const progreso = siguienteNivel
        ? Math.min(100, (((usuario.contratosMes || 0) - nivelInfo.min + 1) /
            (siguienteNivel.min - nivelInfo.min)) *
            100)
        : 100;
    const NivelIcon = nivelInfo.icon;
    return (_jsx("div", { className: 'space-y-8 px-4 md:px-8 py-6', children: _jsxs("div", { className: 'grid gap-6 md:grid-cols-3', children: [_jsxs("div", { className: 'flex flex-col gap-6', children: [_jsxs(Card, { className: `bg-gradient-to-br ${nivelInfo.color} shadow-xl border-0 relative overflow-hidden mb-6 min-h-[220px] md:min-h-[260px] flex flex-col justify-between`, children: [_jsx("div", { className: 'absolute right-4 top-4 opacity-30 scale-150', children: _jsx(NivelIcon, { width: 48, height: 48 }) }), _jsxs(CardHeader, { className: 'pb-2', children: [_jsxs("div", { className: 'flex items-center gap-3', children: [_jsx(NivelIcon, { width: 36, height: 36 }), _jsxs("div", { children: [_jsxs(CardTitle, { className: 'text-lg font-bold', children: ["Nivel: ", nivelInfo.nivel] }), _jsxs(CardDescription, { className: 'text-base font-semibold', children: ["Comisi\u00F3n: ", nivelInfo.comision, "%"] })] })] }), siguienteNivel && (_jsxs("div", { className: 'mt-2 text-sm text-gray-700', children: ["Pr\u00F3ximo nivel: ", _jsx("b", { children: siguienteNivel.nivel }), " (", siguienteNivel.min, " contratos)"] }))] }), _jsxs(CardContent, { className: 'pt-0', children: [_jsx(Progress, { value: progreso }), _jsxs("div", { className: 'mt-2 text-sm', children: ["Contratos este mes: ", _jsx("b", { children: usuario.contratosMes || 0 }), siguienteNivel && (_jsxs(_Fragment, { children: [' ', "/ ", siguienteNivel.min, " para ", siguienteNivel.nivel] }))] })] })] }), _jsxs(Card, { className: 'h-full bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-md', children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: 'flex items-center gap-2', children: "\uD83C\uDF81 Bonificaci\u00F3n Extra" }) }), _jsx(CardContent, { children: usuario.bonoExtra ? (_jsx("span", { className: 'text-green-600 font-bold', children: "\u00A1Has recibido el bono extra este mes!" })) : (_jsx("span", { className: 'text-muted-foreground', children: "A\u00FAn no has alcanzado el bono extra." })) })] }), _jsxs(Card, { className: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-0 shadow-md', children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Contratos cerrados recientes" }) }), _jsx(CardContent, { children: contratos && contratos.length > 0 ? (_jsx("ul", { className: 'space-y-1', children: contratos.slice(0, 5).map((c, idx) => (_jsx("li", { className: 'text-sm', children: c.descripcion || c.id }, idx))) })) : (_jsx("span", { className: 'text-muted-foreground', children: "No hay contratos recientes." })) })] })] }), _jsx("div", { className: 'flex flex-col gap-6', children: _jsxs(Card, { className: 'h-full bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-md', children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Pre-registros recientes" }) }), _jsx(CardContent, { children: preRegistros && preRegistros.length > 0 ? (_jsx("ul", { className: 'space-y-1', children: preRegistros.slice(0, 5).map((pr, idx) => (_jsx("li", { className: 'text-sm', children: pr.descripcion || pr.id }, idx))) })) : (_jsx("span", { className: 'text-muted-foreground', children: "No hay pre-registros recientes." })) })] }) }), _jsx("div", { className: 'flex flex-col gap-6', children: _jsx(WallNetDashboardWidget, {}) })] }) }));
}
