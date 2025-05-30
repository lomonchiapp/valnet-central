import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAlmacenState } from '@/context/global/useAlmacenState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NuevaMarcaForm } from '@/features/almacen/marcas/components/NuevaMarcaForm';
export default function Marcas() {
    const { marcas, subscribeToMarcas } = useAlmacenState();
    const [showNewForm, setShowNewForm] = useState(false);
    useEffect(() => {
        const unsubscribe = subscribeToMarcas();
        return () => unsubscribe();
    }, [subscribeToMarcas]);
    const sortedMarcas = [...marcas].sort((a, b) => a.nombre.localeCompare(b.nombre));
    return (_jsxs("div", { className: 'space-y-6', children: [_jsxs("div", { className: 'flex justify-between items-center', children: [_jsxs("div", { children: [_jsx("h1", { className: 'text-3xl font-bold tracking-tight', children: "Marcas" }), _jsx("p", { className: 'text-muted-foreground', children: "Administra las marcas de los productos en el inventario." })] }), _jsxs(Button, { onClick: () => setShowNewForm(true), children: [_jsx(PlusCircle, { className: 'mr-2 h-4 w-4' }), "Nueva Marca"] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Marcas Registradas" }), _jsx(CardDescription, { children: "Lista de todas las marcas disponibles para asignar a art\u00EDculos." })] }), _jsx(CardContent, { children: sortedMarcas.length === 0 ? (_jsx("p", { className: 'text-center py-8 text-muted-foreground', children: "No hay marcas registradas. Crea una nueva para comenzar." })) : (_jsx(ScrollArea, { className: 'h-[500px]', children: _jsxs("table", { className: 'min-w-full text-sm', children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: 'text-left font-semibold p-2', children: "Nombre" }), _jsx("th", { className: 'text-right font-semibold p-2', children: "Acciones" })] }) }), _jsx("tbody", { children: sortedMarcas.map((marca) => (_jsxs("tr", { className: 'border-b last:border-0', children: [_jsx("td", { className: 'p-2 font-medium', children: marca.nombre }), _jsx("td", { className: 'p-2 text-right', children: _jsx(Button, { variant: 'ghost', size: 'icon', children: _jsx(Trash2, { className: 'h-4 w-4' }) }) })] }, marca.id))) })] }) })) })] }), _jsx(NuevaMarcaForm, { open: showNewForm, onOpenChange: setShowNewForm, onMarcaCreada: () => {
                    setShowNewForm(false);
                    toast.success('Marca creada exitosamente');
                } })] }));
}
