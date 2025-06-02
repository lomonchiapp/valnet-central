import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { TipoArticulo } from '@/types';
import { PlusCircle, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useAlmacenState } from '@/context/global/useAlmacenState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NuevaMarcaForm } from '@/features/almacen/marcas/components/NuevaMarcaForm';
import { useEliminarMarca } from '@/features/almacen/marcas/hooks/useEliminarMarca';
export default function Marcas() {
    const { marcas, articulos, subscribeToMarcas, subscribeToArticulos } = useAlmacenState();
    const [showNewForm, setShowNewForm] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [marcaAEliminar, setMarcaAEliminar] = useState(null);
    const { eliminarMarca, isLoading: eliminandoMarca } = useEliminarMarca();
    useEffect(() => {
        const unsubscribeMarcas = subscribeToMarcas();
        const unsubscribeArticulos = subscribeToArticulos();
        return () => {
            unsubscribeMarcas();
            unsubscribeArticulos();
        };
    }, [subscribeToMarcas, subscribeToArticulos]);
    const sortedMarcas = [...marcas].sort((a, b) => a.nombre.localeCompare(b.nombre));
    // Obtener los modelos únicos para cada marca
    const marcasConModelos = useMemo(() => {
        return sortedMarcas.map((marca) => {
            const articulosDeMarca = articulos.filter((articulo) => articulo.marca === marca.id &&
                articulo.tipo === TipoArticulo.EQUIPO &&
                articulo.modelo);
            // Obtener modelos únicos
            const modelosUnicos = [
                ...new Set(articulosDeMarca.map((articulo) => articulo.modelo)),
            ].sort();
            return {
                ...marca,
                modelos: modelosUnicos,
            };
        });
    }, [sortedMarcas, articulos]);
    const handleDeleteClick = (marca) => {
        setMarcaAEliminar(marca);
        setDeleteDialogOpen(true);
    };
    const handleConfirmDelete = async () => {
        if (!marcaAEliminar)
            return;
        try {
            await eliminarMarca(marcaAEliminar.id);
            toast.success(`Marca "${marcaAEliminar.nombre}" eliminada exitosamente`);
        }
        catch {
            toast.error('Error al eliminar la marca. Intente nuevamente.');
        }
        finally {
            setDeleteDialogOpen(false);
            setMarcaAEliminar(null);
        }
    };
    return (_jsxs("div", { className: 'space-y-6 max-w-7xl mx-auto', children: [_jsxs("div", { className: 'flex justify-between items-center', children: [_jsxs("div", { children: [_jsx("h1", { className: 'text-3xl font-bold tracking-tight', children: "Marcas" }), _jsx("p", { className: 'text-muted-foreground', children: "Administra las marcas de los productos en el inventario." })] }), _jsxs(Button, { onClick: () => setShowNewForm(true), children: [_jsx(PlusCircle, { className: 'mr-2 h-4 w-4' }), "Nueva Marca"] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Marcas Registradas" }), _jsx(CardDescription, { children: "Lista de todas las marcas disponibles y sus modelos asociados." })] }), _jsx(CardContent, { children: marcasConModelos.length === 0 ? (_jsx("p", { className: 'text-center py-8 text-muted-foreground', children: "No hay marcas registradas. Crea una nueva para comenzar." })) : (_jsx(ScrollArea, { className: 'h-[500px]', children: _jsx("div", { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', children: marcasConModelos.map((marca) => (_jsxs(Card, { className: 'hover:shadow-md transition-shadow', children: [_jsx(CardHeader, { className: 'pb-2', children: _jsxs("div", { className: 'flex justify-between items-start', children: [_jsx(CardTitle, { className: 'text-lg', children: marca.nombre }), _jsx(Button, { variant: 'ghost', size: 'icon', onClick: () => handleDeleteClick(marca), className: 'h-8 w-8', children: _jsx(Trash2, { className: 'h-4 w-4' }) })] }) }), _jsx(CardContent, { children: marca.modelos.length > 0 ? (_jsxs("div", { className: 'space-y-2', children: [_jsx("p", { className: 'text-sm text-muted-foreground', children: "Modelos:" }), _jsx("div", { className: 'flex flex-wrap gap-2', children: marca.modelos.map((modelo) => (_jsxs(Badge, { variant: 'secondary', className: 'flex items-center gap-1', children: [_jsx(Package, { className: 'h-3 w-3' }), modelo] }, modelo))) })] })) : (_jsx("p", { className: 'text-sm text-muted-foreground', children: "No hay modelos registrados para esta marca." })) })] }, marca.id))) }) })) })] }), _jsx(Dialog, { open: deleteDialogOpen, onOpenChange: setDeleteDialogOpen, children: _jsxs(DialogContent, { children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Eliminar marca" }) }), _jsxs("p", { children: ["\u00BFEst\u00E1s seguro de que deseas eliminar la marca \"", marcaAEliminar?.nombre, "\"?"] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: 'outline', onClick: () => setDeleteDialogOpen(false), disabled: eliminandoMarca, children: "Cancelar" }), _jsx(Button, { variant: 'destructive', onClick: handleConfirmDelete, disabled: eliminandoMarca, children: eliminandoMarca ? 'Eliminando...' : 'Eliminar' })] })] }) }), _jsx(NuevaMarcaForm, { open: showNewForm, onOpenChange: setShowNewForm, onMarcaCreada: () => {
                    setShowNewForm(false);
                    toast.success('Marca creada exitosamente');
                } })] }));
}
