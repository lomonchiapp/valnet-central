import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TipoMovimiento } from '@/types/interfaces/almacen/movimiento';
import { Loader2, ChevronsUpDown, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAlmacenState } from '@/context/global/useAlmacenState';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from '@/components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger, } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useSalidaArticulo } from '../hooks/useSalidaArticulo';
export function SalidaArticuloForm({ articulo, inventarioId, open, onOpenChange, onSalidaCompletada, usuarioId, }) {
    const { realizarSalida, realizarTransferencia, isLoading } = useSalidaArticulo();
    const { inventarios, ubicaciones, subscribeToInventarios, subscribeToUbicaciones, } = useAlmacenState();
    const [openUbicacionCombobox, setOpenUbicacionCombobox] = useState(false);
    const [searchValueUbicacion, setSearchValueUbicacion] = useState('');
    // Validate articulo is complete and valid
    useEffect(() => {
        if (open && (!articulo || !articulo.id)) {
            toast.error('Error: Artículo no válido');
            onOpenChange(false);
        }
    }, [open, articulo, onOpenChange]);
    // Subscribe to inventarios and ubicaciones
    useEffect(() => {
        const unsubInventarios = subscribeToInventarios();
        const unsubUbicaciones = subscribeToUbicaciones();
        return () => {
            unsubInventarios();
            unsubUbicaciones();
        };
    }, [subscribeToInventarios, subscribeToUbicaciones]);
    const { register, handleSubmit, control, watch, formState: { errors }, reset, } = useForm({
        defaultValues: {
            cantidad: 1,
            tipoMovimiento: TipoMovimiento.SALIDA,
            inventarioDestino: '',
            ubicacionDestino: '',
            descripcion: '',
        },
    });
    const tipoMovimientoSeleccionado = watch('tipoMovimiento');
    const esTransferencia = tipoMovimientoSeleccionado === TipoMovimiento.TRANSFERENCIA;
    const onSubmit = async (data) => {
        // Check if articulo and articulo.id exist
        if (!articulo || !articulo.id) {
            toast.error('Error: No se ha seleccionado un artículo válido');
            return;
        }
        const params = {
            articuloId: articulo.id,
            inventarioOrigenId: inventarioId,
            inventarioDestinoId: esTransferencia ? data.inventarioDestino : undefined,
            cantidad: data.cantidad,
            descripcion: data.descripcion,
            ubicacionDestino: esTransferencia ? data.ubicacionDestino : undefined,
            usuarioId,
        };
        let resultado;
        try {
            if (esTransferencia) {
                resultado = await realizarTransferencia(params);
            }
            else {
                resultado = await realizarSalida(params);
            }
            if (resultado.success) {
                toast.success(resultado.message);
                reset();
                onOpenChange(false);
                if (onSalidaCompletada) {
                    onSalidaCompletada();
                }
            }
            else {
                toast.error(resultado.message);
            }
        }
        catch (error) {
            toast.error('Error inesperado: ' +
                (error instanceof Error ? error.message : 'Desconocido'));
        }
    };
    const handleDialogClose = () => {
        if (!isLoading) {
            reset();
            onOpenChange(false);
        }
    };
    // Filter out the current inventory from the destination options
    const inventariosDestino = inventarios.filter((inv) => inv.id !== inventarioId);
    return (_jsx(Dialog, { open: open, onOpenChange: handleDialogClose, children: _jsxs(DialogContent, { className: 'sm:max-w-[500px]', children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: esTransferencia
                                ? 'Transferir Artículo'
                                : 'Registrar Salida de Artículo' }), _jsxs(DialogDescription, { children: [articulo.nombre, " - ", articulo.marca, " ", articulo.modelo, _jsxs("div", { className: 'mt-1 text-sm', children: ["Disponible:", ' ', _jsx("span", { className: 'font-semibold', children: articulo.cantidad }), ' ', articulo.unidad] })] })] }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), children: [_jsxs("div", { className: 'grid gap-4 py-4', children: [_jsxs("div", { className: 'grid grid-cols-4 items-center gap-4', children: [_jsx(Label, { htmlFor: 'tipoMovimiento', className: 'text-right', children: "Tipo" }), _jsx(Controller, { control: control, name: 'tipoMovimiento', render: ({ field }) => (_jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, disabled: isLoading, children: [_jsx(SelectTrigger, { className: 'col-span-3', children: _jsx(SelectValue, { placeholder: 'Seleccionar tipo de movimiento' }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: TipoMovimiento.SALIDA, children: "Salida" }), _jsx(SelectItem, { value: TipoMovimiento.TRANSFERENCIA, children: "Transferencia" })] })] })) })] }), _jsxs("div", { className: 'grid grid-cols-4 items-center gap-4', children: [_jsx(Label, { htmlFor: 'cantidad', className: 'text-right', children: "Cantidad" }), _jsx(Input, { id: 'cantidad', type: 'number', min: '1', max: articulo.cantidad, className: 'col-span-3', ...register('cantidad', {
                                                required: 'La cantidad es obligatoria',
                                                min: {
                                                    value: 1,
                                                    message: 'La cantidad debe ser al menos 1',
                                                },
                                                max: {
                                                    value: articulo.cantidad,
                                                    message: `La cantidad no puede ser mayor a ${articulo.cantidad}`,
                                                },
                                                valueAsNumber: true,
                                            }), disabled: isLoading }), errors.cantidad && (_jsx("p", { className: 'text-destructive text-sm col-start-2 col-span-3', children: errors.cantidad.message }))] }), esTransferencia && (_jsxs(_Fragment, { children: [_jsxs("div", { className: 'grid grid-cols-4 items-center gap-4', children: [_jsx(Label, { htmlFor: 'inventarioDestino', className: 'text-right', children: "Destino" }), _jsx(Controller, { control: control, name: 'inventarioDestino', rules: { required: 'El inventario destino es obligatorio' }, render: ({ field }) => (_jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, disabled: isLoading, children: [_jsx(SelectTrigger, { className: cn('col-span-3', errors.inventarioDestino && 'border-destructive'), children: _jsx(SelectValue, { placeholder: 'Seleccionar inventario destino' }) }), _jsx(SelectContent, { children: inventariosDestino.map((inv) => (_jsx(SelectItem, { value: inv.id, children: inv.nombre }, inv.id))) })] })) }), errors.inventarioDestino && (_jsx("p", { className: 'text-destructive text-sm col-start-2 col-span-3', children: errors.inventarioDestino.message }))] }), _jsxs("div", { className: 'grid grid-cols-4 items-center gap-4', children: [_jsx(Label, { htmlFor: 'ubicacionDestino', className: 'text-right', children: "Ubicaci\u00F3n" }), _jsx("div", { className: 'col-span-3', children: _jsx(Controller, { name: 'ubicacionDestino', control: control, render: ({ field }) => (_jsxs(Popover, { open: openUbicacionCombobox, onOpenChange: setOpenUbicacionCombobox, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: 'outline', role: 'combobox', "aria-expanded": openUbicacionCombobox, className: 'w-full justify-between', disabled: isLoading, children: [field.value
                                                                                ? ubicaciones.find((u) => u.id === field.value)
                                                                                    ?.nombre || field.value
                                                                                : '-- Seleccionar ubicación --', _jsx(ChevronsUpDown, { className: 'ml-2 h-4 w-4 shrink-0 opacity-50' })] }) }), _jsx(PopoverContent, { className: 'w-[--radix-popover-trigger-width] p-0', children: _jsxs(Command, { children: [_jsx(CommandInput, { placeholder: 'Buscar ubicaci\u00F3n...', value: searchValueUbicacion, onValueChange: setSearchValueUbicacion }), _jsxs(CommandList, { children: [_jsx(CommandEmpty, { children: searchValueUbicacion === ''
                                                                                            ? 'Escriba para buscar.'
                                                                                            : `No se encontró la ubicación "${searchValueUbicacion}".` }), _jsx(CommandGroup, { children: ubicaciones
                                                                                            .filter((u) => u.nombre
                                                                                            .toLowerCase()
                                                                                            .includes(searchValueUbicacion.toLowerCase()))
                                                                                            .sort((a, b) => a.nombre.localeCompare(b.nombre))
                                                                                            .map((u) => (_jsxs(CommandItem, { value: u.id, onSelect: (currentValue) => {
                                                                                                field.onChange(currentValue === field.value
                                                                                                    ? ''
                                                                                                    : currentValue);
                                                                                                setOpenUbicacionCombobox(false);
                                                                                                setSearchValueUbicacion('');
                                                                                            }, children: [_jsx(Check, { className: cn('mr-2 h-4 w-4', field.value === u.id
                                                                                                        ? 'opacity-100'
                                                                                                        : 'opacity-0') }), u.nombre] }, u.id))) })] })] }) })] })) }) })] })] })), _jsxs("div", { className: 'grid grid-cols-4 items-start gap-4', children: [_jsx(Label, { htmlFor: 'descripcion', className: 'text-right pt-2', children: "Descripci\u00F3n" }), _jsx(Textarea, { id: 'descripcion', className: 'col-span-3', rows: 3, ...register('descripcion', {
                                                required: 'La descripción es obligatoria',
                                            }), placeholder: esTransferencia
                                                ? 'Motivo de la transferencia'
                                                : 'Motivo de la salida, destino, etc.', disabled: isLoading }), errors.descripcion && (_jsx("p", { className: 'text-destructive text-sm col-start-2 col-span-3', children: errors.descripcion.message }))] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: 'button', variant: 'outline', onClick: handleDialogClose, disabled: isLoading, children: "Cancelar" }), _jsxs(Button, { type: 'submit', disabled: isLoading, children: [isLoading && _jsx(Loader2, { className: 'mr-2 h-4 w-4 animate-spin' }), esTransferencia ? 'Transferir' : 'Registrar Salida'] })] })] })] }) }));
}
