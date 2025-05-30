import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams } from 'react-router-dom';
import { useCoordinacionState } from '@/context/global/useCoordinacionState';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, } from '@/components/ui/card';
export default function TicketDetail() {
    const { id } = useParams();
    const { tickets } = useCoordinacionState();
    const ticket = tickets.find((ticket) => ticket.id === id);
    if (!ticket)
        return _jsx("div", { children: "No se encontr\u00F3 el ticket." });
    return (_jsxs(Card, { className: 'max-w-xl mx-auto mt-8 shadow-lg', children: [_jsxs(CardHeader, { className: 'flex flex-row items-center gap-4', children: [_jsx(Avatar, { className: 'bg-primary/10 text-primary font-bold uppercase', children: ticket.solicitante?.[0] || '?' }), _jsxs("div", { children: [_jsx(CardTitle, { className: 'text-2xl font-bold', children: ticket.asunto }), _jsxs(CardDescription, { className: 'text-sm text-muted-foreground', children: ["ID: ", ticket.id] })] })] }), _jsxs(CardContent, { className: 'space-y-2', children: [_jsxs("div", { children: [_jsx("span", { className: 'font-medium', children: "Estado:" }), " ", ticket.estado] }), _jsxs("div", { children: [_jsx("span", { className: 'font-medium', children: "Prioridad:" }), " ", ticket.prioridad] }), _jsxs("div", { children: [_jsx("span", { className: 'font-medium', children: "Solicitante:" }), " ", ticket.solicitante] }), _jsxs("div", { children: [_jsx("span", { className: 'font-medium', children: "Fecha:" }), ' ', ticket.fecha ? new Date(ticket.fecha).toLocaleDateString() : ''] }), _jsxs("div", { children: [_jsx("span", { className: 'font-medium', children: "Motivo de cierre:" }), ' ', ticket.motivo_cierre || 'N/A'] }), _jsxs("div", { children: [_jsx("span", { className: 'font-medium', children: "Turno:" }), " ", ticket.turno] }), _jsxs("div", { children: [_jsx("span", { className: 'font-medium', children: "Departamento:" }), " ", ticket.dp] })] })] }));
}
