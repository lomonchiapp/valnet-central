import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { database } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { PlusCircle, Pencil, Trash2, Warehouse } from 'lucide-react';
import { toast } from 'sonner';
import { useAlmacenState } from '@/context/global/useAlmacenState';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { NuevaUbicacionForm } from '../inventario/components/NuevaUbicacionForm';
export default function Ubicaciones() {
    const { ubicaciones, inventarios, subscribeToUbicaciones, subscribeToInventarios, } = useAlmacenState();
    const [showNewForm, setShowNewForm] = useState(false);
    const [editingUbicacion, setEditingUbicacion] = useState(null);
    const [deletingUbicacion, setDeletingUbicacion] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedInventario, setSelectedInventario] = useState('todos');
    useEffect(() => {
        const unsubscribeUbicaciones = subscribeToUbicaciones();
        const unsubscribeInventarios = subscribeToInventarios();
        return () => {
            unsubscribeUbicaciones();
            unsubscribeInventarios();
        };
    }, [subscribeToUbicaciones, subscribeToInventarios]);
    const handleDelete = async () => {
        if (!deletingUbicacion)
            return;
        setIsDeleting(true);
        try {
            await deleteDoc(doc(database, 'ubicaciones', deletingUbicacion.id));
            toast.success(`Ubicación "${deletingUbicacion.nombre}" eliminada`);
            setDeletingUbicacion(null);
        }
        catch (err) {
            console.error(err);
            toast.error('Error al eliminar la ubicación');
        }
        finally {
            setIsDeleting(false);
        }
    };
    const getInventarioNombre = (idInventario) => {
        const inventario = inventarios.find((inv) => inv.id === idInventario);
        return inventario?.nombre || 'Inventario no encontrado';
    };
    const filteredUbicaciones = selectedInventario === 'todos'
        ? ubicaciones
        : ubicaciones.filter((u) => u.idInventario === selectedInventario);
    const sortedUbicaciones = [...filteredUbicaciones].sort((a, b) => a.nombre.localeCompare(b.nombre));
    const groupedUbicaciones = sortedUbicaciones.reduce((acc, ubicacion) => {
        const inventarioId = ubicacion.idInventario;
        if (!acc[inventarioId]) {
            acc[inventarioId] = [];
        }
        acc[inventarioId].push(ubicacion);
        return acc;
    }, {});
    return (_jsxs("div", { className: 'space-y-6', children: [_jsxs("div", { className: 'flex justify-between items-center', children: [_jsxs("div", { children: [_jsx("h1", { className: 'text-3xl font-bold tracking-tight', children: "Ubicaciones de Almac\u00E9n" }), _jsx("p", { className: 'text-muted-foreground', children: "Administra las ubicaciones f\u00EDsicas para organizar el inventario." })] }), _jsxs(Button, { onClick: () => setShowNewForm(true), children: [_jsx(PlusCircle, { className: 'mr-2 h-4 w-4' }), "Nueva Ubicaci\u00F3n"] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: 'flex justify-between items-center', children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Ubicaciones Registradas" }), _jsx(CardDescription, { children: "Lista de todas las ubicaciones disponibles para asignar a art\u00EDculos." })] }), _jsxs(Select, { value: selectedInventario, onValueChange: setSelectedInventario, children: [_jsx(SelectTrigger, { className: 'w-[200px]', children: _jsx(SelectValue, { placeholder: 'Filtrar por inventario' }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: 'todos', children: "Todos los inventarios" }), inventarios.map((inventario) => (_jsx(SelectItem, { value: inventario.id, children: inventario.nombre }, inventario.id)))] })] })] }) }), _jsx(CardContent, { children: sortedUbicaciones.length === 0 ? (_jsx("p", { className: 'text-center py-8 text-muted-foreground', children: "No hay ubicaciones registradas. Crea una nueva para comenzar." })) : (_jsx(ScrollArea, { className: 'h-[600px]', children: selectedInventario === 'todos' ? (
                            // Mostrar agrupado por inventario
                            _jsx("div", { className: 'space-y-6 p-4', children: Object.entries(groupedUbicaciones).map(([inventarioId, ubicaciones]) => (_jsxs("div", { className: 'space-y-4', children: [_jsx("h3", { className: 'text-lg font-semibold text-muted-foreground', children: getInventarioNombre(inventarioId) }), _jsx("div", { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', children: ubicaciones.map((ubicacion) => (_jsx(Card, { className: 'relative group', children: _jsx(CardHeader, { className: 'pb-2', children: _jsxs("div", { className: 'flex items-center justify-between', children: [_jsxs("div", { className: 'flex items-center space-x-2', children: [_jsx(Warehouse, { className: 'h-5 w-5 text-muted-foreground' }), _jsx(CardTitle, { className: 'text-lg', children: ubicacion.nombre })] }), _jsxs("div", { className: 'flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity', children: [_jsx(Button, { variant: 'ghost', size: 'icon', onClick: () => setEditingUbicacion(ubicacion), className: 'h-8 w-8', children: _jsx(Pencil, { className: 'h-4 w-4' }) }), _jsx(Button, { variant: 'ghost', size: 'icon', onClick: () => setDeletingUbicacion(ubicacion), className: 'h-8 w-8', children: _jsx(Trash2, { className: 'h-4 w-4' }) })] })] }) }) }, ubicacion.id))) })] }, inventarioId))) })) : (
                            // Mostrar solo las ubicaciones del inventario seleccionado
                            _jsx("div", { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4', children: sortedUbicaciones.map((ubicacion) => (_jsx(Card, { className: 'relative group', children: _jsx(CardHeader, { className: 'pb-2', children: _jsxs("div", { className: 'flex items-center justify-between', children: [_jsxs("div", { className: 'flex items-center space-x-2', children: [_jsx(Warehouse, { className: 'h-5 w-5 text-muted-foreground' }), _jsx(CardTitle, { className: 'text-lg', children: ubicacion.nombre })] }), _jsxs("div", { className: 'flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity', children: [_jsx(Button, { variant: 'ghost', size: 'icon', onClick: () => setEditingUbicacion(ubicacion), className: 'h-8 w-8', children: _jsx(Pencil, { className: 'h-4 w-4' }) }), _jsx(Button, { variant: 'ghost', size: 'icon', onClick: () => setDeletingUbicacion(ubicacion), className: 'h-8 w-8', children: _jsx(Trash2, { className: 'h-4 w-4' }) })] })] }) }) }, ubicacion.id))) })) })) })] }), _jsx(NuevaUbicacionForm, { open: showNewForm, onOpenChange: setShowNewForm, onUbicacionCreada: () => {
                    setShowNewForm(false);
                    toast.success('Ubicación creada exitosamente');
                } }), editingUbicacion && (_jsx(NuevaUbicacionForm, { open: !!editingUbicacion, onOpenChange: (open) => {
                    if (!open)
                        setEditingUbicacion(null);
                }, ubicacionToEdit: editingUbicacion, onUbicacionCreada: () => {
                    setEditingUbicacion(null);
                    toast.success('Ubicación actualizada exitosamente');
                } })), _jsx(AlertDialog, { open: !!deletingUbicacion, onOpenChange: (open) => !open && setDeletingUbicacion(null), children: _jsxs(AlertDialogContent, { children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { children: "\u00BFEst\u00E1s seguro?" }), _jsxs(AlertDialogDescription, { children: ["Esta acci\u00F3n eliminar\u00E1 la ubicaci\u00F3n \"", deletingUbicacion?.nombre, "\". Esta acci\u00F3n no se puede deshacer."] })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { disabled: isDeleting, children: "Cancelar" }), _jsx(AlertDialogAction, { onClick: handleDelete, disabled: isDeleting, className: 'bg-destructive text-destructive-foreground', children: isDeleting ? 'Eliminando...' : 'Eliminar' })] })] }) })] }));
}
