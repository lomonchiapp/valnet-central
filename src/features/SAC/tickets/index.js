import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useMemo } from 'react';
import { RefreshCw, Ticket as TicketIcon } from 'lucide-react';
import { useCoordinacionState } from '@/context/global/useCoordinacionState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
export default function Tickets() {
    const { tickets, subscribeToTickets, brigadas } = useCoordinacionState();
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [filterDepartamento, setFilterDepartamento] = useState('');
    const [filterTecnico, setFilterTecnico] = useState('');
    const [filterAsunto, setFilterAsunto] = useState('');
    const [filterRemitente, setFilterRemitente] = useState('');
    const [filterId, setFilterId] = useState('');
    const pageSize = 10;
    // Obtener departamentos y tecnicos únicos para los selects
    const departamentos = useMemo(() => Array.from(new Set(tickets.map((t) => t.dp).filter(Boolean))), [tickets]);
    // Filtro por columna
    const filteredTickets = tickets.filter((ticket) => {
        return ((!filterId || ticket.id.toLowerCase().includes(filterId.toLowerCase())) &&
            (!filterDepartamento || ticket.dp === filterDepartamento) &&
            (!filterRemitente ||
                ticket.solicitante
                    .toLowerCase()
                    .includes(filterRemitente.toLowerCase())) &&
            (!filterAsunto ||
                ticket.asunto.toLowerCase().includes(filterAsunto.toLowerCase())) &&
            (!filterTecnico ||
                (ticket.brigada?.nombre || 'No asignado') === filterTecnico));
    });
    const totalPages = Math.ceil(filteredTickets.length / pageSize);
    const paginatedTickets = filteredTickets.slice((page - 1) * pageSize, page * pageSize);
    useEffect(() => {
        setLoading(true);
        const unsubscribe = subscribeToTickets();
        setLoading(false);
        return () => unsubscribe();
    }, [subscribeToTickets]);
    const formatDate = (dateValue) => {
        if (!dateValue)
            return 'N/A';
        try {
            if (typeof dateValue === 'string' || dateValue instanceof Date) {
                return new Intl.DateTimeFormat('es-DO', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                }).format(new Date(dateValue));
            }
            return 'N/A';
        }
        catch {
            return 'N/A';
        }
    };
    return (_jsxs("div", { className: 'container mx-auto py-8 px-4 md:px-8 lg:px-16', children: [_jsxs("div", { className: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8', children: [_jsxs("div", { className: 'flex items-center gap-3', children: [_jsx(RefreshCw, { className: loading
                                    ? 'animate-spin h-6 w-6 text-primary'
                                    : 'h-6 w-6 text-primary' }), _jsx("h1", { className: 'text-3xl md:text-4xl font-bold tracking-tight', children: "Tickets" })] }), _jsx(Button, { variant: 'default', className: 'h-10 px-6', children: "+ Nuevo" })] }), _jsxs("div", { className: 'bg-white rounded-xl shadow-md p-4 md:p-8', children: [_jsxs("div", { className: 'flex flex-wrap gap-4 mb-4', children: [_jsx(Input, { placeholder: 'Buscar N\u00B0 Ticket...', value: filterId, onChange: (e) => setFilterId(e.target.value), className: 'w-36' }), _jsxs("select", { value: filterDepartamento, onChange: (e) => setFilterDepartamento(e.target.value), className: 'border rounded px-2 py-1 text-sm', children: [_jsx("option", { value: '', children: "Todos los departamentos" }), departamentos.map((dep) => (_jsx("option", { value: dep, children: dep }, dep)))] }), _jsx(Input, { placeholder: 'Buscar remitente...', value: filterRemitente, onChange: (e) => setFilterRemitente(e.target.value), className: 'w-44' }), _jsx(Input, { placeholder: 'Buscar asunto...', value: filterAsunto, onChange: (e) => setFilterAsunto(e.target.value), className: 'w-44' }), _jsxs("select", { value: filterTecnico, onChange: (e) => setFilterTecnico(e.target.value), className: 'border rounded px-2 py-1 text-sm', children: [_jsx("option", { value: '', children: "Todas las brigadas" }), brigadas.map((brig) => (_jsx("option", { value: brig.nombre, children: brig.nombre }, brig.id)))] })] }), _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: 'w-20', children: "N\u00B0" }), _jsx(TableHead, { children: "Departamento" }), _jsx(TableHead, { children: "Remitente" }), _jsx(TableHead, { children: "Asunto" }), _jsx(TableHead, { children: "Brigada" }), _jsx(TableHead, { children: "Fecha" }), _jsx(TableHead, { className: 'text-right', children: "Acciones" })] }) }), _jsx(TableBody, { children: paginatedTickets.map((ticket) => (_jsxs(TableRow, { children: [_jsxs(TableCell, { children: [_jsx(Button, { variant: 'outline', size: 'icon', className: 'mr-2 h-6 w-6 p-0', children: "+" }), _jsx("span", { className: 'font-mono text-xs', children: ticket.id })] }), _jsx(TableCell, { children: _jsx(Badge, { variant: 'secondary', className: 'text-xs px-2 py-1', children: ticket.dp || 'N/A' }) }), _jsx(TableCell, { children: ticket.solicitante }), _jsx(TableCell, { children: ticket.asunto }), _jsx(TableCell, { children: ticket.brigada?.nombre || 'No asignado' }), _jsx(TableCell, { children: formatDate(ticket.fechavisita) }), _jsx(TableCell, { className: 'text-right', children: _jsx(Button, { variant: 'ghost', size: 'icon', title: 'Ver detalles', children: _jsx(TicketIcon, { className: 'h-4 w-4' }) }) })] }, ticket.id))) })] }), totalPages > 1 && (_jsxs("div", { className: 'flex justify-center gap-4 mt-8', children: [_jsx(Button, { variant: 'secondary', disabled: page === 1, onClick: () => setPage((p) => p - 1), children: "Anterior" }), _jsxs("span", { className: 'self-center text-base', children: ["P\u00E1gina ", page, " de ", totalPages] }), _jsx(Button, { variant: 'secondary', disabled: page === totalPages, onClick: () => setPage((p) => p + 1), children: "Siguiente" })] }))] })] }));
}
