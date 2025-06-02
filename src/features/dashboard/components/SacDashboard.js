import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TicketIcon, HandshakeIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, } from '@/components/ui/card';
import WallNetFeed from '@/features/valnet/wallNet/WallNetFeed';
// Mock data para métricas y tickets recientes
const metrics = [
    {
        label: 'Tickets Abiertos',
        value: 12,
        icon: _jsx(TicketIcon, { className: 'h-4 w-4 text-muted-foreground' }),
    },
    {
        label: 'Tickets Cerrados',
        value: 34,
        icon: _jsx(HandshakeIcon, { className: 'h-4 w-4 text-muted-foreground' }),
    },
    {
        label: 'Tickets Urgentes',
        value: 2,
        icon: _jsx(AlertCircle, { className: 'h-4 w-4 text-red-500' }),
    },
];
const recentTickets = [
    {
        id: 1,
        subject: 'Internet lento',
        status: 'Abierto',
        date: '2024-06-01',
        user: 'Juan Pérez',
    },
    {
        id: 2,
        subject: 'Sin servicio',
        status: 'Cerrado',
        date: '2024-05-30',
        user: 'Ana Torres',
    },
    {
        id: 3,
        subject: 'Problema de facturación',
        status: 'Abierto',
        date: '2024-05-29',
        user: 'Carlos Ruiz',
    },
];
function WallNetDashboardWidget() {
    return (_jsxs(Card, { className: 'bg-gradient-to-b from-[#005BAA] to-[#003366]', children: [_jsx(CardHeader, { className: 'flex justify-end items-end mr-2', children: _jsx("img", { src: '/wallnet-white.png', alt: 'WallNet', className: 'w-28' }) }), _jsx(CardContent, { children: _jsx(WallNetFeed, { maxPosts: 5 }) })] }));
}
function SacDashboard() {
    return (_jsx("div", { className: 'space-y-6', children: _jsxs("div", { className: 'grid gap-4 md:grid-cols-7', children: [_jsxs("div", { className: 'md:col-span-5 space-y-6', children: [_jsx("div", { className: 'grid gap-4 md:grid-cols-3', children: metrics.map((m) => (_jsxs(Card, { children: [_jsxs(CardHeader, { className: 'flex flex-row items-center justify-between pb-2 space-y-0', children: [_jsx(CardTitle, { className: 'text-sm font-medium', children: m.label }), m.icon] }), _jsx(CardContent, { children: _jsx("div", { className: 'text-2xl font-bold', children: m.value }) })] }, m.label))) }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Tickets Recientes" }), _jsx(CardDescription, { children: "\u00DAltimos tickets atendidos o abiertos" })] }), _jsx(CardContent, { children: _jsx("div", { className: 'space-y-2', children: recentTickets.map((ticket) => (_jsxs("div", { className: 'flex justify-between items-center p-2 border-b', children: [_jsxs("div", { children: [_jsx("p", { className: 'font-medium', children: ticket.subject }), _jsx("p", { className: 'text-xs text-muted-foreground', children: ticket.user })] }), _jsxs("div", { className: 'text-right', children: [_jsx("span", { className: `text-xs font-semibold ${ticket.status === 'Abierto' ? 'text-green-600' : 'text-gray-500'}`, children: ticket.status }), _jsx("p", { className: 'text-xs text-muted-foreground', children: ticket.date })] })] }, ticket.id))) }) }), _jsx(CardFooter, { children: _jsx(Button, { variant: 'ghost', className: 'w-full', children: "Ver todos los tickets" }) })] })] }), _jsx("div", { className: 'md:col-span-2', children: _jsx(WallNetDashboardWidget, {}) })] }) }));
}
export { SacDashboard, WallNetDashboardWidget };
export default SacDashboard;
