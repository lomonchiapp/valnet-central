import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { TipoCuentaContable, } from '@/types/interfaces/contabilidad/cuenta';
import { ChevronDown, Pencil, Trash2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, AlertCircle, CheckCircle2, AlertTriangle, History, Clock, DollarSign, } from 'lucide-react';
import { useContabilidadState } from '@/context/global/useContabilidadState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger, } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { useMovimientosCuenta } from '@/features/compras/gastos/hooks/useMovimientosCuenta';
import { useObtenerPagosVariablesPendientes } from '@/features/compras/pagos-recurrentes/hooks';
import { HistorialMovimientos } from '@/features/contabilidad/movimientos/HistorialMovimientos';
import { NuevaCuentaContable } from './NuevaCuentaContable';
import { useBorrarCuenta } from './hooks';
const tipoLabels = {
    [TipoCuentaContable.ACTIVO]: 'Activos',
    [TipoCuentaContable.PASIVO]: 'Pasivos',
    [TipoCuentaContable.INGRESO]: 'Ingresos',
    [TipoCuentaContable.EGRESOS]: 'Egresos',
};
const tipoColors = {
    [TipoCuentaContable.ACTIVO]: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
    },
    [TipoCuentaContable.PASIVO]: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
    },
    [TipoCuentaContable.INGRESO]: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
    },
    [TipoCuentaContable.EGRESOS]: {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
    },
};
export default function Cuentas() {
    const { cuentas, subscribeToCuentas } = useContabilidadState();
    const { borrarCuenta } = useBorrarCuenta();
    const { movimientosPorCuenta } = useMovimientosCuenta();
    const { obtenerPagosVariablesPendientes } = useObtenerPagosVariablesPendientes();
    const [editCuenta, setEditCuenta] = useState(null);
    const [cuentaHistorial, setCuentaHistorial] = useState(null);
    const [showHistorial, setShowHistorial] = useState(false);
    const [pagosVariablesPendientes, setPagosVariablesPendientes] = useState([]);
    const [openSections, setOpenSections] = useState({
        [TipoCuentaContable.ACTIVO]: true,
        [TipoCuentaContable.PASIVO]: true,
        [TipoCuentaContable.INGRESO]: true,
        [TipoCuentaContable.EGRESOS]: true,
    });
    useEffect(() => {
        const unsubscribe = subscribeToCuentas();
        return () => unsubscribe();
    }, [subscribeToCuentas]);
    useEffect(() => {
        const cargarPagosVariablesPendientes = async () => {
            try {
                const pagos = await obtenerPagosVariablesPendientes();
                setPagosVariablesPendientes(pagos);
            }
            catch (error) {
                console.error('Error al cargar pagos variables pendientes:', error);
            }
        };
        cargarPagosVariablesPendientes();
        // Recargar cada 5 minutos
        const interval = setInterval(cargarPagosVariablesPendientes, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [obtenerPagosVariablesPendientes]);
    // Filtrar solo cuentas principales (sin parentId)
    const principales = cuentas.filter((c) => !c.parentId);
    // Subcuentas de una cuenta
    const getSubcuentas = (id) => cuentas.filter((c) => c.parentId === id);
    // Obtener cantidad de movimientos de una cuenta
    const getMovimientosCount = (idcuenta) => {
        return movimientosPorCuenta(idcuenta).length;
    };
    const handleEdit = (cuenta) => {
        setEditCuenta(cuenta);
    };
    const handleDelete = async (id) => {
        try {
            await borrarCuenta(id);
        }
        catch (error) {
            console.error('Error al eliminar la cuenta:', error);
        }
    };
    const handleShowHistorial = (cuenta) => {
        setCuentaHistorial(cuenta);
        setShowHistorial(true);
    };
    const handleCloseHistorial = () => {
        setShowHistorial(false);
        setCuentaHistorial(null);
    };
    // Agrupar cuentas por tipo
    const cuentasPorTipo = Object.values(TipoCuentaContable).reduce((acc, tipo) => {
        acc[tipo] = principales.filter((c) => c.tipo === tipo);
        return acc;
    }, {});
    // Calcular balance total por tipo
    const balancePorTipo = Object.values(TipoCuentaContable).reduce((acc, tipo) => {
        const cuentasDelTipo = cuentasPorTipo[tipo];
        acc[tipo] = cuentasDelTipo.reduce((total, cuenta) => {
            const subcuentas = getSubcuentas(cuenta.id);
            const balanceSubcuentas = subcuentas.reduce((sum, sub) => sum + sub.balance, 0);
            return total + cuenta.balance + balanceSubcuentas;
        }, 0);
        return acc;
    }, {});
    const toggleSection = (tipo) => {
        setOpenSections((prev) => ({
            ...prev,
            [tipo]: !prev[tipo],
        }));
    };
    // Calcular balance general
    const balanceGeneral = balancePorTipo[TipoCuentaContable.ACTIVO] -
        balancePorTipo[TipoCuentaContable.PASIVO] +
        balancePorTipo[TipoCuentaContable.INGRESO] -
        balancePorTipo[TipoCuentaContable.EGRESOS];
    // Función para determinar el estado financiero
    const getEstadoFinanciero = (balance) => {
        if (balance > 1000000) {
            return {
                mensaje: '¡Excelente salud financiera!',
                icono: _jsx(CheckCircle2, { className: 'h-5 w-5 text-green-500' }),
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
            };
        }
        else if (balance > 0) {
            return {
                mensaje: 'Salud financiera positiva',
                icono: _jsx(TrendingUp, { className: 'h-5 w-5 text-green-500' }),
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
            };
        }
        else if (balance > -100000) {
            return {
                mensaje: 'Atención: Balance negativo',
                icono: _jsx(AlertCircle, { className: 'h-5 w-5 text-orange-500' }),
                color: 'text-orange-600',
                bgColor: 'bg-orange-50',
                borderColor: 'border-orange-200',
            };
        }
        else {
            return {
                mensaje: '¡Alerta! Balance crítico',
                icono: _jsx(AlertTriangle, { className: 'h-5 w-5 text-red-500' }),
                color: 'text-red-600',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
            };
        }
    };
    const estadoFinanciero = getEstadoFinanciero(balanceGeneral);
    // Función para obtener pagos pendientes por cuenta
    const getPagosPendientesPorCuenta = (idcuenta) => {
        return pagosVariablesPendientes.filter((pago) => pago.idcuenta === idcuenta);
    };
    return (_jsxs("div", { className: 'space-y-6 pb-24 relative', children: [_jsxs("div", { className: 'flex items-center justify-between', children: [_jsxs("div", { children: [_jsx("h1", { className: 'text-3xl font-bold', children: "Cat\u00E1logo de cuentas" }), _jsx("p", { className: 'text-muted-foreground', children: "Configura y personaliza las cuentas contables que hacen parte de tu cat\u00E1logo." })] }), _jsx(NuevaCuentaContable, { cuentas: cuentas, onSuccess: () => setEditCuenta(null), editCuenta: editCuenta })] }), _jsxs("div", { className: 'grid grid-cols-1 md:grid-cols-4 gap-4', children: [_jsxs("div", { className: 'bg-blue-50 border border-blue-200 rounded-lg p-4', children: [_jsxs("div", { className: 'flex items-center gap-2', children: [_jsx(History, { className: 'h-5 w-5 text-blue-600' }), _jsx("span", { className: 'text-sm font-medium text-blue-700', children: "Movimientos Totales" })] }), _jsx("p", { className: 'text-2xl font-bold text-blue-900 mt-1', children: Object.values(TipoCuentaContable).reduce((total, tipo) => total +
                                    cuentasPorTipo[tipo].reduce((sum, cuenta) => sum +
                                        getMovimientosCount(cuenta.id) +
                                        getSubcuentas(cuenta.id).reduce((subSum, sub) => subSum + getMovimientosCount(sub.id), 0), 0), 0) })] }), _jsxs("div", { className: 'bg-green-50 border border-green-200 rounded-lg p-4', children: [_jsxs("div", { className: 'flex items-center gap-2', children: [_jsx(CheckCircle2, { className: 'h-5 w-5 text-green-600' }), _jsx("span", { className: 'text-sm font-medium text-green-700', children: "Cuentas Activas" })] }), _jsx("p", { className: 'text-2xl font-bold text-green-900 mt-1', children: cuentas.filter((cuenta) => getMovimientosCount(cuenta.id) > 0)
                                    .length })] }), _jsxs("div", { className: 'bg-orange-50 border border-orange-200 rounded-lg p-4', children: [_jsxs("div", { className: 'flex items-center gap-2', children: [_jsx(AlertCircle, { className: 'h-5 w-5 text-orange-600' }), _jsx("span", { className: 'text-sm font-medium text-orange-700', children: "Total Cuentas" })] }), _jsx("p", { className: 'text-2xl font-bold text-orange-900 mt-1', children: cuentas.length })] }), _jsxs("div", { className: 'bg-purple-50 border border-purple-200 rounded-lg p-4', children: [_jsxs("div", { className: 'flex items-center gap-2', children: [_jsx(TrendingUp, { className: 'h-5 w-5 text-purple-600' }), _jsx("span", { className: 'text-sm font-medium text-purple-700', children: "Cuenta M\u00E1s Activa" })] }), _jsx("p", { className: 'text-sm font-bold text-purple-900 mt-1', children: (() => {
                                    const cuentaMasActiva = cuentas.reduce((max, cuenta) => getMovimientosCount(cuenta.id) > getMovimientosCount(max.id)
                                        ? cuenta
                                        : max, cuentas[0] || { id: '', nombre: 'N/A' });
                                    return cuentaMasActiva.nombre.length > 15
                                        ? cuentaMasActiva.nombre.substring(0, 15) + '...'
                                        : cuentaMasActiva.nombre;
                                })() })] })] }), pagosVariablesPendientes.length > 0 && (_jsxs("div", { className: 'bg-orange-50 border border-orange-200 rounded-lg p-6', children: [_jsxs("div", { className: 'flex items-center justify-between mb-4', children: [_jsxs("div", { className: 'flex items-center gap-2', children: [_jsx(Clock, { className: 'h-5 w-5 text-orange-600' }), _jsx("h3", { className: 'text-lg font-semibold text-orange-800', children: "D\u00E9bitos en Progreso" }), _jsxs(Badge, { variant: 'secondary', className: 'bg-orange-100 text-orange-700', children: [pagosVariablesPendientes.length, " pendientes"] })] }), _jsx("p", { className: 'text-sm text-orange-600', children: "Pagos recurrentes variables que requieren procesamiento" })] }), _jsx("div", { className: 'grid gap-3', children: pagosVariablesPendientes.map((pago) => {
                            const cuenta = cuentas.find((c) => c.id === pago.idcuenta);
                            const diasVencido = Math.floor((new Date().getTime() -
                                new Date(pago.fechaProximoPago).getTime()) /
                                (1000 * 60 * 60 * 24));
                            return (_jsxs("div", { className: 'bg-white border border-orange-200 rounded-lg p-4 flex items-center justify-between', children: [_jsxs("div", { className: 'flex items-center gap-3', children: [_jsx("div", { className: 'p-2 bg-orange-100 rounded-full', children: _jsx(DollarSign, { className: 'h-4 w-4 text-orange-600' }) }), _jsxs("div", { children: [_jsx("h4", { className: 'font-medium text-gray-900', children: pago.descripcion }), _jsxs("div", { className: 'flex items-center gap-2 text-sm text-gray-500', children: [_jsxs("span", { children: ["Cuenta: ", cuenta?.nombre] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Frecuencia: ", pago.frecuencia] })] })] })] }), _jsxs("div", { className: 'flex items-center gap-4', children: [_jsxs("div", { className: 'text-right', children: [pago.ultimoMonto && (_jsxs("p", { className: 'text-xs text-gray-500', children: ["\u00DAltimo: $", pago.ultimoMonto.toLocaleString()] })), _jsx(Badge, { variant: diasVencido > 0 ? 'destructive' : 'outline', className: diasVencido > 0
                                                            ? ''
                                                            : 'border-yellow-300 text-yellow-700', children: diasVencido > 0
                                                            ? `Vencido ${diasVencido}d`
                                                            : 'Vence hoy' })] }), _jsxs(Button, { size: 'sm', variant: 'outline', className: 'text-orange-600 border-orange-300 hover:bg-orange-50', onClick: () => {
                                                    // Redirigir a la página de pagos recurrentes
                                                    window.location.href = '/compras/pagos-recurrentes';
                                                }, children: [_jsx(DollarSign, { className: 'w-3 h-3 mr-1' }), "Procesar"] })] })] }, pago.id));
                        }) })] })), _jsx("div", { className: 'space-y-4', children: Object.values(TipoCuentaContable).map((tipo) => (_jsxs(Collapsible, { open: openSections[tipo], onOpenChange: () => toggleSection(tipo), className: `border rounded-lg ${tipoColors[tipo].border}`, children: [_jsxs(CollapsibleTrigger, { className: `flex w-full items-center justify-between p-4 text-lg font-semibold ${tipoColors[tipo].bg}`, children: [_jsxs("div", { className: 'flex items-center gap-4', children: [_jsx("span", { className: tipoColors[tipo].text, children: tipoLabels[tipo] }), _jsxs("span", { className: `text-sm font-medium ${tipo === TipoCuentaContable.ACTIVO ||
                                                tipo === TipoCuentaContable.INGRESO
                                                ? 'text-green-600'
                                                : 'text-red-600'}`, children: ["$", balancePorTipo[tipo].toLocaleString()] })] }), _jsx(ChevronDown, { className: `h-4 w-4 transition-transform ${openSections[tipo] ? 'rotate-180' : ''}` })] }), _jsx(CollapsibleContent, { className: 'p-4', children: _jsxs("div", { className: 'grid gap-4', children: [cuentasPorTipo[tipo].map((cuenta) => (_jsxs("div", { className: `rounded-lg border ${tipoColors[tipo].border} overflow-hidden`, children: [_jsx("div", { className: `p-4 ${tipoColors[tipo].bg}`, children: _jsxs("div", { className: 'flex items-center justify-between', children: [_jsxs("div", { children: [_jsx("h4", { className: `font-semibold ${tipoColors[tipo].text}`, children: cuenta.nombre }), _jsx("p", { className: 'text-sm text-muted-foreground mt-1', children: cuenta.descripcion })] }), _jsxs("div", { className: 'flex items-center gap-4', children: [_jsxs("div", { className: 'text-right', children: [_jsxs("div", { className: 'flex items-center gap-2 justify-end mb-1', children: [_jsx("p", { className: 'text-sm text-muted-foreground', children: "Balance" }), getMovimientosCount(cuenta.id) > 0 && (_jsxs("span", { className: 'px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full', children: [getMovimientosCount(cuenta.id), " mov."] })), getPagosPendientesPorCuenta(cuenta.id).length >
                                                                                    0 && (_jsxs("span", { className: 'px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full', children: [getPagosPendientesPorCuenta(cuenta.id)
                                                                                            .length, ' ', "pendientes"] }))] }), _jsxs("p", { className: `text-lg font-semibold ${cuenta.balance >= 0
                                                                                ? 'text-green-600'
                                                                                : 'text-red-600'}`, children: ["$", cuenta.balance.toLocaleString()] })] }), _jsxs("div", { className: 'flex gap-2', children: [_jsx(Button, { size: 'icon', variant: 'ghost', onClick: () => handleShowHistorial(cuenta), className: 'hover:bg-blue-50 hover:text-blue-600', title: 'Ver historial de movimientos', children: _jsx(History, { className: 'h-4 w-4' }) }), _jsx(Button, { size: 'icon', variant: 'ghost', onClick: () => handleEdit(cuenta), className: 'hover:bg-white/50', children: _jsx(Pencil, { className: 'h-4 w-4' }) }), _jsx(Button, { size: 'icon', variant: 'ghost', onClick: () => handleDelete(cuenta.id), className: 'hover:bg-red-50 hover:text-red-600', children: _jsx(Trash2, { className: 'h-4 w-4' }) })] })] })] }) }), getSubcuentas(cuenta.id).length > 0 && (_jsx("div", { className: 'border-t border-gray-100', children: getSubcuentas(cuenta.id).map((sub) => (_jsx("div", { className: 'p-4 hover:bg-gray-50 transition-colors', children: _jsxs("div", { className: 'flex items-center justify-between', children: [_jsxs("div", { className: 'flex items-center gap-2', children: [_jsx("div", { className: `w-1 h-1 rounded-full ${tipoColors[tipo].bg}` }), _jsxs("div", { children: [_jsx("h4", { className: 'font-medium', children: sub.nombre }), _jsx("p", { className: 'text-sm text-muted-foreground', children: sub.descripcion })] })] }), _jsxs("div", { className: 'flex items-center gap-4', children: [_jsxs("div", { className: 'text-right', children: [_jsxs("div", { className: 'flex items-center gap-2 justify-end mb-1', children: [_jsx("p", { className: 'text-sm text-muted-foreground', children: "Balance" }), getMovimientosCount(sub.id) > 0 && (_jsxs("span", { className: 'px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full', children: [getMovimientosCount(sub.id), " mov."] })), getPagosPendientesPorCuenta(sub.id)
                                                                                        .length > 0 && (_jsxs("span", { className: 'px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full', children: [getPagosPendientesPorCuenta(sub.id)
                                                                                                .length, ' ', "pendientes"] }))] }), _jsxs("p", { className: `text-base font-medium ${sub.balance >= 0
                                                                                    ? 'text-green-600'
                                                                                    : 'text-red-600'}`, children: ["$", sub.balance.toLocaleString()] })] }), _jsxs("div", { className: 'flex gap-2', children: [_jsx(Button, { size: 'icon', variant: 'ghost', onClick: () => handleShowHistorial(sub), className: 'hover:bg-blue-50 hover:text-blue-600', title: 'Ver historial de movimientos', children: _jsx(History, { className: 'h-4 w-4' }) }), _jsx(Button, { size: 'icon', variant: 'ghost', onClick: () => handleEdit(sub), className: 'hover:bg-white/50', children: _jsx(Pencil, { className: 'h-4 w-4' }) }), _jsx(Button, { size: 'icon', variant: 'ghost', onClick: () => handleDelete(sub.id), className: 'hover:bg-red-50 hover:text-red-600', children: _jsx(Trash2, { className: 'h-4 w-4' }) })] })] })] }) }, sub.id))) }))] }, cuenta.id))), cuentasPorTipo[tipo].length === 0 && (_jsx("div", { className: `p-8 text-center rounded-lg border-2 border-dashed ${tipoColors[tipo].border}`, children: _jsx("p", { className: 'text-muted-foreground', children: "No hay cuentas en esta categor\u00EDa" }) }))] }) })] }, tipo))) }), _jsx("div", { className: 'fixed bottom-0 right-0 bg-white border-t shadow-lg', style: { width: 'calc(100% - 240px)' }, children: _jsx("div", { className: 'px-6 py-3', children: _jsxs("div", { className: 'flex items-center justify-between', children: [_jsxs("div", { className: 'flex items-center gap-8', children: [_jsxs("div", { className: 'flex items-center gap-2', children: [_jsx("div", { className: 'p-2 rounded-full bg-green-50', children: _jsx(TrendingUp, { className: 'h-5 w-5 text-green-600' }) }), _jsxs("div", { children: [_jsx("p", { className: 'text-sm text-muted-foreground', children: "Activos" }), _jsxs("p", { className: 'text-lg font-semibold text-green-600', children: ["$", balancePorTipo[TipoCuentaContable.ACTIVO].toLocaleString()] })] })] }), _jsxs("div", { className: 'flex items-center gap-2', children: [_jsx("div", { className: 'p-2 rounded-full bg-red-50', children: _jsx(TrendingDown, { className: 'h-5 w-5 text-red-600' }) }), _jsxs("div", { children: [_jsx("p", { className: 'text-sm text-muted-foreground', children: "Pasivos" }), _jsxs("p", { className: 'text-lg font-semibold text-red-600', children: ["$", balancePorTipo[TipoCuentaContable.PASIVO].toLocaleString()] })] })] }), _jsxs("div", { className: 'flex items-center gap-2', children: [_jsx("div", { className: 'p-2 rounded-full bg-blue-50', children: _jsx(ArrowUpRight, { className: 'h-5 w-5 text-blue-600' }) }), _jsxs("div", { children: [_jsx("p", { className: 'text-sm text-muted-foreground', children: "Ingresos" }), _jsxs("p", { className: 'text-lg font-semibold text-blue-600', children: ["$", balancePorTipo[TipoCuentaContable.INGRESO].toLocaleString()] })] })] }), _jsxs("div", { className: 'flex items-center gap-2', children: [_jsx("div", { className: 'p-2 rounded-full bg-orange-50', children: _jsx(ArrowDownRight, { className: 'h-5 w-5 text-orange-600' }) }), _jsxs("div", { children: [_jsx("p", { className: 'text-sm text-muted-foreground', children: "Egresos" }), _jsxs("p", { className: 'text-lg font-semibold text-orange-600', children: ["$", balancePorTipo[TipoCuentaContable.EGRESOS].toLocaleString()] })] })] })] }), _jsxs("div", { className: 'flex items-center gap-6', children: [_jsxs("div", { className: `flex items-center gap-2 px-4 py-2 rounded-lg ${estadoFinanciero.bgColor} ${estadoFinanciero.borderColor} border`, children: [estadoFinanciero.icono, _jsx("p", { className: `text-sm font-medium ${estadoFinanciero.color}`, children: estadoFinanciero.mensaje })] }), _jsx("div", { className: 'h-12 w-px bg-gray-200' }), _jsxs("div", { className: 'text-right', children: [_jsx("p", { className: 'text-sm text-muted-foreground', children: "Balance Final" }), _jsxs("div", { className: 'flex items-center gap-2', children: [_jsxs("p", { className: `text-3xl font-bold ${balanceGeneral >= 0 ? 'text-green-600' : 'text-red-600'}`, children: ["$", balanceGeneral.toLocaleString()] }), balanceGeneral >= 0 ? (_jsx(TrendingUp, { className: 'h-5 w-5 text-green-600' })) : (_jsx(TrendingDown, { className: 'h-5 w-5 text-red-600' }))] })] })] })] }) }) }), _jsx(Dialog, { open: showHistorial, onOpenChange: handleCloseHistorial, children: _jsxs(DialogContent, { className: 'max-w-6xl max-h-[80vh] overflow-hidden', children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { className: 'flex items-center gap-2', children: [_jsx(History, { className: 'h-5 w-5 text-blue-600' }), "Historial de Movimientos - ", cuentaHistorial?.nombre] }) }), _jsx("div", { className: 'overflow-y-auto', children: cuentaHistorial && (_jsx(HistorialMovimientos, { idcuenta: cuentaHistorial.id, titulo: `Movimientos de ${cuentaHistorial.nombre}` })) })] }) })] }));
}
