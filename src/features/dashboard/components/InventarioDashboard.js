import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Plus, AlertCircle, ArrowUpRight, ArrowDownRight, Repeat, Package, PackageCheck, History, TrendingDown, } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAlmacenState } from '@/context/global/useAlmacenState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, } from '@/components/ui/card';
import WallNetFeed from '@/features/valnet/wallNet/WallNetFeed';
// Mock data for recent movements
const recentMovements = [
    {
        id: 1,
        type: 'Entrada',
        item: 'Cable UTP Cat6',
        quantity: 50,
        date: '2023-12-05',
        user: 'Juan Pérez',
    },
    {
        id: 2,
        type: 'Salida',
        item: 'Roseta RJ45',
        quantity: 20,
        date: '2023-12-04',
        user: 'María López',
    },
    {
        id: 3,
        type: 'Transferencia',
        item: 'Cable Coaxial',
        quantity: 100,
        date: '2023-12-03',
        from: 'Bodega Central',
        to: 'Brigada Norte',
    },
    {
        id: 4,
        type: 'Entrada',
        item: 'Splitter HDMI',
        quantity: 15,
        date: '2023-12-02',
        user: 'Pedro Ramírez',
    },
    {
        id: 5,
        type: 'Salida',
        item: 'Conector RJ45',
        quantity: 200,
        date: '2023-12-01',
        user: 'Ana Torres',
    },
];
// Mock data for low stock items
const lowStockItems = [
    {
        id: 1,
        name: 'Cable UTP Cat5e',
        currentStock: 5,
        minStock: 20,
        ubicacion: 'Bodega Principal',
    },
    {
        id: 2,
        name: 'Roseta RJ45',
        currentStock: 8,
        minStock: 25,
        ubicacion: 'Bodega Principal',
    },
    {
        id: 3,
        name: 'Conectores RJ11',
        currentStock: 15,
        minStock: 50,
        ubicacion: 'Almacén Este',
    },
    {
        id: 4,
        name: 'Splitter HDMI',
        currentStock: 2,
        minStock: 10,
        ubicacion: 'Bodega Norte',
    },
];
function InventarioDashboard() {
    const navigate = useNavigate();
    const { inventarios } = useAlmacenState();
    // Function to navigate to inventory
    const navigateToInventario = (id) => {
        navigate(`/almacen/inventarios/${id}`);
    };
    return (_jsxs("div", { className: 'space-y-6', children: [_jsxs("div", { className: 'grid gap-4 md:grid-cols-2 lg:grid-cols-4', children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: 'flex flex-row items-center justify-between pb-2 space-y-0', children: [_jsx(CardTitle, { className: 'text-sm font-medium', children: "Total Inventarios" }), _jsx(Package, { className: 'h-4 w-4 text-muted-foreground' })] }), _jsxs(CardContent, { children: [_jsx("div", { className: 'text-2xl font-bold', children: inventarios?.length || 0 }), _jsx("p", { className: 'text-xs text-muted-foreground', children: "Inventarios registrados en el sistema" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: 'flex flex-row items-center justify-between pb-2 space-y-0', children: [_jsx(CardTitle, { className: 'text-sm font-medium', children: "Art\u00EDculos en Stock" }), _jsx(PackageCheck, { className: 'h-4 w-4 text-muted-foreground' })] }), _jsxs(CardContent, { children: [_jsx("div", { className: 'text-2xl font-bold', children: "1,245" }), _jsx("p", { className: 'text-xs text-muted-foreground', children: "Art\u00EDculos disponibles" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: 'flex flex-row items-center justify-between pb-2 space-y-0', children: [_jsx(CardTitle, { className: 'text-sm font-medium', children: "Movimientos Hoy" }), _jsx(History, { className: 'h-4 w-4 text-muted-foreground' })] }), _jsxs(CardContent, { children: [_jsx("div", { className: 'text-2xl font-bold', children: "24" }), _jsx("p", { className: 'text-xs text-muted-foreground', children: "Entradas, salidas y transferencias" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: 'flex flex-row items-center justify-between pb-2 space-y-0', children: [_jsx(CardTitle, { className: 'text-sm font-medium', children: "Stock M\u00EDnimo" }), _jsx(TrendingDown, { className: 'h-4 w-4 text-muted-foreground' })] }), _jsxs(CardContent, { children: [_jsx("div", { className: 'text-2xl font-bold', children: lowStockItems.length }), _jsx("p", { className: 'text-xs text-muted-foreground', children: "Art\u00EDculos debajo del umbral m\u00EDnimo" })] })] })] }), _jsxs("div", { className: 'grid gap-4 md:grid-cols-9', children: [_jsxs(Card, { className: 'md:col-span-3', children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: 'flex items-center justify-between', children: [_jsx(CardTitle, { children: "Materiales en Stock M\u00EDnimo" }), _jsx(AlertCircle, { className: 'h-4 w-4 text-amber-500' })] }), _jsx(CardDescription, { children: "Art\u00EDculos que necesitan reabastecimiento urgente" })] }), _jsx(CardContent, { children: _jsx("div", { className: 'space-y-4', children: lowStockItems.map((item) => (_jsxs("div", { className: 'flex justify-between items-center p-2 border-b', children: [_jsxs("div", { children: [_jsx("p", { className: 'font-medium', children: item.name }), _jsx("p", { className: 'text-sm text-muted-foreground', children: item.ubicacion })] }), _jsxs("div", { className: 'flex items-center', children: [_jsx("span", { className: 'text-red-500 font-medium', children: item.currentStock }), _jsx("span", { className: 'text-muted-foreground mx-1', children: "/" }), _jsx("span", { className: 'text-muted-foreground', children: item.minStock })] })] }, item.id))) }) }), _jsx(CardFooter, { children: _jsx(Button, { variant: 'ghost', className: 'w-full', onClick: () => navigate('/almacen/reportes/stock-minimo'), children: "Ver reporte completo" }) })] }), _jsxs(Card, { className: 'md:col-span-4', children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "\u00DAltimos Movimientos" }), _jsx(CardDescription, { children: "Entradas, salidas y transferencias recientes" })] }), _jsx(CardContent, { children: _jsx("div", { className: 'space-y-4', children: recentMovements.map((movement) => (_jsxs("div", { className: 'flex justify-between items-center p-2 border-b', children: [_jsxs("div", { children: [_jsx("p", { className: 'font-medium', children: movement.item }), _jsxs("div", { className: 'flex items-center text-sm', children: [_jsx("div", { className: `mr-1 w-2 h-2 rounded-full ${movement.type === 'Entrada'
                                                                    ? 'bg-green-500'
                                                                    : movement.type === 'Salida'
                                                                        ? 'bg-red-500'
                                                                        : 'bg-blue-500'}` }), _jsxs("span", { className: 'text-muted-foreground', children: [movement.type === 'Entrada' && (_jsxs("span", { className: 'flex items-center', children: [_jsx(ArrowUpRight, { className: 'h-3 w-3 mr-1 text-green-500' }), "Entrada: ", movement.quantity, " unidades"] })), movement.type === 'Salida' && (_jsxs("span", { className: 'flex items-center', children: [_jsx(ArrowDownRight, { className: 'h-3 w-3 mr-1 text-red-500' }), "Salida: ", movement.quantity, " unidades"] })), movement.type === 'Transferencia' && (_jsxs("span", { className: 'flex items-center', children: [_jsx(Repeat, { className: 'h-3 w-3 mr-1 text-blue-500' }), "Transferencia: ", movement.quantity, " unidades"] }))] })] })] }), _jsxs("div", { className: 'text-right', children: [_jsx("p", { className: 'text-sm', children: movement.date }), _jsx("p", { className: 'text-xs text-muted-foreground', children: movement.user
                                                            ? `Por: ${movement.user}`
                                                            : `De: ${movement.from} a ${movement.to}` })] })] }, movement.id))) }) }), _jsx(CardFooter, { children: _jsx(Button, { variant: 'ghost', className: 'w-full', onClick: () => navigate('/almacen/reportes/movimientos'), children: "Ver todos los movimientos" }) })] }), _jsx("div", { className: 'md:col-span-2', children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Muro WallNet" }), _jsx(CardDescription, { children: "Comunicados y mensajes recientes" })] }), _jsx(CardContent, { children: _jsx(WallNetFeed, {}) })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Inventarios Disponibles" }), _jsx(CardDescription, { children: "Selecciona un inventario para gestionar" })] }), _jsx(CardContent, { children: _jsx("div", { className: 'grid gap-4 md:grid-cols-2 lg:grid-cols-3', children: inventarios && inventarios.length > 0 ? (inventarios.map((inventario) => (_jsxs(Card, { className: 'hover:bg-accent/50 cursor-pointer transition-colors', children: [_jsxs(CardHeader, { className: 'pb-2', children: [_jsx(CardTitle, { className: 'text-base', children: inventario.nombre }), inventario.descripcion && (_jsx(CardDescription, { className: 'text-sm', children: inventario.descripcion }))] }), _jsx(CardFooter, { children: _jsx(Button, { variant: 'outline', className: 'w-full', onClick: () => navigateToInventario(inventario.id), children: "Gestionar" }) })] }, inventario.id)))) : (_jsx("p", { className: 'col-span-full text-center py-8 text-muted-foreground', children: "No hay inventarios disponibles. Crea un nuevo inventario para empezar." })) }) }), _jsx(CardFooter, { children: _jsxs(Button, { onClick: () => navigate('/almacen/inventarios'), children: [_jsx(Plus, { className: 'mr-2 h-4 w-4' }), "Crear nuevo inventario"] }) })] })] }));
}
// Export as both named and default export
export { InventarioDashboard };
export default InventarioDashboard;
