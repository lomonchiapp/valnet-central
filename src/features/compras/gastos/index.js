import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Edit, Trash2, Plus, Search, FileDown, FileText } from 'lucide-react';
import { useComprasState } from '@/context/global/useComprasState';
import { useContabilidadState } from '@/context/global/useContabilidadState';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger, } from '@/components/ui/tooltip';
import { FeatureLayout } from '@/components/layout/feature-layout';
import { PagoUnicoForm } from './components/PagoUnicoForm';
import { usePagosUnicos } from './hooks/usePagosUnicos';
export default function Gastos() {
    const { proveedores, subscribeToProveedores } = useComprasState();
    const { cuentas, pagosUnicos, subscribeToPagosUnicos } = useContabilidadState();
    const { deletePago } = usePagosUnicos();
    useEffect(() => {
        const unsubscribeProveedores = subscribeToProveedores();
        const unsubscribePagosUnicos = subscribeToPagosUnicos();
        return () => {
            unsubscribeProveedores();
            unsubscribePagosUnicos();
        };
    }, [subscribeToProveedores, subscribeToPagosUnicos]);
    const [editPago, setEditPago] = useState(null);
    const [search, setSearch] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const handleAddPago = () => {
        setEditPago(null);
        setFormOpen(true);
    };
    const handleEditPago = (pago) => {
        setEditPago(pago);
        setFormOpen(true);
    };
    const handleDeletePago = async (id) => {
        const success = await deletePago(id);
        if (success) {
            // El toast ya se muestra en el hook usePagosUnicos
            console.log('Pago eliminado exitosamente');
        }
    };
    const handleFormSuccess = () => {
        setEditPago(null);
        setFormOpen(false);
    };
    const filtered = pagosUnicos.filter((pago) => pago.descripcion.toLowerCase().includes(search.toLowerCase()) ||
        getProveedorNombre(pago.idproveedor)
            .toLowerCase()
            .includes(search.toLowerCase()));
    const getProveedorNombre = (idproveedor) => {
        const proveedor = proveedores.find((p) => p.id === idproveedor);
        return proveedor?.nombre || 'Proveedor desconocido';
    };
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
        return filtered.reduce((total, pago) => total + pago.monto, 0);
    };
    const actions = (_jsxs("div", { className: 'flex gap-2', children: [_jsxs(Button, { variant: 'outline', size: 'sm', children: [_jsx(FileDown, { className: 'w-4 h-4 mr-2' }), "Exportar Excel"] }), _jsxs(Button, { variant: 'outline', size: 'sm', children: [_jsx(FileText, { className: 'w-4 h-4 mr-2' }), "Exportar PDF"] })] }));
    return (_jsxs(FeatureLayout, { title: 'Gastos / Pagos \u00DAnicos', description: 'Administra los gastos y pagos \u00FAnicos realizados por la empresa.', actions: actions, children: [_jsxs("div", { className: 'flex gap-4 items-center justify-between mb-6', children: [_jsxs("div", { className: 'flex gap-3 items-center', children: [_jsxs("div", { className: 'relative', children: [_jsx(Search, { className: 'w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' }), _jsx(Input, { placeholder: 'Buscar por descripci\u00F3n o proveedor...', value: search, onChange: (e) => setSearch(e.target.value), className: 'pl-10 max-w-sm' })] }), _jsxs("div", { className: 'flex gap-4 items-center text-sm text-gray-600', children: [_jsxs("span", { className: 'bg-blue-50 px-3 py-1 rounded-full', children: [_jsx("strong", { children: filtered.length }), " pagos"] }), _jsxs("span", { className: 'bg-green-50 px-3 py-1 rounded-full', children: ["Total: ", _jsxs("strong", { children: ["$", calcularTotal().toLocaleString()] })] })] })] }), _jsxs(Button, { onClick: handleAddPago, className: 'flex items-center gap-2', children: [_jsx(Plus, { className: 'w-4 h-4' }), "Nuevo Pago/Gasto"] })] }), _jsxs("div", { className: 'border rounded-lg overflow-hidden bg-white shadow-sm', children: [_jsxs(Table, { children: [_jsx(TableHeader, { className: 'bg-gray-50', children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: 'font-semibold', children: "Fecha" }), _jsx(TableHead, { className: 'font-semibold', children: "Proveedor" }), _jsx(TableHead, { className: 'font-semibold', children: "Descripci\u00F3n" }), _jsx(TableHead, { className: 'font-semibold', children: "Cuenta" }), _jsx(TableHead, { className: 'font-semibold text-right', children: "Monto" }), _jsx(TableHead, { className: 'font-semibold text-center', children: "Acciones" })] }) }), _jsx(TableBody, { children: filtered.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, className: 'text-center text-muted-foreground py-12', children: _jsxs("div", { className: 'flex flex-col items-center gap-2', children: [_jsx(FileText, { className: 'w-8 h-8 text-gray-300' }), _jsx("p", { children: "No hay pagos registrados" }), search && (_jsx("p", { className: 'text-xs', children: "Intenta con otros t\u00E9rminos de b\u00FAsqueda" }))] }) }) })) : (filtered.map((pago) => (_jsxs(TableRow, { className: 'hover:bg-gray-50', children: [_jsx(TableCell, { children: _jsx(Badge, { variant: 'outline', className: 'font-mono text-xs', children: formatFecha(pago.fecha) }) }), _jsx(TableCell, { className: 'font-medium', children: getProveedorNombre(pago.idproveedor) }), _jsx(TableCell, { className: 'max-w-xs', children: _jsx("div", { className: 'truncate', title: pago.descripcion, children: pago.descripcion }) }), _jsx(TableCell, { className: 'text-sm text-gray-600', children: getCuentaNombre(pago.idcuenta) }), _jsx(TableCell, { className: 'text-right', children: _jsxs("span", { className: 'font-bold text-lg text-red-600', children: ["$", pago.monto.toLocaleString()] }) }), _jsx(TableCell, { children: _jsxs("div", { className: 'flex gap-1 justify-center', children: [_jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { size: 'icon', variant: 'outline', onClick: () => handleEditPago(pago), className: 'h-8 w-8', children: _jsx(Edit, { className: 'w-3 h-3' }) }) }), _jsx(TooltipContent, { children: "Editar pago" })] }), _jsxs(AlertDialog, { children: [_jsx(AlertDialogTrigger, { asChild: true, children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { size: 'icon', variant: 'destructive', className: 'h-8 w-8', children: _jsx(Trash2, { className: 'w-3 h-3' }) }) }), _jsx(TooltipContent, { children: "Eliminar pago" })] }) }), _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "\u00BFEliminar pago?" }), _jsxs(AlertDialogDescription, { children: ["Esta acci\u00F3n no se puede deshacer. Se eliminar\u00E1 permanentemente el pago de", ' ', _jsx("strong", { children: getProveedorNombre(pago.idproveedor) }), ' ', "por", _jsxs("strong", { children: [" $", pago.monto.toLocaleString()] }), ".", _jsx("br", {}), _jsx("br", {}), _jsx("em", { children: "Nota: Tambi\u00E9n se revertir\u00E1 el movimiento contable asociado." })] })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { children: "Cancelar" }), _jsx(AlertDialogAction, { onClick: () => handleDeletePago(pago.id), className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90', children: "Eliminar" })] })] })] })] }) })] }, pago.id)))) })] }), filtered.length > 0 && (_jsx("div", { className: 'bg-gray-50 px-4 py-3 border-t', children: _jsxs("div", { className: 'flex justify-between items-center text-sm', children: [_jsxs("span", { className: 'text-gray-600', children: ["Mostrando ", filtered.length, " de ", pagosUnicos.length, " pagos"] }), _jsxs("span", { className: 'font-semibold', children: ["Total mostrado:", ' ', _jsxs("span", { className: 'text-red-600', children: ["$", calcularTotal().toLocaleString()] })] })] }) }))] }), _jsx(PagoUnicoForm, { open: formOpen, onOpenChange: setFormOpen, editPago: editPago, onSuccess: handleFormSuccess })] }));
}
