import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { TipoArticulo } from '@/types/interfaces/almacen/articulo';
import { PackageIcon, HardHatIcon, WrenchIcon, Loader2, AlertTriangleIcon, } from 'lucide-react';
import { useAlmacenState } from '@/context/global/useAlmacenState';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
export function InventarioBrigadaDialog({ open, onOpenChange, inventarioId, brigadaNombre, }) {
    const [isLoading, setIsLoading] = useState(true);
    const { inventarios, articulos, subscribeToArticulos } = useAlmacenState();
    // Suscribirse a artículos cuando se abre el diálogo
    useEffect(() => {
        let unsubscribe;
        if (open && inventarioId) {
            setIsLoading(true);
            // Suscribirse a los artículos
            unsubscribe = subscribeToArticulos();
            // Simular un tiempo mínimo de carga para mejor UX
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 800);
            return () => {
                clearTimeout(timer);
                if (unsubscribe)
                    unsubscribe();
            };
        }
        return () => {
            if (unsubscribe)
                unsubscribe();
        };
    }, [open, inventarioId, subscribeToArticulos]);
    // Obtener el inventario seleccionado
    const inventarioSeleccionado = inventarioId
        ? inventarios.find((inv) => inv.id === inventarioId)
        : null;
    // Filtrar artículos por el inventario seleccionado
    const articulosInventario = articulos.filter((articulo) => articulo.idinventario === inventarioId);
    // Separar artículos por tipo
    const materiales = articulosInventario.filter((articulo) => articulo.tipo === TipoArticulo.MATERIAL);
    const equipos = articulosInventario.filter((articulo) => articulo.tipo === TipoArticulo.EQUIPO);
    // Función para determinar el color del badge según la ubicación del artículo
    const getBadgeClass = (ubicacion) => {
        if (!ubicacion)
            return 'bg-blue-50 text-blue-700 border-blue-200';
        const ubicacionLower = ubicacion.toLowerCase();
        if (ubicacionLower.includes('buen') || ubicacionLower.includes('nuevo')) {
            return 'bg-green-50 text-green-700 border-green-200';
        }
        else if (ubicacionLower.includes('regular')) {
            return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        }
        else {
            return 'bg-blue-50 text-blue-700 border-blue-200';
        }
    };
    // Formatear precio para que se muestre como moneda
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2,
        }).format(amount);
    };
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: 'sm:max-w-[800px] max-h-[80vh] overflow-y-auto', children: [_jsxs(DialogHeader, { children: [_jsxs(DialogTitle, { className: 'flex items-center gap-2', children: [_jsx(PackageIcon, { className: 'h-5 w-5' }), "Inventario de Brigada: ", brigadaNombre] }), _jsx(DialogDescription, { children: inventarioSeleccionado ? (_jsxs(_Fragment, { children: [_jsx("span", { className: 'font-medium', children: inventarioSeleccionado.nombre }), ' ', "- Visualizaci\u00F3n del inventario asignado a esta brigada."] })) : ('Cargando información del inventario...') })] }), _jsx(Separator, { className: 'my-2' }), isLoading ? (_jsxs("div", { className: 'flex flex-col items-center justify-center py-12', children: [_jsx(Loader2, { className: 'h-8 w-8 animate-spin text-primary mb-4' }), _jsx("p", { className: 'text-muted-foreground', children: "Cargando inventario..." })] })) : (_jsxs(Tabs, { defaultValue: 'equipos', className: 'w-full', children: [_jsxs(TabsList, { className: 'grid w-full grid-cols-2', children: [_jsxs(TabsTrigger, { value: 'equipos', className: 'flex items-center gap-2', children: [_jsx(WrenchIcon, { className: 'h-4 w-4' }), "Equipos", ' ', _jsx(Badge, { variant: 'secondary', className: 'ml-1', children: equipos.length })] }), _jsxs(TabsTrigger, { value: 'materiales', className: 'flex items-center gap-2', children: [_jsx(HardHatIcon, { className: 'h-4 w-4' }), "Materiales", ' ', _jsx(Badge, { variant: 'secondary', className: 'ml-1', children: materiales.length })] })] }), _jsx(TabsContent, { value: 'equipos', className: 'mt-4', children: _jsxs(Card, { children: [_jsxs(CardHeader, { className: 'pb-2', children: [_jsx(CardTitle, { className: 'text-lg', children: "Equipos" }), _jsx(CardDescription, { children: "Equipos asignados a la brigada para realizar sus operaciones" })] }), _jsx(CardContent, { children: equipos.length === 0 ? (_jsxs("div", { className: 'flex flex-col items-center justify-center py-8 text-muted-foreground', children: [_jsx(AlertTriangleIcon, { className: 'h-12 w-12 text-yellow-500 mb-2 opacity-70' }), _jsx("p", { children: "No hay equipos registrados en este inventario" })] })) : (_jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Nombre" }), _jsx(TableHead, { children: "Marca/Modelo" }), _jsx(TableHead, { children: "Serial" }), _jsx(TableHead, { children: "Costo" }), _jsx(TableHead, { children: "Ubicaci\u00F3n" })] }) }), _jsx(TableBody, { children: equipos.map((equipo) => (_jsxs(TableRow, { children: [_jsxs(TableCell, { className: 'font-medium', children: [equipo.nombre, equipo.descripcion && (_jsx("div", { className: 'text-xs text-muted-foreground', children: equipo.descripcion }))] }), _jsxs(TableCell, { children: [equipo.marca, " / ", equipo.modelo] }), _jsx(TableCell, { children: equipo.serial }), _jsx(TableCell, { children: formatCurrency(equipo.costo) }), _jsx(TableCell, { children: _jsx(Badge, { variant: 'outline', className: getBadgeClass(equipo.ubicacion), children: equipo.ubicacion || 'No especificado' }) })] }, equipo.id))) })] })) })] }) }), _jsx(TabsContent, { value: 'materiales', className: 'mt-4', children: _jsxs(Card, { children: [_jsxs(CardHeader, { className: 'pb-2', children: [_jsx(CardTitle, { className: 'text-lg', children: "Materiales" }), _jsx(CardDescription, { children: "Materiales asignados a la brigada para realizar sus operaciones" })] }), _jsx(CardContent, { children: materiales.length === 0 ? (_jsxs("div", { className: 'flex flex-col items-center justify-center py-8 text-muted-foreground', children: [_jsx(AlertTriangleIcon, { className: 'h-12 w-12 text-yellow-500 mb-2 opacity-70' }), _jsx("p", { children: "No hay materiales registrados en este inventario" })] })) : (_jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Nombre" }), _jsx(TableHead, { children: "Cantidad" }), _jsx(TableHead, { children: "Unidad" }), _jsx(TableHead, { children: "Costo Total" })] }) }), _jsx(TableBody, { children: materiales.map((material) => (_jsxs(TableRow, { children: [_jsxs(TableCell, { className: 'font-medium', children: [material.nombre, material.descripcion && (_jsx("div", { className: 'text-xs text-muted-foreground', children: material.descripcion }))] }), _jsx(TableCell, { children: material.cantidad }), _jsx(TableCell, { children: material.unidad }), _jsx(TableCell, { children: formatCurrency(material.cantidad * material.costo) })] }, material.id))) })] })) })] }) })] }))] }) }));
}
