import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useMemo } from 'react';
import { PlusCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useAlmacenState } from '@/context/global/useAlmacenState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getArticuloInfo, formatDate, getMovimientoBadge, } from '@/features/almacen/inventarios/helpers/inventarioHelpers';
import { ArticulosTable } from './components/ArticulosTable';
import { NuevoArticuloForm } from './components/NuevoArticuloForm';
// Helper para parsear fechas de distintos formatos
function parseFecha(fecha) {
    if (fecha instanceof Date)
        return fecha;
    if (typeof fecha === 'object' &&
        fecha &&
        fecha.toDate)
        return fecha.toDate();
    if (typeof fecha === 'string') {
        // Si es ISO, Date lo entiende
        if (!isNaN(Date.parse(fecha)))
            return new Date(fecha);
        // Si es formato DD/MM/YYYY, HH:mm a. m./p. m.
        const match = fecha.match(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}) (a|p)\. m\./);
        if (match) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [__, d, m, y, h, min, ap] = match;
            let hour = parseInt(h, 10);
            if (ap === 'p' && hour < 12)
                hour += 12;
            if (ap === 'a' && hour === 12)
                hour = 0;
            return new Date(`${y}-${m}-${d}T${hour.toString().padStart(2, '0')}:${min}:00`);
        }
    }
    return new Date(0); // fallback
}
export default function Inventario() {
    const { id } = useParams();
    const { inventarios, articulos, movimientos, subscribeToArticulos, subscribeToMovimientos, } = useAlmacenState();
    const [showNuevoArticulo, setShowNuevoArticulo] = useState(false);
    // Suscribirse a artículos y movimientos
    useEffect(() => {
        const unsubArticulos = subscribeToArticulos();
        const unsubMovimientos = subscribeToMovimientos();
        return () => {
            unsubArticulos();
            unsubMovimientos();
        };
    }, [subscribeToArticulos, subscribeToMovimientos]);
    const inventario = inventarios.find((inventario) => inventario.id === id);
    const articulosInventario = articulos.filter((articulo) => articulo.idinventario === id);
    // Filtrar movimientos relevantes para este inventario
    const movimientosInventario = useMemo(() => {
        return movimientos
            .filter((m) => m.idinventario_origen === id || m.idinventario_destino === id)
            .sort((a, b) => parseFecha(b.fecha).getTime() - parseFecha(a.fecha).getTime());
    }, [movimientos, id]);
    if (!inventario) {
        return (_jsx("div", { className: 'flex items-center justify-center h-full', children: _jsx(Card, { className: 'w-[350px]', children: _jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Inventario no encontrado" }), _jsx(CardDescription, { children: "El inventario solicitado no existe o ha sido eliminado." })] }) }) }));
    }
    return (_jsx("div", { className: 'min-h-full bg-muted', children: _jsxs("div", { className: 'container mx-auto py-6 space-y-6', children: [_jsxs("div", { className: 'flex justify-between items-center', children: [_jsxs("div", { children: [_jsx("h1", { className: 'text-3xl font-bold tracking-tight', children: inventario.nombre }), _jsx("p", { className: 'text-muted-foreground', children: inventario.descripcion })] }), _jsxs(Button, { onClick: () => setShowNuevoArticulo(true), children: [_jsx(PlusCircle, { className: 'mr-2 h-4 w-4' }), "Agregar Art\u00EDculo"] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Detalles del Inventario" }) }), _jsx(CardContent, { children: _jsxs("div", { className: 'grid grid-cols-2 gap-4', children: [_jsxs("div", { children: [_jsx("p", { className: 'text-sm font-medium', children: "Tipo" }), _jsx("p", { className: 'text-sm text-muted-foreground', children: inventario.tipo })] }), _jsxs("div", { children: [_jsx("p", { className: 'text-sm font-medium', children: "ID" }), _jsx("p", { className: 'text-sm text-muted-foreground', children: inventario.id })] }), _jsxs("div", { children: [_jsx("p", { className: 'text-sm font-medium', children: "Fecha de creaci\u00F3n" }), _jsx("p", { className: 'text-sm text-muted-foreground', children: inventario.createdAt instanceof Date
                                                    ? inventario.createdAt.toLocaleDateString()
                                                    : new Date(inventario.createdAt).toLocaleDateString() })] }), _jsxs("div", { children: [_jsx("p", { className: 'text-sm font-medium', children: "\u00DAltima actualizaci\u00F3n" }), _jsx("p", { className: 'text-sm text-muted-foreground', children: inventario.updatedAt instanceof Date
                                                    ? inventario.updatedAt.toLocaleDateString()
                                                    : new Date(inventario.updatedAt).toLocaleDateString() })] })] }) })] }), _jsxs(Tabs, { defaultValue: 'articulos', className: 'w-full', children: [_jsxs(TabsList, { className: 'bg-white', children: [_jsxs(TabsTrigger, { value: 'articulos', children: ["Art\u00EDculos (", articulosInventario.length, ")"] }), _jsx(TabsTrigger, { value: 'movimientos', children: "Movimientos" })] }), _jsx(TabsContent, { value: 'articulos', className: 'space-y-4 pt-4', children: _jsx(ArticulosTable, { articulos: articulosInventario }) }), _jsx(TabsContent, { value: 'movimientos', children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Historial de Movimientos" }), _jsx(CardDescription, { children: "Visualiza todas las entradas, salidas y transferencias de art\u00EDculos de este inventario." })] }), _jsx(CardContent, { children: movimientosInventario.length === 0 ? (_jsxs("div", { className: 'flex flex-col items-center py-8 text-muted-foreground', children: [_jsx("img", { src: 'https://cdn-icons-png.flaticon.com/512/4072/4072155.png', alt: 'Sin movimientos', className: 'h-24 w-24 mb-4 opacity-60' }), _jsx("p", { children: "No hay movimientos registrados para este inventario." })] })) : (_jsx(ScrollArea, { className: 'h-[500px]', children: _jsxs(Table, { className: 'border rounded-lg overflow-hidden shadow-sm bg-white', children: [_jsx(TableHeader, { className: 'bg-gray-50', children: _jsxs(TableRow, { children: [_jsx(TableHead, { className: 'font-semibold text-gray-700', children: "Fecha" }), _jsx(TableHead, { className: 'font-semibold text-gray-700', children: "Tipo" }), _jsx(TableHead, { className: 'font-semibold text-gray-700', children: "Art\u00EDculo" }), _jsx(TableHead, { className: 'font-semibold text-gray-700', children: "Cantidad" }), _jsx(TableHead, { className: 'font-semibold text-gray-700', children: "Descripci\u00F3n" })] }) }), _jsx(TableBody, { children: movimientosInventario.map((movimiento) => {
                                                            const info = getArticuloInfo(articulos, movimiento.idarticulo);
                                                            return (_jsxs(TableRow, { className: 'hover:bg-gray-50 transition-colors group', children: [_jsx(TableCell, { className: 'whitespace-nowrap', children: formatDate(movimiento.fecha) }), _jsx(TableCell, { children: getMovimientoBadge(movimiento.tipo) }), _jsxs(TableCell, { className: 'font-medium', children: [info.nombre, info.extra && (_jsx("span", { className: 'block text-xs text-muted-foreground mt-1', children: info.extra }))] }), _jsx(TableCell, { className: 'text-center', children: movimiento.cantidad }), _jsx(TableCell, { className: 'max-w-xs truncate group-hover:whitespace-normal group-hover:max-w-2xl transition-all', children: movimiento.descripcion })] }, movimiento.id));
                                                        }) })] }) })) })] }) })] }), _jsx(NuevoArticuloForm, { open: showNuevoArticulo, onOpenChange: setShowNuevoArticulo, inventarioId: id || '' })] }) }));
}
