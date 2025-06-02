import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
// import { useContabilidadState } from '@/context/global/useContabilidadState' // Para datos reales
// Placeholder de datos
const asientos = [
    {
        id: '1',
        fecha: '2024-06-01',
        descripcion: 'Pago de alquiler',
        movimientos: [
            { cuenta: 'Gastos de alquiler', debe: 1000, haber: 0 },
            { cuenta: 'Banco', debe: 0, haber: 1000 },
        ],
    },
    {
        id: '2',
        fecha: '2024-06-02',
        descripcion: 'Compra de suministros',
        movimientos: [
            { cuenta: 'Suministros', debe: 500, haber: 0 },
            { cuenta: 'Banco', debe: 0, haber: 500 },
        ],
    },
];
export default function DiarioGeneral() {
    // const { diarioGeneral } = useContabilidadState() // Para datos reales
    const [search, setSearch] = useState('');
    const [filtered, setFiltered] = useState(asientos);
    // Filtro básico por descripción
    const handleSearch = (e) => {
        setSearch(e.target.value);
        setFiltered(asientos.filter((a) => a.descripcion.toLowerCase().includes(e.target.value.toLowerCase())));
    };
    return (_jsxs("div", { className: 'space-y-6', children: [_jsxs("div", { className: 'flex justify-between items-center', children: [_jsxs("div", { children: [_jsx("h1", { className: 'text-3xl font-bold', children: "Diario General" }), _jsx("p", { className: 'text-muted-foreground', children: "Consulta y administra el diario general contable." })] }), _jsxs("div", { className: 'flex gap-2', children: [_jsx(Button, { variant: 'outline', children: "Exportar Excel" }), _jsx(Button, { variant: 'outline', children: "Exportar PDF" }), _jsx(Button, { children: "Agregar Asiento" })] })] }), _jsx("div", { className: 'flex gap-4 items-center', children: _jsx(Input, { placeholder: 'Buscar por descripci\u00F3n...', value: search, onChange: handleSearch, className: 'max-w-xs' }) }), _jsx("div", { className: 'border rounded-lg overflow-x-auto', children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Fecha" }), _jsx(TableHead, { children: "Descripci\u00F3n" }), _jsx(TableHead, { children: "Movimientos" })] }) }), _jsx(TableBody, { children: filtered.map((asiento) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: asiento.fecha }), _jsx(TableCell, { children: asiento.descripcion }), _jsx(TableCell, { children: _jsx("ul", { className: 'list-disc pl-4', children: asiento.movimientos.map((m, i) => (_jsxs("li", { children: [_jsxs("span", { className: 'font-semibold', children: [m.cuenta, ":"] }), _jsxs("span", { className: 'text-green-700', children: ["Debe: ", m.debe] }), " /", _jsxs("span", { className: 'text-red-700', children: ["Haber: ", m.haber] })] }, i))) }) })] }, asiento.id))) })] }) }), _jsxs("div", { className: 'flex justify-end gap-2', children: [_jsx(Button, { variant: 'outline', children: "Anterior" }), _jsx(Button, { variant: 'outline', children: "Siguiente" })] })] }));
}
