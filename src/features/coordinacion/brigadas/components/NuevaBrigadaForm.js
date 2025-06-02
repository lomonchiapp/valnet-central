import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { useAlmacenState } from '@/context/global/useAlmacenState';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
export const NuevaBrigadaForm = ({ onSubmit, onNewInventoryClick, }) => {
    const { inventarios, subscribeToInventarios } = useAlmacenState();
    const form = useForm({
        defaultValues: {
            nombre: '',
            matricula: '',
            inventarioId: '',
            coordenadas: {
                lat: 0,
                lng: 0,
            },
            kilometrajeActual: 0,
        },
    });
    useEffect(() => {
        const unsub = subscribeToInventarios();
        return () => unsub();
    }, [subscribeToInventarios]);
    const handleSubmit = form.handleSubmit(onSubmit);
    return (_jsx(Form, { ...form, children: _jsxs("form", { onSubmit: handleSubmit, className: 'space-y-4', children: [_jsx(FormField, { control: form.control, name: 'nombre', render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Nombre" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: 'Nombre de la brigada', ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: 'matricula', render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Matr\u00EDcula" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: 'Matr\u00EDcula del veh\u00EDculo', ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: 'inventarioId', render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Inventario Asignado" }), _jsxs("div", { className: 'flex gap-2', children: [_jsx("div", { className: 'flex-1', children: _jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, value: field.value, children: [_jsx(FormControl, { children: _jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: 'Seleccionar inventario' }) }) }), _jsx(SelectContent, { children: inventarios.map((inv) => (_jsx(SelectItem, { value: inv.id, children: inv.nombre }, inv.id))) })] }) }), _jsx(Button, { type: 'button', variant: 'outline', size: 'icon', className: 'h-10 w-10', onClick: onNewInventoryClick, children: _jsx(Plus, { className: 'h-4 w-4' }) })] }), _jsx(FormDescription, { children: "Inventario que se asignar\u00E1 a esta brigada para control de equipos y materiales" }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: 'kilometrajeActual', render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Kilometraje actual" }), _jsx(FormControl, { children: _jsx(Input, { type: 'number', min: 0, placeholder: 'Kilometraje actual del veh\u00EDculo', ...field }) }), _jsx(FormMessage, {})] })) }), _jsxs("div", { className: 'grid grid-cols-2 gap-4', children: [_jsx(FormField, { control: form.control, name: 'coordenadas.lat', render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Latitud" }), _jsx(FormControl, { children: _jsx(Input, { type: 'number', placeholder: 'Latitud', ...field, onChange: (e) => field.onChange(parseFloat(e.target.value)) }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: 'coordenadas.lng', render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Longitud" }), _jsx(FormControl, { children: _jsx(Input, { type: 'number', placeholder: 'Longitud', ...field, onChange: (e) => field.onChange(parseFloat(e.target.value)) }) }), _jsx(FormMessage, {})] })) })] }), _jsx(DialogFooter, { children: _jsx(Button, { type: 'submit', children: "Guardar Brigada" }) })] }) }));
};
