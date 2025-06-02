import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useCoordinacionState } from '@/context/global/useCoordinacionState';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// Simulación de hook para obtener todos los registros de combustible (reemplazar por hook real)
const useAllCombustible = () => {
    // TODO: Reemplazar por fetch real
    const [registros, setRegistros] = useState([]);
    useEffect(() => {
        setRegistros([
            {
                id: '1',
                brigadaId: 'A',
                brigadaNombre: 'Brigada Alfa',
                fecha: '2024-06-01',
                galones: 10,
                km_inicial: 1000,
                km_final: 1200,
                referencia: 'Ticket 123',
            },
            {
                id: '2',
                brigadaId: 'B',
                brigadaNombre: 'Brigada Beta',
                fecha: '2024-06-02',
                galones: 15,
                km_inicial: 2000,
                km_final: 2300,
                referencia: 'Ticket 222',
            },
            {
                id: '3',
                brigadaId: 'A',
                brigadaNombre: 'Brigada Alfa',
                fecha: '2024-06-10',
                galones: 12,
                km_inicial: 1200,
                km_final: 1450,
                referencia: 'Ticket 124',
            },
        ]);
    }, []);
    return registros;
};
export default function CombustibleDashboard() {
    const { brigadas } = useCoordinacionState();
    const registros = useAllCombustible();
    const [filtroBrigada, setFiltroBrigada] = useState('');
    const registrosFiltrados = filtroBrigada
        ? registros.filter((r) => r.brigadaId === filtroBrigada)
        : registros;
    // Calcular consumo total por brigada
    const consumoPorBrigada = brigadas.map((b) => {
        const registrosB = registros.filter((r) => r.brigadaId === b.id);
        const totalGalones = registrosB.reduce((acc, r) => acc + r.galones, 0);
        const totalKm = registrosB.reduce((acc, r) => acc + ((r.km_final || 0) - (r.km_inicial || 0)), 0);
        const rendimiento = totalGalones > 0 ? (totalKm / totalGalones).toFixed(2) : '-';
        return { nombre: b.nombre, totalGalones, totalKm, rendimiento };
    });
    return (_jsx("div", { className: 'p-4 md:p-6 lg:p-8 space-y-6', children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Dashboard de Combustible de Brigadas" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: 'mb-4 flex gap-4 items-center', children: [_jsx("label", { htmlFor: 'filtroBrigada', children: "Filtrar por brigada:" }), _jsxs("select", { id: 'filtroBrigada', value: filtroBrigada, onChange: (e) => setFiltroBrigada(e.target.value), className: 'border rounded px-2 py-1', children: [_jsx("option", { value: '', children: "Todas" }), brigadas.map((b) => (_jsx("option", { value: b.id, children: b.nombre }, b.id)))] })] }), _jsx("div", { className: 'overflow-x-auto mb-8', children: _jsxs("table", { className: 'min-w-full text-sm border', children: [_jsx("thead", { children: _jsxs("tr", { className: 'bg-muted', children: [_jsx("th", { className: 'px-2 py-1 border', children: "Brigada" }), _jsx("th", { className: 'px-2 py-1 border', children: "Fecha" }), _jsx("th", { className: 'px-2 py-1 border', children: "Galones" }), _jsx("th", { className: 'px-2 py-1 border', children: "Km inicial" }), _jsx("th", { className: 'px-2 py-1 border', children: "Km final" }), _jsx("th", { className: 'px-2 py-1 border', children: "Referencia" }), _jsx("th", { className: 'px-2 py-1 border', children: "Rendimiento" })] }) }), _jsx("tbody", { children: registrosFiltrados.map((r) => (_jsxs("tr", { children: [_jsx("td", { className: 'px-2 py-1 border', children: r.brigadaNombre }), _jsx("td", { className: 'px-2 py-1 border', children: r.fecha }), _jsx("td", { className: 'px-2 py-1 border', children: r.galones }), _jsx("td", { className: 'px-2 py-1 border', children: r.km_inicial }), _jsx("td", { className: 'px-2 py-1 border', children: r.km_final }), _jsx("td", { className: 'px-2 py-1 border', children: r.referencia }), _jsx("td", { className: 'px-2 py-1 border', children: r.km_final && r.km_inicial
                                                        ? ((r.km_final - r.km_inicial) / r.galones).toFixed(2)
                                                        : '-' })] }, r.id))) })] }) }), _jsxs("div", { className: 'mb-4', children: [_jsx("h3", { className: 'font-bold mb-2', children: "Comparativo de consumo por brigada" }), _jsxs("table", { className: 'min-w-full text-sm border', children: [_jsx("thead", { children: _jsxs("tr", { className: 'bg-muted', children: [_jsx("th", { className: 'px-2 py-1 border', children: "Brigada" }), _jsx("th", { className: 'px-2 py-1 border', children: "Total galones" }), _jsx("th", { className: 'px-2 py-1 border', children: "Total km" }), _jsx("th", { className: 'px-2 py-1 border', children: "Rendimiento (km/gal\u00F3n)" })] }) }), _jsx("tbody", { children: consumoPorBrigada.map((c) => (_jsxs("tr", { children: [_jsx("td", { className: 'px-2 py-1 border', children: c.nombre }), _jsx("td", { className: 'px-2 py-1 border', children: c.totalGalones }), _jsx("td", { className: 'px-2 py-1 border', children: c.totalKm }), _jsx("td", { className: 'px-2 py-1 border', children: c.rendimiento })] }, c.nombre))) })] })] })] })] }) }));
}
