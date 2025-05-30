import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { isAfter, isBefore, parseISO } from 'date-fns';
import { database } from '@/firebase';
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip as ChartTooltip, Legend, } from 'chart.js';
import { addDoc, collection, deleteDoc, doc } from 'firebase/firestore';
import { Loader2, AlertTriangle, Download, Edit2, Trash2, Info, } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { useAuthStore } from '@/stores/authStore';
import { useCoordinacionState } from '@/context/global/useCoordinacionState';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from '@/components/ui/tooltip';
import RegistroCombustibleDialog from './RegistroCombustibleDialog';
Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, ChartTooltip, Legend);
function exportToCSV(data, filename) {
    const csvRows = [
        [
            'Fecha',
            'Galones',
            'Precio/galón',
            'Km inicial',
            'Km final',
            'Referencia',
            'Rendimiento',
        ],
        ...data.map((r) => [
            r.fecha,
            String(r.galones),
            String(r.precio_galon),
            String(r.km_inicial),
            String(r.km_final),
            r.referencia,
            r.km_final && r.km_inicial
                ? ((r.km_final - r.km_inicial) / r.galones).toFixed(2)
                : '-',
        ]),
    ];
    const csvContent = csvRows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
export default function CombustiblePanel({ brigada }) {
    const { controlCombustible, subscribeToControlCombustible } = useCoordinacionState();
    const [loading, setLoading] = useState(true);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteMotivo, setDeleteMotivo] = useState('');
    const [registroAEliminar, setRegistroAEliminar] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const { user } = useAuthStore();
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [registroAEditar, setRegistroAEditar] = useState(null);
    useEffect(() => {
        const unsubscribe = subscribeToControlCombustible?.();
        setTimeout(() => setLoading(false), 600);
        return () => unsubscribe && unsubscribe();
    }, [subscribeToControlCombustible]);
    const registros = useMemo(() => {
        let filtered = brigada
            ? controlCombustible.filter((r) => r.idbrigada === brigada.id)
            : [];
        if (dateFrom)
            filtered = filtered.filter((r) => isAfter(parseISO(r.fecha), parseISO(dateFrom)) || r.fecha === dateFrom);
        if (dateTo)
            filtered = filtered.filter((r) => isBefore(parseISO(r.fecha), parseISO(dateTo)) || r.fecha === dateTo);
        return filtered;
    }, [controlCombustible, brigada, dateFrom, dateTo]);
    // Resumen de consumo
    const totalGalones = registros.reduce((acc, r) => acc + (Number(r.galones) || 0), 0);
    const totalKm = registros.reduce((acc, r) => acc + ((Number(r.km_final) || 0) - (Number(r.km_inicial) || 0)), 0);
    const rendimiento = totalGalones > 0 ? (totalKm / totalGalones).toFixed(2) : '-';
    // Datos para gráfica
    const chartData = {
        labels: registros.map((r) => r.fecha),
        datasets: [
            {
                label: 'Galones',
                data: registros.map((r) => r.galones),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59,130,246,0.2)',
                tension: 0.3,
            },
            {
                label: 'Rendimiento (km/galón)',
                data: registros.map((r) => r.km_final && r.km_inicial
                    ? (r.km_final - r.km_inicial) / r.galones
                    : null),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16,185,129,0.2)',
                tension: 0.3,
                yAxisID: 'y1',
            },
        ],
    };
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Consumo de combustible y rendimiento' },
        },
        scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Galones' } },
            y1: {
                beginAtZero: true,
                position: 'right',
                title: { display: true, text: 'Rendimiento (km/galón)' },
                grid: { drawOnChartArea: false },
            },
        },
    };
    const handleDeleteClick = (registro) => {
        setRegistroAEliminar(registro);
        setDeleteDialogOpen(true);
        setDeleteMotivo('');
    };
    const handleDeleteConfirm = async () => {
        if (!registroAEliminar || !user)
            return;
        setDeleting(true);
        // Guardar en colección eliminaciones
        const eliminacion = {
            fecha: new Date().toISOString(),
            usuarioId: user.id,
            usuarioNombre: user.nombres || user.email || 'Usuario',
            motivo: deleteMotivo,
            entidad: 'control_combustible',
            entidadId: registroAEliminar.id,
            datosEliminados: registroAEliminar,
        };
        await addDoc(collection(database, 'eliminaciones'), eliminacion);
        // Eliminar el registro real
        await deleteDoc(doc(database, 'control_combustible', registroAEliminar.id));
        setDeleting(false);
        setDeleteDialogOpen(false);
        setRegistroAEliminar(null);
        setDeleteMotivo('');
    };
    const handleEditClick = (registro) => {
        setRegistroAEditar(registro);
        setEditDialogOpen(true);
    };
    const handleEditClose = () => {
        setEditDialogOpen(false);
        setRegistroAEditar(null);
    };
    if (!brigada)
        return null;
    return (_jsxs("div", { className: 'w-full space-y-6', children: [_jsxs("div", { className: 'flex flex-col md:flex-row md:items-center md:gap-8 gap-2', children: [_jsxs("div", { className: 'flex flex-col items-center', children: [_jsx("span", { className: 'text-xs text-muted-foreground', children: "Total galones" }), _jsx("span", { className: 'font-bold text-lg', children: totalGalones })] }), _jsxs("div", { className: 'flex flex-col items-center', children: [_jsx("span", { className: 'text-xs text-muted-foreground', children: "Total km" }), _jsx("span", { className: 'font-bold text-lg', children: totalKm })] }), _jsxs("div", { className: 'flex flex-col items-center', children: [_jsx("span", { className: 'text-xs text-muted-foreground', children: "Rendimiento (km/gal\u00F3n)" }), _jsx("span", { className: 'font-bold text-lg', children: rendimiento })] }), _jsx("div", { className: 'flex flex-col items-center gap-1', children: _jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { size: 'icon', variant: 'outline', onClick: () => exportToCSV(registros, `combustible_${brigada.nombre}.csv`), title: 'Exportar CSV', children: _jsx(Download, { className: 'w-5 h-5' }) }) }), _jsx(TooltipContent, { children: "Exportar historial a CSV" })] }) }) })] }), _jsxs("div", { className: 'flex flex-col md:flex-row gap-4 items-center mt-2', children: [_jsxs("div", { className: 'flex items-center gap-2', children: [_jsx("span", { className: 'text-xs', children: "Desde" }), _jsx(Input, { type: 'date', value: dateFrom, onChange: (e) => setDateFrom(e.target.value), className: 'h-8 w-32' })] }), _jsxs("div", { className: 'flex items-center gap-2', children: [_jsx("span", { className: 'text-xs', children: "Hasta" }), _jsx(Input, { type: 'date', value: dateTo, onChange: (e) => setDateTo(e.target.value), className: 'h-8 w-32' })] })] }), _jsx("div", { className: 'mt-4', children: _jsx(Line, { data: chartData, options: chartOptions, height: 180 }) }), _jsx("div", { className: 'font-medium text-lg mt-4', children: "Historial de combustible" }), loading ? (_jsxs("div", { className: 'flex flex-col items-center justify-center py-8', children: [_jsx(Loader2, { className: 'h-8 w-8 animate-spin text-primary mb-2' }), _jsx("span", { className: 'text-muted-foreground', children: "Cargando registros..." })] })) : registros.length === 0 ? (_jsxs("div", { className: 'flex flex-col items-center justify-center py-8 text-muted-foreground', children: [_jsx(AlertTriangle, { className: 'h-10 w-10 text-yellow-500 mb-2 opacity-70' }), _jsx("p", { children: "No hay registros de combustible para esta brigada." })] })) : (_jsx("div", { className: 'overflow-x-auto rounded-lg border', children: _jsxs("table", { className: 'min-w-full text-sm', children: [_jsx("thead", { children: _jsxs("tr", { className: 'bg-muted', children: [_jsx("th", { className: 'px-2 py-1 border', children: "Fecha" }), _jsx("th", { className: 'px-2 py-1 border', children: "Galones" }), _jsx("th", { className: 'px-2 py-1 border', children: "Precio/gal\u00F3n" }), _jsx("th", { className: 'px-2 py-1 border', children: "Km inicial" }), _jsx("th", { className: 'px-2 py-1 border', children: "Km final" }), _jsx("th", { className: 'px-2 py-1 border', children: "Referencia" }), _jsx("th", { className: 'px-2 py-1 border', children: "Rendimiento" }), _jsx("th", { className: 'px-2 py-1 border text-center', children: "Acciones" })] }) }), _jsx("tbody", { children: registros.map((r) => (_jsxs("tr", { className: 'hover:bg-accent/40 transition-colors', children: [_jsx("td", { className: 'px-2 py-1 border', children: r.fecha }), _jsx("td", { className: 'px-2 py-1 border', children: r.galones }), _jsx("td", { className: 'px-2 py-1 border', children: r.precio_galon }), _jsx("td", { className: 'px-2 py-1 border', children: r.km_inicial }), _jsx("td", { className: 'px-2 py-1 border', children: r.km_final }), _jsx("td", { className: 'px-2 py-1 border', children: r.referencia }), _jsx("td", { className: 'px-2 py-1 border', children: r.km_final && r.km_inicial
                                            ? ((r.km_final - r.km_inicial) / r.galones).toFixed(2)
                                            : '-' }), _jsxs("td", { className: 'px-2 py-1 border text-center', children: [_jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { size: 'icon', variant: 'ghost', className: 'text-blue-600', onClick: () => handleEditClick(r), children: _jsx(Edit2, { className: 'w-4 h-4' }) }) }), _jsx(TooltipContent, { children: "Editar registro" })] }) }), _jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { size: 'icon', variant: 'ghost', className: 'text-red-600', onClick: () => handleDeleteClick(r), children: _jsx(Trash2, { className: 'w-4 h-4' }) }) }), _jsx(TooltipContent, { children: "Eliminar registro" })] }) }), _jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { size: 'icon', variant: 'ghost', children: _jsx(Info, { className: 'w-4 h-4' }) }) }), _jsx(TooltipContent, { children: "Detalles" })] }) })] })] }, r.id))) })] }) })), _jsx(Dialog, { open: editDialogOpen, onOpenChange: setEditDialogOpen, children: _jsx(DialogContent, { className: 'sm:max-w-[500px]', children: _jsx(RegistroCombustibleDialog, { brigada: brigada, registro: registroAEditar, modo: 'editar', onClose: handleEditClose }) }) }), _jsx(Dialog, { open: deleteDialogOpen, onOpenChange: setDeleteDialogOpen, children: _jsxs(DialogContent, { className: 'max-w-md', children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Eliminar registro de combustible" }), _jsx(DialogDescription, { children: "Por favor, indica el motivo de la eliminaci\u00F3n. Esta acci\u00F3n quedar\u00E1 registrada." })] }), _jsx(Input, { placeholder: 'Motivo de la eliminaci\u00F3n', value: deleteMotivo, onChange: (e) => setDeleteMotivo(e.target.value), disabled: deleting, className: 'mt-2' }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: 'outline', onClick: () => setDeleteDialogOpen(false), disabled: deleting, children: "Cancelar" }), _jsx(Button, { variant: 'destructive', onClick: handleDeleteConfirm, disabled: !deleteMotivo || deleting, children: deleting ? 'Eliminando...' : 'Eliminar' })] })] }) })] }));
}
