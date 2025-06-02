import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { format } from 'date-fns';
import { TipoMovimiento, OrigenMovimiento, } from '@/types/interfaces/contabilidad/movimientoCuenta';
import { es } from 'date-fns/locale';
import { useContabilidadState } from '@/context/global/useContabilidadState';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { useMovimientosCuenta } from '@/features/compras/gastos/hooks/useMovimientosCuenta';
export function HistorialMovimientos({ idcuenta, titulo = 'Historial de Movimientos', }) {
    const { movimientos, movimientosPorCuenta, totalDebitos, totalCreditos, saldoNeto, } = useMovimientosCuenta();
    const { cuentas } = useContabilidadState();
    const [filtroOrigen, setFiltroOrigen] = useState('todos');
    const [filtroTipo, setFiltroTipo] = useState('todos');
    const movimientosMostrar = idcuenta
        ? movimientosPorCuenta(idcuenta)
        : movimientos;
    const movimientosFiltrados = movimientosMostrar
        .filter((m) => filtroOrigen === 'todos' || m.origen === filtroOrigen)
        .filter((m) => filtroTipo === 'todos' || m.tipo === filtroTipo);
    const getCuentaNombre = (idcuenta) => {
        return (cuentas.find((c) => c.id === idcuenta)?.nombre || 'Cuenta no encontrada');
    };
    const getOrigenBadgeColor = (origen) => {
        switch (origen) {
            case OrigenMovimiento.PAGO_UNICO:
                return 'bg-blue-100 text-blue-800';
            case OrigenMovimiento.PAGO_RECURRENTE:
                return 'bg-purple-100 text-purple-800';
            case OrigenMovimiento.GASTO_MENOR:
                return 'bg-orange-100 text-orange-800';
            case OrigenMovimiento.AJUSTE:
                return 'bg-gray-100 text-gray-800';
            case OrigenMovimiento.REVERSA_PAGO:
                return 'bg-red-100 text-red-800';
            case OrigenMovimiento.INGRESO:
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    const getTipoBadgeColor = (tipo) => {
        return tipo === TipoMovimiento.DEBITO
            ? 'bg-red-100 text-red-800'
            : 'bg-green-100 text-green-800';
    };
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: 'flex items-center justify-between', children: [_jsx("span", { children: titulo }), !idcuenta && (_jsxs("div", { className: 'flex gap-4 text-sm', children: [_jsxs("span", { className: 'text-red-600', children: ["D\u00E9bitos: $", totalDebitos.toLocaleString()] }), _jsxs("span", { className: 'text-green-600', children: ["Cr\u00E9ditos: $", totalCreditos.toLocaleString()] }), _jsxs("span", { className: `font-bold ${saldoNeto >= 0 ? 'text-green-600' : 'text-red-600'}`, children: ["Saldo Neto: $", saldoNeto.toLocaleString()] })] }))] }), _jsxs("div", { className: 'flex gap-4', children: [_jsxs(Select, { value: filtroOrigen, onValueChange: setFiltroOrigen, children: [_jsx(SelectTrigger, { className: 'w-48', children: _jsx(SelectValue, { placeholder: 'Filtrar por origen' }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: 'todos', children: "Todos los or\u00EDgenes" }), Object.values(OrigenMovimiento).map((origen) => (_jsx(SelectItem, { value: origen, children: origen.replace('_', ' ') }, origen)))] })] }), _jsxs(Select, { value: filtroTipo, onValueChange: setFiltroTipo, children: [_jsx(SelectTrigger, { className: 'w-48', children: _jsx(SelectValue, { placeholder: 'Filtrar por tipo' }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: 'todos', children: "Todos los tipos" }), _jsx(SelectItem, { value: TipoMovimiento.DEBITO, children: "D\u00E9bitos" }), _jsx(SelectItem, { value: TipoMovimiento.CREDITO, children: "Cr\u00E9ditos" })] })] })] })] }), _jsx(CardContent, { children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Fecha" }), !idcuenta && _jsx(TableHead, { children: "Cuenta" }), _jsx(TableHead, { children: "Descripci\u00F3n" }), _jsx(TableHead, { children: "Origen" }), _jsx(TableHead, { children: "Tipo" }), _jsx(TableHead, { className: 'text-right', children: "Monto" }), _jsx(TableHead, { className: 'text-right', children: "Balance Anterior" }), _jsx(TableHead, { className: 'text-right', children: "Balance Nuevo" })] }) }), _jsx(TableBody, { children: movimientosFiltrados.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: idcuenta ? 7 : 8, className: 'text-center text-gray-500 py-6', children: "No hay movimientos registrados" }) })) : (movimientosFiltrados.map((movimiento) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: format(new Date(movimiento.fecha), 'dd/MM/yyyy HH:mm', {
                                            locale: es,
                                        }) }), !idcuenta && (_jsx(TableCell, { className: 'font-medium', children: getCuentaNombre(movimiento.idcuenta) })), _jsx(TableCell, { children: _jsxs("div", { children: [_jsx("div", { className: 'font-medium', children: movimiento.descripcion }), movimiento.notas && (_jsx("div", { className: 'text-sm text-gray-500', children: movimiento.notas }))] }) }), _jsx(TableCell, { children: _jsx(Badge, { className: getOrigenBadgeColor(movimiento.origen), children: movimiento.origen.replace('_', ' ') }) }), _jsx(TableCell, { children: _jsx(Badge, { className: getTipoBadgeColor(movimiento.tipo), children: movimiento.tipo }) }), _jsx(TableCell, { className: 'text-right font-mono', children: _jsxs("span", { className: movimiento.tipo === TipoMovimiento.DEBITO
                                                ? 'text-red-600'
                                                : 'text-green-600', children: [movimiento.tipo === TipoMovimiento.DEBITO ? '-' : '+', "$", movimiento.monto.toLocaleString()] }) }), _jsxs(TableCell, { className: 'text-right font-mono', children: ["$", movimiento.balanceAnterior.toLocaleString()] }), _jsxs(TableCell, { className: 'text-right font-mono font-semibold', children: ["$", movimiento.balanceNuevo.toLocaleString()] })] }, movimiento.id)))) })] }) })] }));
}
