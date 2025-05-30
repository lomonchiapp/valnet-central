import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useForm, Controller } from 'react-hook-form';
import { TipoInventario } from 'shared-types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useNewInventory } from '../hooks/useNewInventory';
export const NewInventoryForm = ({ onClose, onSuccess, }) => {
    const { createInventory, isLoading, error } = useNewInventory();
    const { control, handleSubmit, formState: { errors }, reset, } = useForm({
        defaultValues: {
            nombre: '',
            descripcion: '',
            tipo: undefined, // o TipoInventario.LOCAL si quieres un default
        },
    });
    const onSubmit = async (data) => {
        // Asegurarse de que el tipo es uno de los valores del enum TipoInventario
        if (!Object.values(TipoInventario).includes(data.tipo)) {
            toast.error('Tipo de inventario inválido');
            return;
        }
        const newInventoryId = await createInventory(data);
        if (newInventoryId) {
            toast.success('Inventario creado exitosamente!');
            reset(); // Limpia el formulario
            if (onSuccess) {
                onSuccess(newInventoryId);
            }
            onClose(); // Cierra el modal
        }
        else {
            toast.error('Error al crear el inventario. ' + (error?.message || ''));
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit(onSubmit), className: 'space-y-4', children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Crear Nuevo Inventario" }), _jsx(DialogDescription, { children: "Completa los detalles para registrar un nuevo inventario. Si es el primero, considera nombrarlo \"Inventario Principal\" y tipo \"Local\"." })] }), _jsxs("div", { className: 'grid gap-4 py-2', children: [_jsxs("div", { className: 'grid grid-cols-4 items-center gap-4', children: [_jsx(Label, { htmlFor: 'nombre', className: 'text-right col-span-1', children: "Nombre" }), _jsx(Controller, { name: 'nombre', control: control, rules: { required: 'El nombre es obligatorio' }, render: ({ field }) => (_jsx(Input, { id: 'nombre', ...field, placeholder: 'Ej: Inventario Principal', className: 'col-span-3' })) })] }), errors.nombre && (_jsx("p", { className: 'text-red-500 text-xs col-start-2 col-span-3', children: errors.nombre.message })), _jsxs("div", { className: 'grid grid-cols-4 items-center gap-4', children: [_jsx(Label, { htmlFor: 'tipo', className: 'text-right col-span-1', children: "Tipo" }), _jsx(Controller, { name: 'tipo', control: control, rules: { required: 'El tipo es obligatorio' }, render: ({ field }) => (_jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, value: field.value, children: [_jsx(SelectTrigger, { className: 'col-span-3', children: _jsx(SelectValue, { placeholder: 'Selecciona un tipo' }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: TipoInventario.LOCAL, children: "Local (Ej: Principal, Cocina, Almac\u00E9n)" }), _jsx(SelectItem, { value: TipoInventario.BRIGADA, children: "Brigada" })] })] })) })] }), errors.tipo && (_jsx("p", { className: 'text-red-500 text-xs col-start-2 col-span-3', children: errors.tipo.message })), _jsxs("div", { className: 'grid grid-cols-4 items-start gap-4', children: [' ', _jsx(Label, { htmlFor: 'descripcion', className: 'text-right col-span-1 pt-2', children: "Descripci\u00F3n" }), _jsx(Controller, { name: 'descripcion', control: control, rules: {
                                    maxLength: {
                                        value: 500,
                                        message: 'La descripción no puede exceder los 500 caracteres',
                                    },
                                }, render: ({ field }) => (_jsx(Textarea, { id: 'descripcion', ...field, placeholder: 'Opcional: Breve descripci\u00F3n del prop\u00F3sito del inventario', className: 'col-span-3 min-h-[80px]' })) })] }), errors.descripcion && (_jsx("p", { className: 'text-red-500 text-xs col-start-2 col-span-3', children: errors.descripcion.message }))] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: 'button', variant: 'outline', onClick: onClose, disabled: isLoading, children: "Cancelar" }), _jsx(Button, { type: 'submit', disabled: isLoading, children: isLoading ? 'Guardando...' : 'Guardar Inventario' })] })] }));
};
