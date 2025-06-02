import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAlmacenState } from '@/context/global/useAlmacenState';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useActualizarArticulo } from '../hooks/useActualizarArticulo';
export function EditEquipoForm({ equipo, open, onOpenChange, onEquipoUpdated, }) {
    const [isLoading, setIsLoading] = useState(false);
    // Get marcas from global state
    const { marcas, subscribeToMarcas } = useAlmacenState();
    // Use our new hook
    const { actualizarArticulo, error: updateError } = useActualizarArticulo();
    // Subscribe to marcas on component mount
    useEffect(() => {
        const unsubscribe = subscribeToMarcas();
        return () => unsubscribe();
    }, [subscribeToMarcas]);
    // Function to get brand name from brand ID
    const getBrandName = (brandId) => {
        const brand = marcas.find((m) => m.id === brandId);
        return brand ? brand.nombre : brandId;
    };
    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            serial: equipo?.serial || '',
            descripcion: equipo?.descripcion || '',
            ubicacion: equipo?.ubicacion || '',
            mac: equipo?.mac || '',
            wirelessKey: equipo?.wirelessKey || '',
            garantia: equipo?.garantia || 0,
            costo: equipo?.costo || 0,
        },
    });
    // Reset form when equipo changes
    useState(() => {
        if (equipo) {
            reset({
                serial: equipo.serial || '',
                descripcion: equipo.descripcion || '',
                ubicacion: equipo.ubicacion || '',
                mac: equipo.mac || '',
                wirelessKey: equipo.wirelessKey || '',
                garantia: equipo.garantia || 0,
                costo: equipo.costo || 0,
            });
        }
    });
    const onSubmit = async (data) => {
        if (!equipo)
            return;
        setIsLoading(true);
        try {
            const success = await actualizarArticulo({
                id: equipo.id,
                serial: data.serial,
                descripcion: data.descripcion,
                ubicacion: data.ubicacion,
                mac: data.mac,
                wirelessKey: data.wirelessKey,
                garantia: data.garantia,
                costo: data.costo,
            });
            if (success) {
                toast.success('Equipo actualizado correctamente');
                onOpenChange(false);
                if (onEquipoUpdated)
                    onEquipoUpdated();
            }
            else {
                toast.error('Error al actualizar el equipo');
            }
        }
        catch {
            toast.error('Error al actualizar el equipo');
        }
        finally {
            setIsLoading(false);
        }
    };
    // Show error toast if update error occurs
    useEffect(() => {
        if (updateError) {
            toast.error(`Error: ${updateError.message}`);
        }
    }, [updateError]);
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: 'sm:max-w-[500px]', children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Editar Equipo" }), _jsxs(DialogDescription, { children: [equipo?.nombre, " - ", equipo?.marca ? getBrandName(equipo.marca) : '', ' ', equipo?.modelo] })] }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), children: [_jsxs("div", { className: 'grid gap-4 py-4', children: [_jsxs("div", { className: 'grid grid-cols-4 items-center gap-4', children: [_jsx(Label, { htmlFor: 'serial', className: 'text-right', children: "N\u00FAmero de Serie" }), _jsx(Input, { id: 'serial', className: 'col-span-3', ...register('serial') })] }), _jsxs("div", { className: 'grid grid-cols-4 items-center gap-4', children: [_jsx(Label, { htmlFor: 'mac', className: 'text-right', children: "Direcci\u00F3n MAC" }), _jsx(Input, { id: 'mac', className: 'col-span-3 font-mono', ...register('mac') })] }), _jsxs("div", { className: 'grid grid-cols-4 items-center gap-4', children: [_jsx(Label, { htmlFor: 'wirelessKey', className: 'text-right', children: "Clave Wireless" }), _jsx(Input, { id: 'wirelessKey', className: 'col-span-3', ...register('wirelessKey') })] }), _jsxs("div", { className: 'grid grid-cols-4 items-center gap-4', children: [_jsx(Label, { htmlFor: 'ubicacion', className: 'text-right', children: "Ubicaci\u00F3n" }), _jsx(Input, { id: 'ubicacion', className: 'col-span-3', ...register('ubicacion') })] }), _jsxs("div", { className: 'grid grid-cols-4 items-center gap-4', children: [_jsx(Label, { htmlFor: 'garantia', className: 'text-right', children: "Garant\u00EDa (meses)" }), _jsx(Input, { id: 'garantia', type: 'number', className: 'col-span-3', ...register('garantia', { valueAsNumber: true }) })] }), _jsxs("div", { className: 'grid grid-cols-4 items-center gap-4', children: [_jsx(Label, { htmlFor: 'costo', className: 'text-right', children: "Costo" }), _jsx(Input, { id: 'costo', type: 'number', step: '0.01', className: 'col-span-3', ...register('costo', { valueAsNumber: true }) })] }), _jsxs("div", { className: 'grid grid-cols-4 items-start gap-4', children: [_jsx(Label, { htmlFor: 'descripcion', className: 'text-right pt-2', children: "Descripci\u00F3n" }), _jsx(Textarea, { id: 'descripcion', className: 'col-span-3', rows: 4, ...register('descripcion'), placeholder: 'Estado del equipo, observaciones, etc.' })] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: 'button', variant: 'outline', onClick: () => onOpenChange(false), children: "Cancelar" }), _jsxs(Button, { type: 'submit', disabled: isLoading, children: [isLoading && _jsx(Loader2, { className: 'mr-2 h-4 w-4 animate-spin' }), "Guardar Cambios"] })] })] })] }) }));
}
