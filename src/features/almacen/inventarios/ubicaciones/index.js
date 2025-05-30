import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { database } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAlmacenState } from '@/context/global/useAlmacenState';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { NuevaUbicacionForm } from '../inventario/components/NuevaUbicacionForm';
export default function Ubicaciones() {
    const { ubicaciones, subscribeToUbicaciones } = useAlmacenState();
    const [showNewForm, setShowNewForm] = useState(false);
    const [editingUbicacion, setEditingUbicacion] = useState(null);
    const [deletingUbicacion, setDeletingUbicacion] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    useEffect(() => {
        const unsubscribe = subscribeToUbicaciones();
        return () => unsubscribe();
    }, [subscribeToUbicaciones]);
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
            //eslint-disable-next-line no-console
            console.error(err);
            toast.error('Error al eliminar la ubicación');
        }
        finally {
            setIsDeleting(false);
        }
    };
    const sortedUbicaciones = [...ubicaciones].sort((a, b) => a.nombre.localeCompare(b.nombre));
    return (_jsxs("div", { className: 'space-y-6', children: [_jsxs("div", { className: 'flex justify-between items-center', children: [_jsxs("div", { children: [_jsx("h1", { className: 'text-3xl font-bold tracking-tight', children: "Ubicaciones" }), _jsx("p", { className: 'text-muted-foreground', children: "Administra las ubicaciones f\u00EDsicas para organizar el inventario." })] }), _jsxs(Button, { onClick: () => setShowNewForm(true), children: [_jsx(PlusCircle, { className: 'mr-2 h-4 w-4' }), "Nueva Ubicaci\u00F3n"] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Ubicaciones Registradas" }), _jsx(CardDescription, { children: "Lista de todas las ubicaciones disponibles para asignar a art\u00EDculos." })] }), _jsx(CardContent, { children: sortedUbicaciones.length === 0 ? (_jsx("p", { className: 'text-center py-8 text-muted-foreground', children: "No hay ubicaciones registradas. Crea una nueva para comenzar." })) : (_jsx(ScrollArea, { className: 'h-[500px]', children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Nombre" }), _jsx(TableHead, { children: "Fecha de Creaci\u00F3n" }), _jsx(TableHead, { className: 'text-right', children: "Acciones" })] }) }), _jsx(TableBody, { children: sortedUbicaciones.map((ubicacion) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: 'font-medium', children: ubicacion.nombre }), _jsx(TableCell, { children: ubicacion.createdAt instanceof Date
                                                        ? ubicacion.createdAt.toLocaleDateString()
                                                        : new Date(ubicacion.createdAt).toLocaleDateString() }), _jsx(TableCell, { className: 'text-right', children: _jsxs("div", { className: 'flex justify-end space-x-2', children: [_jsx(Button, { variant: 'ghost', size: 'icon', onClick: () => setEditingUbicacion(ubicacion), children: _jsx(Pencil, { className: 'h-4 w-4' }) }), _jsx(Button, { variant: 'ghost', size: 'icon', onClick: () => setDeletingUbicacion(ubicacion), children: _jsx(Trash2, { className: 'h-4 w-4' }) })] }) })] }, ubicacion.id))) })] }) })) })] }), _jsx(NuevaUbicacionForm, { open: showNewForm, onOpenChange: setShowNewForm, onUbicacionCreada: () => {
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
