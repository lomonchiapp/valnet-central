import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card';
import MisVentas from './mis-ventas';
export default function Ventas() {
    const navigate = useNavigate();
    return (_jsxs("div", { className: 'container mx-auto py-6 space-y-6', children: [_jsxs("div", { className: 'flex justify-between items-center', children: [_jsxs("div", { children: [_jsx("h1", { className: 'text-3xl font-bold tracking-tight', children: "Portal de Ventas" }), _jsx("p", { className: 'text-muted-foreground', children: "Gestiona tus pre-registros y visualiza el estado de tus ventas" })] }), _jsxs(Button, { onClick: () => navigate('/ventas/pre-registros/nuevo'), className: 'gap-2', children: [_jsx(IconPlus, { size: 16 }), "Nuevo Pre-Registro"] })] }), _jsx("div", { className: 'grid gap-6', children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Mis Ventas" }), _jsx(CardDescription, { children: "Lista de todos tus pre-registros y ventas realizadas" })] }), _jsx(CardContent, { children: _jsx(MisVentas, {}) })] }) })] }));
}
