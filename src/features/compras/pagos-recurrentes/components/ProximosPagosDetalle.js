import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { format, isToday, isTomorrow, addDays, isWithinInterval, startOfDay, endOfDay, } from 'date-fns';
import { TipoMonto, EstadoPagoRecurrente, } from '@/types/interfaces/contabilidad/pagoRecurrente';
import { es } from 'date-fns/locale';
import { Calendar, Clock, DollarSign, AlertCircle, CheckCircle2, Plus, Edit3, } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useActualizarPagoRecurrente } from '../hooks';
export default function ProximosPagosDetalle({ pagosRecurrentes, }) {
    const [montosVariables, setMontosVariables] = useState({});
    const [montoTemporal, setMontoTemporal] = useState(0);
    const [notasTemporal, setNotasTemporal] = useState('');
    const [dialogAbierto, setDialogAbierto] = useState(null);
    const { actualizarPagoRecurrente } = useActualizarPagoRecurrente();
    // Filtrar y ordenar próximos pagos (próximos 30 días)
    const proximosPagos = useMemo(() => {
        const hoy = new Date();
        const en30Dias = addDays(hoy, 30);
        return pagosRecurrentes
            .filter((pago) => pago.estado === EstadoPagoRecurrente.ACTIVO &&
            isWithinInterval(new Date(pago.fechaProximoPago), {
                start: startOfDay(hoy),
                end: endOfDay(en30Dias),
            }))
            .sort((a, b) => new Date(a.fechaProximoPago).getTime() -
            new Date(b.fechaProximoPago).getTime())
            .slice(0, 5); // Mostrar máximo 5 próximos pagos
    }, [pagosRecurrentes]);
    const formatearFecha = (fecha) => {
        const fechaObj = new Date(fecha);
        if (isToday(fechaObj)) {
            return 'Hoy';
        }
        else if (isTomorrow(fechaObj)) {
            return 'Mañana';
        }
        else {
            return format(fechaObj, 'dd MMM', { locale: es });
        }
    };
    const obtenerUrgencia = (fecha) => {
        const fechaObj = new Date(fecha);
        const hoy = new Date();
        const diasRestantes = Math.ceil((fechaObj.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
        if (diasRestantes <= 0)
            return 'vencido';
        if (diasRestantes <= 3)
            return 'urgente';
        if (diasRestantes <= 7)
            return 'proximo';
        return 'normal';
    };
    const obtenerVarianteUrgencia = (urgencia) => {
        switch (urgencia) {
            case 'vencido':
                return 'destructive';
            case 'urgente':
                return 'destructive';
            case 'proximo':
                return 'secondary';
            default:
                return 'outline';
        }
    };
    const obtenerIconoUrgencia = (urgencia) => {
        switch (urgencia) {
            case 'vencido':
                return _jsx(AlertCircle, { className: 'h-4 w-4' });
            case 'urgente':
                return _jsx(Clock, { className: 'h-4 w-4' });
            case 'proximo':
                return _jsx(Calendar, { className: 'h-4 w-4' });
            default:
                return _jsx(CheckCircle2, { className: 'h-4 w-4' });
        }
    };
    const handleGuardarMontoVariable = async (pagoId) => {
        try {
            const nuevoMonto = {
                pagoId,
                monto: montoTemporal,
                notas: notasTemporal,
            };
            setMontosVariables((prev) => ({
                ...prev,
                [pagoId]: nuevoMonto,
            }));
            // Actualizar el pago recurrente en la base de datos
            await actualizarPagoRecurrente(pagoId, {
                monto: montoTemporal,
                notas: notasTemporal,
            });
            // Cerrar dialog y limpiar estado
            setDialogAbierto(null);
            setMontoTemporal(0);
            setNotasTemporal('');
            toast.success('Monto actualizado correctamente');
        }
        catch {
            toast.error('Error al actualizar el monto');
        }
    };
    const iniciarEdicionMonto = (pago) => {
        setMontoTemporal(montosVariables[pago.id]?.monto || pago.monto);
        setNotasTemporal(montosVariables[pago.id]?.notas || pago.notas || '');
        setDialogAbierto(pago.id);
    };
    const cerrarDialog = () => {
        setDialogAbierto(null);
        setMontoTemporal(0);
        setNotasTemporal('');
    };
    const calcularTotalProximosPagos = () => {
        return proximosPagos.reduce((total, pago) => {
            const montoFinal = montosVariables[pago.id]?.monto || pago.monto;
            return total + montoFinal;
        }, 0);
    };
    if (proximosPagos.length === 0) {
        return (_jsx(Card, { className: 'mb-6', children: _jsx(CardContent, { className: 'pt-6', children: _jsxs("div", { className: 'text-center py-8', children: [_jsx(CheckCircle2, { className: 'h-12 w-12 text-green-500 mx-auto mb-4' }), _jsx("h3", { className: 'text-lg font-semibold text-gray-900 mb-2', children: "No hay pagos pr\u00F3ximos" }), _jsx("p", { className: 'text-gray-600', children: "No tienes pagos recurrentes programados para los pr\u00F3ximos 30 d\u00EDas." })] }) }) }));
    }
    return (_jsxs(Card, { className: 'mb-6 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50', children: [_jsx(CardHeader, { className: 'pb-4', children: _jsxs("div", { className: 'flex items-center justify-between', children: [_jsxs("div", { children: [_jsx(CardTitle, { className: 'text-2xl font-bold text-gray-900', children: "Pr\u00F3ximos Pagos" }), _jsx(CardDescription, { className: 'text-gray-600 mt-1', children: "Pagos recurrentes programados para los pr\u00F3ximos 30 d\u00EDas" })] }), _jsxs("div", { className: 'text-right', children: [_jsx("div", { className: 'text-sm text-gray-600', children: "Total estimado" }), _jsxs("div", { className: 'text-2xl font-bold text-indigo-600', children: ["$", calcularTotalProximosPagos().toLocaleString()] })] })] }) }), _jsxs(CardContent, { className: 'space-y-4', children: [proximosPagos.map((pago) => {
                        const urgencia = obtenerUrgencia(pago.fechaProximoPago);
                        const montoFinal = montosVariables[pago.id]?.monto || pago.monto;
                        const esVariable = pago.tipoMonto === TipoMonto.VARIABLE;
                        return (_jsxs("div", { className: 'flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow', children: [_jsxs("div", { className: 'flex items-center space-x-4', children: [_jsx("div", { className: 'flex-shrink-0', children: _jsx("div", { className: `p-2 rounded-full ${urgencia === 'vencido' || urgencia === 'urgente'
                                                    ? 'bg-red-100 text-red-600'
                                                    : urgencia === 'proximo'
                                                        ? 'bg-yellow-100 text-yellow-600'
                                                        : 'bg-green-100 text-green-600'}`, children: obtenerIconoUrgencia(urgencia) }) }), _jsxs("div", { className: 'flex-1 min-w-0', children: [_jsxs("div", { className: 'flex items-center space-x-2 mb-1', children: [_jsx("h4", { className: 'text-sm font-semibold text-gray-900 truncate', children: pago.descripcion }), esVariable && (_jsx(Badge, { variant: 'outline', className: 'text-xs', children: "Variable" }))] }), _jsxs("div", { className: 'flex items-center space-x-4 text-sm text-gray-600', children: [_jsxs("span", { className: 'flex items-center', children: [_jsx(Calendar, { className: 'h-3 w-3 mr-1' }), formatearFecha(pago.fechaProximoPago)] }), _jsxs("span", { className: 'flex items-center', children: [_jsx(Clock, { className: 'h-3 w-3 mr-1' }), pago.frecuencia.toLowerCase()] })] })] })] }), _jsxs("div", { className: 'flex items-center space-x-3', children: [_jsxs("div", { className: 'text-right', children: [_jsxs("div", { className: 'text-lg font-bold text-gray-900', children: ["$", montoFinal.toLocaleString()] }), esVariable && montosVariables[pago.id] && (_jsx("div", { className: 'text-xs text-green-600', children: "Actualizado" }))] }), _jsx(Badge, { variant: obtenerVarianteUrgencia(urgencia), className: 'text-xs', children: urgencia === 'vencido'
                                                ? 'Vencido'
                                                : urgencia === 'urgente'
                                                    ? 'Urgente'
                                                    : urgencia === 'proximo'
                                                        ? 'Próximo'
                                                        : 'Programado' }), esVariable && (_jsxs(Dialog, { open: dialogAbierto === pago.id, onOpenChange: (open) => !open && cerrarDialog(), children: [_jsx(DialogTrigger, { asChild: true, children: _jsx(Button, { variant: 'outline', size: 'sm', onClick: () => iniciarEdicionMonto(pago), className: 'flex items-center space-x-1', children: montosVariables[pago.id] ? (_jsxs(_Fragment, { children: [_jsx(Edit3, { className: 'h-3 w-3' }), _jsx("span", { children: "Editar" })] })) : (_jsxs(_Fragment, { children: [_jsx(Plus, { className: 'h-3 w-3' }), _jsx("span", { children: "Agregar monto" })] })) }) }), _jsxs(DialogContent, { className: 'sm:max-w-md', children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { children: [montosVariables[pago.id] ? 'Editar' : 'Agregar', ' ', "Monto Variable"] }), _jsxs(DialogDescription, { children: ["Define el monto espec\u00EDfico para este per\u00EDodo de pago:", ' ', pago.descripcion] })] }), _jsxs("div", { className: 'space-y-4 py-4', children: [_jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { htmlFor: 'monto', children: "Monto a pagar" }), _jsxs("div", { className: 'relative', children: [_jsx(DollarSign, { className: 'absolute left-3 top-3 h-4 w-4 text-gray-400' }), _jsx(Input, { id: 'monto', type: 'number', value: montoTemporal, onChange: (e) => setMontoTemporal(Number(e.target.value)), className: 'pl-10', placeholder: '0.00' })] })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { htmlFor: 'notas', children: "Notas (opcional)" }), _jsx(Textarea, { id: 'notas', value: notasTemporal, onChange: (e) => setNotasTemporal(e.target.value), placeholder: 'Detalles adicionales sobre este pago...', rows: 3 })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: 'outline', onClick: cerrarDialog, children: "Cancelar" }), _jsx(Button, { onClick: () => handleGuardarMontoVariable(pago.id), disabled: montoTemporal <= 0, children: "Guardar Monto" })] })] })] }))] })] }, pago.id));
                    }), _jsx("div", { className: 'pt-4 border-t border-gray-200', children: _jsxs("div", { className: 'flex justify-between items-center text-sm text-gray-600', children: [_jsxs("span", { children: ["Mostrando ", proximosPagos.length, " pr\u00F3ximos pagos"] }), _jsxs("span", { children: [proximosPagos.filter((p) => obtenerUrgencia(p.fechaProximoPago) === 'urgente').length, ' ', "pagos urgentes"] })] }) })] })] }));
}
