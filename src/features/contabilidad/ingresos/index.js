import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { TipoIngreso } from '@/types/interfaces/contabilidad/ingreso';
import { es } from 'date-fns/locale';
import { Edit, Trash2, Search, FileDown, FileText, TrendingUp, } from 'lucide-react';
import { useContabilidadState } from '@/context/global/useContabilidadState';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger, } from '@/components/ui/tooltip';
import { FeatureLayout } from '@/components/layout/feature-layout';
import { NuevoIngresoForm } from './components/NuevoIngresoForm';
import { useIngresos } from './hooks/useIngresos';
const tipoIngresoLabels = {
    [TipoIngreso.VENTA_SERVICIO]: 'Venta de Servicio',
    [TipoIngreso.VENTA_PRODUCTO]: 'Venta de Producto',
    [TipoIngreso.INTERES]: 'Interés',
    [TipoIngreso.COMISION]: 'Comisión',
    [TipoIngreso.OTRO]: 'Otro',
};
const tipoIngresoBadgeColor = {
    [TipoIngreso.VENTA_SERVICIO]: 'bg-blue-100 text-blue-800',
    [TipoIngreso.VENTA_PRODUCTO]: 'bg-green-100 text-green-800',
    [TipoIngreso.INTERES]: 'bg-yellow-100 text-yellow-800',
    [TipoIngreso.COMISION]: 'bg-purple-100 text-purple-800',
    [TipoIngreso.OTRO]: 'bg-gray-100 text-gray-800',
};
export default function Ingresos() {
    const { cuentas, ingresos, subscribeToIngresos } = useContabilidadState();
    const { deleteIngreso } = useIngresos();
    useEffect(() => {
        const unsubscribeIngresos = subscribeToIngresos();
        return () => {
            unsubscribeIngresos();
        };
    }, [subscribeToIngresos]);
    const [editIngreso, setEditIngreso] = useState(null);
    const [search, setSearch] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const handleAddIngreso = () => {
        setEditIngreso(null);
        setFormOpen(true);
    };
    const handleEditIngreso = (ingreso) => {
        setEditIngreso(ingreso);
        setFormOpen(true);
    };
    const handleDeleteIngreso = async (id) => {
        const success = await deleteIngreso(id);
        if (success) {
            console.log('Ingreso eliminado exitosamente');
        }
    };
    const handleFormSuccess = () => {
        setEditIngreso(null);
        setFormOpen(false);
    };
    const filtered = ingresos.filter((ingreso) => ingreso.descripcion.toLowerCase().includes(search.toLowerCase()) ||
        getCuentaNombre(ingreso.idcuenta)
            .toLowerCase()
            .includes(search.toLowerCase()) ||
        tipoIngresoLabels[ingreso.tipo]
            .toLowerCase()
            .includes(search.toLowerCase()));
    const getCuentaNombre = (idcuenta) => {
        const cuenta = cuentas.find((c) => c.id === idcuenta);
        return cuenta?.nombre || 'Cuenta desconocida';
    };
    const formatFecha = (fecha) => {
        try {
            return format(new Date(fecha), 'dd MMM yyyy', { locale: es });
        }
        catch {
            return fecha;
        }
    };
    const calcularTotal = () => {
        return filtered.reduce((total, ingreso) => total + ingreso.monto, 0);
    };
    const getEstadisticas = () => {
        const totalIngresos = ingresos.length;
        const totalMonto = ingresos.reduce((sum, ingreso) => sum + ingreso.monto, 0);
        const ingresosPorTipo = ingresos.reduce((acc, ingreso) => {
            acc[ingreso.tipo] = (acc[ingreso.tipo] || 0) + 1;
            return acc;
        }, {});
        const tipoMasComun = Object.entries(ingresosPorTipo).reduce((a, b) => ingresosPorTipo[a[0]] >
            ingresosPorTipo[b[0]]
            ? a
            : b)?.[0];
        return {
            totalIngresos,
            totalMonto,
            tipoMasComun: tipoMasComun ? tipoIngresoLabels[tipoMasComun] : 'N/A',
        };
    };
    const stats = getEstadisticas();
    const actions = (_jsxs("div", { className: 'flex gap-2', children: [_jsxs(Button, { variant: 'outline', size: 'sm', children: [_jsx(FileDown, { className: 'w-4 h-4 mr-2' }), "Exportar Excel"] }), _jsxs(Button, { variant: 'outline', size: 'sm', children: [_jsx(FileText, { className: 'w-4 h-4 mr-2' }), "Exportar PDF"] })] }));
    return (_jsxs(FeatureLayout, { title: 'Ingresos', description: 'Registra y gestiona todos los ingresos de la empresa.', actions: actions, children: [_jsxs("div", { className: 'flex gap-4 items-center justify-between mb-6', children: [_jsxs("div", { className: 'flex gap-3 items-center', children: [_jsxs("div", { className: 'relative', children: [_jsx(Search, { className: 'w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' }), _jsx(Input, { placeholder: 'Buscar por descripci\u00F3n, cuenta o tipo...', value: search, onChange: (e) => setSearch(e.target.value), className: 'pl-10 max-w-sm' })] }), _jsxs("div", { className: 'flex gap-4 items-center text-sm text-gray-600', children: [_jsxs("span", { className: 'bg-green-50 px-3 py-1 rounded-full text-green-700', children: [_jsx("strong", { children: filtered.length }), " ingresos"] }), _jsxs("span", { className: 'bg-blue-50 px-3 py-1 rounded-full text-blue-700', children: ["Total: ", _jsxs("strong", { children: ["$", calcularTotal().toLocaleString()] })] }), _jsxs("span", { className: 'bg-purple-50 px-3 py-1 rounded-full text-purple-700', children: ["Tipo com\u00FAn: ", _jsx("strong", { children: stats.tipoMasComun })] })] })] }), _jsxs(Button, { onClick: handleAddIngreso, className: 'flex items-center gap-2 bg-green-600 hover:bg-green-700', children: [_jsx(TrendingUp, { className: 'w-4 h-4' }), "Nuevo Ingreso"] })] }), _jsxs("div", { className: 'border rounded-lg overflow-hidden bg-white shadow-sm', children: [_jsxs(Table, { children: [_jsx(TableHeader, { className: 'bg-green-50', children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: 'font-semibold', children: "Fecha" }), _jsx(TableHead, { className: 'font-semibold', children: "Tipo" }), _jsx(TableHead, { className: 'font-semibold', children: "Descripci\u00F3n" }), _jsx(TableHead, { className: 'font-semibold', children: "Cuenta" }), _jsx(TableHead, { className: 'font-semibold', children: "Referencia" }), _jsx(TableHead, { className: 'font-semibold text-right', children: "Monto" }), _jsx(TableHead, { className: 'font-semibold text-center', children: "Acciones" })] }) }), _jsx(TableBody, { children: filtered.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, className: 'text-center text-muted-foreground py-12', children: _jsxs("div", { className: 'flex flex-col items-center gap-2', children: [_jsx(TrendingUp, { className: 'w-8 h-8 text-gray-300' }), _jsx("p", { children: "No hay ingresos registrados" }), search && (_jsx("p", { className: 'text-xs', children: "Intenta con otros t\u00E9rminos de b\u00FAsqueda" }))] }) }) })) : (filtered.map((ingreso) => (_jsxs(TableRow, { className: 'hover:bg-green-50', children: [_jsx(TableCell, { children: _jsx(Badge, { variant: 'outline', className: 'font-mono text-xs', children: formatFecha(ingreso.fecha) }) }), _jsx(TableCell, { children: _jsx(Badge, { className: tipoIngresoBadgeColor[ingreso.tipo], children: tipoIngresoLabels[ingreso.tipo] }) }), _jsx(TableCell, { className: 'max-w-xs', children: _jsxs("div", { className: 'truncate', title: ingreso.descripcion, children: [_jsx("span", { className: 'font-medium', children: ingreso.descripcion }), ingreso.notas && (_jsx("div", { className: 'text-xs text-gray-500 mt-1', children: ingreso.notas }))] }) }), _jsx(TableCell, { className: 'text-sm text-gray-600', children: getCuentaNombre(ingreso.idcuenta) }), _jsx(TableCell, { className: 'text-sm text-gray-500', children: ingreso.referencia || '-' }), _jsx(TableCell, { className: 'text-right', children: _jsxs("span", { className: 'font-bold text-lg text-green-600', children: ["$", ingreso.monto.toLocaleString()] }) }), _jsx(TableCell, { children: _jsxs("div", { className: 'flex gap-1 justify-center', children: [_jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { size: 'icon', variant: 'outline', onClick: () => handleEditIngreso(ingreso), className: 'h-8 w-8', children: _jsx(Edit, { className: 'w-3 h-3' }) }) }), _jsx(TooltipContent, { children: "Editar ingreso" })] }), _jsxs(AlertDialog, { children: [_jsx(AlertDialogTrigger, { asChild: true, children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { size: 'icon', variant: 'destructive', className: 'h-8 w-8', children: _jsx(Trash2, { className: 'w-3 h-3' }) }) }), _jsx(TooltipContent, { children: "Eliminar ingreso" })] }) }), _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "\u00BFEliminar ingreso?" }), _jsxs(AlertDialogDescription, { children: ["Esta acci\u00F3n no se puede deshacer. Se eliminar\u00E1 permanentemente el ingreso de", ' ', _jsxs("strong", { children: ["\"", ingreso.descripcion, "\""] }), " por", _jsxs("strong", { children: [' ', "$", ingreso.monto.toLocaleString()] }), ".", _jsx("br", {}), _jsx("br", {}), _jsx("em", { children: "Nota: Tambi\u00E9n se revertir\u00E1 el movimiento contable asociado." })] })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { children: "Cancelar" }), _jsx(AlertDialogAction, { onClick: () => handleDeleteIngreso(ingreso.id), className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90', children: "Eliminar" })] })] })] })] }) })] }, ingreso.id)))) })] }), filtered.length > 0 && (_jsx("div", { className: 'bg-green-50 px-4 py-3 border-t', children: _jsxs("div", { className: 'flex justify-between items-center text-sm', children: [_jsxs("span", { className: 'text-gray-600', children: ["Mostrando ", filtered.length, " de ", ingresos.length, " ingresos"] }), _jsxs("span", { className: 'font-semibold', children: ["Total mostrado:", ' ', _jsxs("span", { className: 'text-green-600', children: ["$", calcularTotal().toLocaleString()] })] })] }) }))] }), _jsx(NuevoIngresoForm, { open: formOpen, onOpenChange: setFormOpen, editIngreso: editIngreso, onSuccess: handleFormSuccess })] }));
}
