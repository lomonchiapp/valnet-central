import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
const tiposReporte = [
    { value: 'balance', label: 'Balance de Sumas y Saldos' },
    { value: 'mayor', label: 'Libro Mayor' },
    { value: 'resultados', label: 'Estado de Resultados' },
];
// Placeholder de datos para balance
const balanceData = [
    { cuenta: 'Banco', debe: 5000, haber: 0, saldo: 5000 },
    { cuenta: 'Gastos de alquiler', debe: 1000, haber: 0, saldo: 1000 },
    { cuenta: 'Ingresos', debe: 0, haber: 2000, saldo: -2000 },
];
export default function Reportes() {
    const [tipo, setTipo] = useState('balance');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [cuenta, setCuenta] = useState('');
    // Aquí puedes cambiar el dataset según el tipo de reporte
    const data = balanceData; // Placeholder
    return (_jsxs("div", { className: 'space-y-6', children: [_jsxs("div", { className: 'flex justify-between items-center', children: [_jsxs("div", { children: [_jsx("h1", { className: 'text-3xl font-bold', children: "Reportes Contables" }), _jsx("p", { className: 'text-muted-foreground', children: "Genera y consulta reportes contables." })] }), _jsxs("div", { className: 'flex gap-2', children: [_jsx(Button, { variant: 'outline', children: "Exportar Excel" }), _jsx(Button, { variant: 'outline', children: "Exportar PDF" })] })] }), _jsxs("div", { className: 'flex gap-4 items-center flex-wrap', children: [_jsx("select", { value: tipo, onChange: (e) => setTipo(e.target.value), className: 'border rounded px-2 py-1', children: tiposReporte.map((r) => (_jsx("option", { value: r.value, children: r.label }, r.value))) }), _jsx(Input, { type: 'date', value: fechaInicio, onChange: (e) => setFechaInicio(e.target.value), placeholder: 'Desde' }), _jsx(Input, { type: 'date', value: fechaFin, onChange: (e) => setFechaFin(e.target.value), placeholder: 'Hasta' }), _jsx(Input, { value: cuenta, onChange: (e) => setCuenta(e.target.value), placeholder: 'Cuenta (opcional)' }), _jsx(Button, { children: "Filtrar" })] }), _jsx("div", { className: 'border rounded-lg overflow-x-auto', children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Cuenta" }), _jsx(TableHead, { children: "Debe" }), _jsx(TableHead, { children: "Haber" }), _jsx(TableHead, { children: "Saldo" })] }) }), _jsx(TableBody, { children: data.map((row, i) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: row.cuenta }), _jsx(TableCell, { children: row.debe }), _jsx(TableCell, { children: row.haber }), _jsx(TableCell, { children: row.saldo })] }, i))) })] }) })] }));
}
