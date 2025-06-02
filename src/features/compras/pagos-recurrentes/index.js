import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { differenceInDays, isBefore } from 'date-fns';
import { EstadoPagoRecurrente, TipoMonto, } from '@/types/interfaces/contabilidad/pagoRecurrente';
import { es } from 'date-fns/locale';
import { PlusCircle, Trash2, Calendar, AlertTriangle, CheckCircle2, Clock, Edit, DollarSign, } from 'lucide-react';
import { toast } from 'sonner';
import { useComprasState } from '@/context/global/useComprasState';
import { useContabilidadState } from '@/context/global/useContabilidadState';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger, } from '@/components/ui/tooltip';
import NuevoPagoRecurrenteForm from './NuevoPagoRecurrenteForm';
import { useBorrarPagoRecurrente, useProcesarPagoVariable } from './hooks';
export default function PagosRecurrentes() {
    const { pagosRecurrentes, subscribeToPagosRecurrentes, proveedores, subscribeToProveedores, } = useComprasState();
    const { cuentas } = useContabilidadState();
    const { borrarPagoRecurrente } = useBorrarPagoRecurrente();
    const { procesarPagoVariable } = useProcesarPagoVariable();
    const [showNewForm, setShowNewForm] = useState(false);
    const [editPago, setEditPago] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [processingPaymentId, setProcessingPaymentId] = useState(null);
    const [variablePaymentDialog, setVariablePaymentDialog] = useState({
        show: false,
        pago: null,
    });
    const [variableAmount, setVariableAmount] = useState('');
    useEffect(() => {
        const unsubscribePagos = subscribeToPagosRecurrentes();
        const unsubscribeProveedores = subscribeToProveedores();
        return () => {
            unsubscribePagos();
            unsubscribeProveedores();
        };
    }, [subscribeToPagosRecurrentes, subscribeToProveedores]);
    // Calcular estadísticas
    const hoy = new Date();
    const pagosProximos = pagosRecurrentes.filter((pago) => {
        const fechaProximo = new Date(pago.fechaProximoPago);
        const diasRestantes = differenceInDays(fechaProximo, hoy);
        return (diasRestantes >= 0 &&
            diasRestantes <= 7 &&
            pago.estado === EstadoPagoRecurrente.ACTIVO);
    });
    const pagosVencidos = pagosRecurrentes.filter((pago) => {
        const fechaProximo = new Date(pago.fechaProximoPago);
        return (isBefore(fechaProximo, hoy) && pago.estado === EstadoPagoRecurrente.ACTIVO);
    });
    const totalMontoProximos = pagosProximos.reduce((sum, pago) => sum + pago.monto, 0);
    const totalMontoVencidos = pagosVencidos.reduce((sum, pago) => sum + pago.monto, 0);
    const getProveedorNombre = (idproveedor) => {
        return (proveedores.find((p) => p.id === idproveedor)?.nombre || 'Proveedor desconocido');
    };
    const getCuentaNombre = (idcuenta) => {
        return (cuentas.find((c) => c.id === idcuenta)?.nombre || 'Cuenta desconocida');
    };
    const getDiasRestantes = (fechaProximo) => {
        return differenceInDays(new Date(fechaProximo), hoy);
    };
    const getEstadoBadge = (pago) => {
        const diasRestantes = getDiasRestantes(pago.fechaProximoPago);
        if (pago.estado === EstadoPagoRecurrente.INACTIVO) {
            return _jsx(Badge, { variant: 'secondary', children: "Inactivo" });
        }
        if (diasRestantes < 0) {
            return (_jsxs(Badge, { variant: 'destructive', children: ["Vencido (", Math.abs(diasRestantes), "d)"] }));
        }
        if (diasRestantes === 0) {
            return _jsx(Badge, { className: 'bg-orange-500 hover:bg-orange-600', children: "Hoy" });
        }
        if (diasRestantes <= 3) {
            return (_jsxs(Badge, { className: 'bg-yellow-500 hover:bg-yellow-600', children: ["Urgente (", diasRestantes, "d)"] }));
        }
        if (diasRestantes <= 7) {
            return (_jsxs(Badge, { className: 'bg-blue-500 hover:bg-blue-600', children: ["Pr\u00F3ximo (", diasRestantes, "d)"] }));
        }
        return _jsxs(Badge, { variant: 'outline', children: [diasRestantes, " d\u00EDas"] });
    };
    const handleDelete = async (id) => {
        try {
            console.log('handleDelete called with ID:', id);
            console.log('Current pagosRecurrentes length:', pagosRecurrentes.length);
            setDeletingId(id);
            await borrarPagoRecurrente(id);
            console.log('Delete operation completed successfully');
        }
        catch (error) {
            console.error('Error al eliminar pago recurrente:', error);
        }
        finally {
            setDeletingId(null);
        }
    };
    const handleEdit = (pago) => {
        setEditPago(pago);
        setShowNewForm(true);
    };
    const handleFormClose = () => {
        setShowNewForm(false);
        setEditPago(null);
        toast.success('Pago recurrente guardado exitosamente');
    };
    const handleOpenVariablePayment = (pago) => {
        setVariablePaymentDialog({ show: true, pago });
        setVariableAmount(pago.ultimoMonto?.toString() || '');
    };
    const handleProcessVariablePayment = async () => {
        if (!variablePaymentDialog.pago || !variableAmount)
            return;
        const amount = parseFloat(variableAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Ingresa un monto válido');
            return;
        }
        try {
            setProcessingPaymentId(variablePaymentDialog.pago.id);
            await procesarPagoVariable(variablePaymentDialog.pago.id, amount);
            setVariablePaymentDialog({ show: false, pago: null });
            setVariableAmount('');
        }
        catch (error) {
            console.error('Error al procesar pago variable:', error);
        }
        finally {
            setProcessingPaymentId(null);
        }
    };
    const renderAmountCell = (pago) => {
        console.log('renderAmountCell Debug:', {
            id: pago.id,
            tipoMonto: pago.tipoMonto,
            tipoMontoType: typeof pago.tipoMonto,
            isVariable: pago.tipoMonto === TipoMonto.VARIABLE,
            isVariableString: String(pago.tipoMonto) === 'VARIABLE',
            TipoMontoVARIABLE: TipoMonto.VARIABLE,
        });
        const isVariablePayment = String(pago.tipoMonto) === 'VARIABLE' ||
            pago.tipoMonto === TipoMonto.VARIABLE;
        if (isVariablePayment) {
            return (_jsx(TableCell, { className: 'text-right', children: _jsxs("div", { className: 'flex flex-col items-end gap-1', children: [_jsxs(Dialog, { open: variablePaymentDialog.show &&
                                variablePaymentDialog.pago?.id === pago.id, onOpenChange: (open) => {
                                if (!open) {
                                    setVariablePaymentDialog({ show: false, pago: null });
                                    setVariableAmount('');
                                }
                            }, children: [_jsx(DialogTrigger, { asChild: true, children: _jsxs(Button, { variant: 'outline', size: 'sm', className: 'h-8 gap-1 text-blue-600 border-blue-200 hover:bg-blue-50', onClick: () => handleOpenVariablePayment(pago), children: [_jsx(DollarSign, { className: 'w-3 h-3' }), "Variable"] }) }), _jsxs(DialogContent, { children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Procesar Pago Variable" }) }), _jsxs("div", { className: 'space-y-4', children: [_jsxs("div", { children: [_jsx("p", { className: 'text-sm text-gray-600 mb-2', children: _jsx("strong", { children: pago.descripcion }) }), _jsxs("p", { className: 'text-xs text-gray-500', children: ["Proveedor: ", getProveedorNombre(pago.idproveedor)] })] }), _jsxs("div", { children: [_jsx("label", { className: 'block text-sm font-medium mb-2', children: "Monto a pagar" }), _jsx(Input, { type: 'number', value: variableAmount, onChange: (e) => setVariableAmount(e.target.value), placeholder: '0.00', className: 'text-right', step: '0.01', min: '0' })] }), pago.ultimoMonto && (_jsxs("p", { className: 'text-xs text-gray-500', children: ["\u00DAltimo pago: $", pago.ultimoMonto.toLocaleString()] }))] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: 'outline', onClick: () => {
                                                        setVariablePaymentDialog({ show: false, pago: null });
                                                        setVariableAmount('');
                                                    }, disabled: processingPaymentId === pago.id, children: "Cancelar" }), _jsx(Button, { onClick: handleProcessVariablePayment, disabled: processingPaymentId === pago.id || !variableAmount, children: processingPaymentId === pago.id
                                                        ? 'Procesando...'
                                                        : 'Procesar Pago' })] })] })] }), pago.ultimoMonto && (_jsxs("span", { className: 'text-xs text-gray-500', children: ["\u00DAltimo: $", pago.ultimoMonto.toLocaleString()] }))] }) }));
        }
        return (_jsx(TableCell, { className: 'text-right font-mono', children: _jsxs("span", { className: 'font-bold text-lg', children: ["$", pago.monto.toLocaleString()] }) }));
    };
    const sortedPagosRecurrentes = [...pagosRecurrentes].sort((a, b) => {
        // Primero vencidos, luego por días restantes
        const diasA = getDiasRestantes(a.fechaProximoPago);
        const diasB = getDiasRestantes(b.fechaProximoPago);
        if (diasA < 0 && diasB >= 0)
            return -1;
        if (diasA >= 0 && diasB < 0)
            return 1;
        return diasA - diasB;
    });
    return (_jsxs("div", { className: 'space-y-6 max-w-7xl mx-auto', children: [_jsxs("div", { className: 'flex justify-between items-center', children: [_jsxs("div", { children: [_jsx("h1", { className: 'text-3xl font-bold tracking-tight', children: "Pagos Recurrentes" }), _jsx("p", { className: 'text-muted-foreground', children: "Gestiona y monitorea los pagos recurrentes de la empresa" })] }), _jsxs(Button, { onClick: () => setShowNewForm(true), size: 'lg', children: [_jsx(PlusCircle, { className: 'mr-2 h-5 w-5' }), "Nuevo Pago Recurrente"] })] }), _jsxs("div", { className: 'grid grid-cols-1 md:grid-cols-4 gap-6', children: [_jsxs(Card, { className: 'border-red-200 bg-red-50', children: [_jsxs(CardHeader, { className: 'flex flex-row items-center justify-between space-y-0 pb-2', children: [_jsx(CardTitle, { className: 'text-sm font-medium text-red-700', children: "Vencidos" }), _jsx(AlertTriangle, { className: 'h-4 w-4 text-red-600' })] }), _jsxs(CardContent, { children: [_jsx("div", { className: 'text-2xl font-bold text-red-900', children: pagosVencidos.length }), _jsxs("p", { className: 'text-xs text-red-600', children: ["$", totalMontoVencidos.toLocaleString()] })] })] }), _jsxs(Card, { className: 'border-yellow-200 bg-yellow-50', children: [_jsxs(CardHeader, { className: 'flex flex-row items-center justify-between space-y-0 pb-2', children: [_jsx(CardTitle, { className: 'text-sm font-medium text-yellow-700', children: "Pr\u00F3ximos (7 d\u00EDas)" }), _jsx(Clock, { className: 'h-4 w-4 text-yellow-600' })] }), _jsxs(CardContent, { children: [_jsx("div", { className: 'text-2xl font-bold text-yellow-900', children: pagosProximos.length }), _jsxs("p", { className: 'text-xs text-yellow-600', children: ["$", totalMontoProximos.toLocaleString()] })] })] }), _jsxs(Card, { className: 'border-green-200 bg-green-50', children: [_jsxs(CardHeader, { className: 'flex flex-row items-center justify-between space-y-0 pb-2', children: [_jsx(CardTitle, { className: 'text-sm font-medium text-green-700', children: "Activos" }), _jsx(CheckCircle2, { className: 'h-4 w-4 text-green-600' })] }), _jsxs(CardContent, { children: [_jsx("div", { className: 'text-2xl font-bold text-green-900', children: pagosRecurrentes.filter((p) => p.estado === EstadoPagoRecurrente.ACTIVO).length }), _jsx("p", { className: 'text-xs text-green-600', children: "Pagos configurados" })] })] }), _jsxs(Card, { className: 'border-blue-200 bg-blue-50', children: [_jsxs(CardHeader, { className: 'flex flex-row items-center justify-between space-y-0 pb-2', children: [_jsx(CardTitle, { className: 'text-sm font-medium text-blue-700', children: "Total Registrados" }), _jsx(Calendar, { className: 'h-4 w-4 text-blue-600' })] }), _jsxs(CardContent, { children: [_jsx("div", { className: 'text-2xl font-bold text-blue-900', children: pagosRecurrentes.length }), _jsx("p", { className: 'text-xs text-blue-600', children: "Todos los pagos" })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: 'flex items-center gap-2', children: [_jsx(Calendar, { className: 'h-5 w-5' }), "Pagos Recurrentes Registrados"] }), _jsx(CardDescription, { children: "Lista de todos los pagos recurrentes ordenados por prioridad" })] }), _jsx(CardContent, { children: sortedPagosRecurrentes.length === 0 ? (_jsxs("div", { className: 'text-center py-12', children: [_jsx(Calendar, { className: 'mx-auto h-12 w-12 text-gray-400 mb-4' }), _jsx("p", { className: 'text-lg font-medium text-gray-900 mb-2', children: "No hay pagos recurrentes registrados" }), _jsx("p", { className: 'text-gray-500 mb-6', children: "Crea tu primer pago recurrente para empezar a planificar" }), _jsxs(Button, { onClick: () => setShowNewForm(true), children: [_jsx(PlusCircle, { className: 'mr-2 h-4 w-4' }), "Crear Primer Pago"] })] })) : (_jsx("div", { className: 'rounded-md border', children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: 'w-[300px]', children: "Descripci\u00F3n" }), _jsx(TableHead, { children: "Proveedor" }), _jsx(TableHead, { children: "Cuenta" }), _jsx(TableHead, { className: 'text-right', children: "Monto" }), _jsx(TableHead, { children: "Frecuencia" }), _jsx(TableHead, { children: "Pr\u00F3ximo Pago" }), _jsx(TableHead, { children: "Estado" }), _jsx(TableHead, { className: 'text-right', children: "Acciones" })] }) }), _jsx(TableBody, { children: sortedPagosRecurrentes.map((pago) => (_jsxs(TableRow, { className: `
                      ${getDiasRestantes(pago.fechaProximoPago) < 0 ? 'bg-red-50 hover:bg-red-100' : ''}
                      ${getDiasRestantes(pago.fechaProximoPago) === 0 ? 'bg-orange-50 hover:bg-orange-100' : ''}
                      ${getDiasRestantes(pago.fechaProximoPago) > 0 && getDiasRestantes(pago.fechaProximoPago) <= 3 ? 'bg-yellow-50 hover:bg-yellow-100' : ''}
                    `, children: [_jsx(TableCell, { className: 'font-medium', children: _jsxs("div", { children: [_jsx("div", { className: 'font-semibold', children: pago.descripcion }), pago.notas && (_jsx("div", { className: 'text-sm text-gray-500', children: pago.notas }))] }) }), _jsx(TableCell, { children: getProveedorNombre(pago.idproveedor) }), _jsx(TableCell, { className: 'text-sm', children: getCuentaNombre(pago.idcuenta) }), renderAmountCell(pago), _jsx(TableCell, { children: _jsx(Badge, { variant: 'outline', children: pago.frecuencia }) }), _jsx(TableCell, { children: _jsx("div", { className: 'text-sm', children: format(new Date(pago.fechaProximoPago), 'dd MMM yyyy', { locale: es }) }) }), _jsx(TableCell, { children: getEstadoBadge(pago) }), _jsx(TableCell, { children: _jsxs("div", { className: 'flex gap-1 justify-end', children: [_jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { size: 'icon', variant: 'outline', onClick: () => handleEdit(pago), className: 'h-8 w-8', children: _jsx(Edit, { className: 'w-3 h-3' }) }) }), _jsx(TooltipContent, { children: "Editar pago" })] }), _jsxs(AlertDialog, { children: [_jsx(AlertDialogTrigger, { asChild: true, children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { size: 'icon', variant: 'destructive', className: 'h-8 w-8', children: _jsx(Trash2, { className: 'w-3 h-3' }) }) }), _jsx(TooltipContent, { children: "Eliminar pago" })] }) }), _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "\u00BFEliminar pago recurrente?" }), _jsxs(AlertDialogDescription, { children: ["Esta acci\u00F3n eliminar\u00E1 permanentemente el pago recurrente", _jsxs("strong", { children: [" \"", pago.descripcion, "\""] }), " de", _jsxs("strong", { children: [' ', getProveedorNombre(pago.idproveedor)] }), ".", _jsx("br", {}), _jsx("br", {}), "Esta acci\u00F3n no se puede deshacer."] })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { disabled: deletingId === pago.id, children: "Cancelar" }), _jsx(AlertDialogAction, { onClick: () => handleDelete(pago.id), className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90', disabled: deletingId === pago.id, children: deletingId === pago.id
                                                                                            ? 'Eliminando...'
                                                                                            : 'Eliminar' })] })] })] })] }) })] }, pago.id))) })] }) })) })] }), _jsx(Sheet, { open: showNewForm, onOpenChange: setShowNewForm, children: _jsxs(SheetContent, { side: 'top', className: 'max-w-[90%] mx-auto', children: [_jsx(SheetHeader, { children: _jsx(SheetTitle, { children: editPago ? 'Editar pago recurrente' : 'Nuevo pago recurrente' }) }), _jsx(NuevoPagoRecurrenteForm, { onClose: handleFormClose })] }) })] }));
}
