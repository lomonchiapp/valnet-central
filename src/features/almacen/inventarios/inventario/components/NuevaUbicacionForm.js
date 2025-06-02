import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Warehouse } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAlmacenState } from '@/context/global/useAlmacenState';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUbicaciones } from '../hooks/useUbicaciones';
export function NuevaUbicacionForm({ open, onOpenChange, onUbicacionCreada, ubicacionToEdit, }) {
    const { crearUbicacion, actualizarUbicacion, isLoading, error } = useUbicaciones();
    const { inventarios } = useAlmacenState();
    const { register, handleSubmit, formState: { errors }, reset, setValue, watch, } = useForm({
        defaultValues: {
            nombre: '',
            idInventario: '',
        },
    });
    const selectedInventario = watch('idInventario');
    // Set form values when editing an existing location
    useEffect(() => {
        if (ubicacionToEdit && open) {
            setValue('nombre', ubicacionToEdit.nombre);
            setValue('idInventario', ubicacionToEdit.idInventario);
        }
        else if (!ubicacionToEdit && open) {
            reset();
        }
    }, [ubicacionToEdit, open, setValue, reset]);
    const onSubmit = async (data) => {
        if (!data.idInventario) {
            toast.error('Debes seleccionar un inventario');
            return;
        }
        // If we're editing an existing location
        if (ubicacionToEdit) {
            const success = await actualizarUbicacion({
                id: ubicacionToEdit.id,
                nombre: data.nombre,
                idInventario: data.idInventario,
            });
            if (success) {
                toast.success(`Ubicación "${data.nombre}" actualizada correctamente`);
                reset();
                onOpenChange(false);
                if (onUbicacionCreada) {
                    onUbicacionCreada(ubicacionToEdit.id, data.nombre);
                }
            }
            else if (error) {
                toast.error(error);
            }
        }
        else {
            // Creating a new location
            const ubicacion = await crearUbicacion({
                nombre: data.nombre,
                idInventario: data.idInventario,
            });
            if (ubicacion) {
                toast.success(`Ubicación "${data.nombre}" creada correctamente`);
                reset();
                onOpenChange(false);
                if (onUbicacionCreada) {
                    onUbicacionCreada(ubicacion.id, ubicacion.nombre);
                }
            }
            else if (error) {
                toast.error(error);
            }
        }
    };
    const handleDialogClose = () => {
        if (!isLoading) {
            reset();
            onOpenChange(false);
        }
    };
    const isEditMode = !!ubicacionToEdit;
    return (_jsx(Dialog, { open: open, onOpenChange: handleDialogClose, children: _jsxs(DialogContent, { className: 'sm:max-w-[600px]', children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: isEditMode ? 'Editar Ubicación' : 'Nueva Ubicación' }), _jsx(DialogDescription, { children: isEditMode
                                ? 'Modifica los detalles de la ubicación seleccionada.'
                                : 'Crea una nueva ubicación para los artículos en el inventario.' })] }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), children: [_jsxs("div", { className: 'grid gap-6 py-4', children: [_jsxs("div", { className: 'grid grid-cols-4 items-center gap-4', children: [_jsx(Label, { htmlFor: 'nombre', className: 'text-right', children: "Nombre" }), _jsx(Input, { id: 'nombre', className: 'col-span-3', ...register('nombre', {
                                                required: 'El nombre es obligatorio',
                                                minLength: {
                                                    value: 2,
                                                    message: 'El nombre debe tener al menos 2 caracteres',
                                                },
                                            }) }), errors.nombre && (_jsx("p", { className: 'text-destructive text-sm col-start-2 col-span-3', children: errors.nombre.message }))] }), _jsxs("div", { className: 'space-y-4', children: [_jsx(Label, { className: 'text-right', children: "Seleccionar Inventario" }), _jsx("div", { className: 'grid grid-cols-1 md:grid-cols-2 gap-4', children: inventarios.map((inventario) => (_jsx(Card, { className: cn('p-4 cursor-pointer transition-colors hover:bg-accent', selectedInventario === inventario.id &&
                                                    'border-primary bg-accent'), onClick: () => setValue('idInventario', inventario.id), children: _jsxs("div", { className: 'flex items-center space-x-3', children: [_jsx(Warehouse, { className: 'h-5 w-5 text-muted-foreground' }), _jsxs("div", { children: [_jsx("h4", { className: 'font-medium', children: inventario.nombre }), _jsx("p", { className: 'text-sm text-muted-foreground', children: inventario.descripcion })] })] }) }, inventario.id))) }), errors.idInventario && (_jsx("p", { className: 'text-destructive text-sm', children: errors.idInventario.message }))] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: 'button', variant: 'outline', onClick: handleDialogClose, disabled: isLoading, children: "Cancelar" }), _jsxs(Button, { type: 'submit', disabled: isLoading, children: [isLoading && _jsx(Loader2, { className: 'mr-2 h-4 w-4 animate-spin' }), isEditMode ? 'Actualizar Ubicación' : 'Crear Ubicación'] })] })] })] }) }));
}
