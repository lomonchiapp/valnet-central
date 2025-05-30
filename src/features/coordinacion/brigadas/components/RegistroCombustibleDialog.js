import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { database } from '@/firebase';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
export default function RegistroCombustibleDialog({ brigada, registro, modo = 'crear', onClose, }) {
    const form = useForm({
        defaultValues: {
            fecha: registro?.fecha || new Date().toISOString().slice(0, 10),
            galones: registro?.galones ?? 0,
            precio_galon: registro?.precio_galon ?? 0,
            km_inicial: registro?.km_inicial ?? 0,
            km_final: registro?.km_final ?? 0,
            referencia: registro?.referencia ?? '',
        },
    });
    useEffect(() => {
        if (brigada && modo === 'crear') {
            form.setValue('km_inicial', brigada.kilometrajeActual ?? 0);
        }
        if (registro && modo === 'editar') {
            form.setValue('km_inicial', registro.km_inicial);
        }
    }, [brigada, registro, modo, form]);
    const submitting = form.formState.isSubmitting;
    if (!brigada)
        return null;
    const onSubmit = async (values) => {
        if (modo === 'editar' && registro) {
            await updateDoc(doc(database, 'control_combustible', registro.id), {
                ...values,
                fecha: values.fecha,
                idbrigada: brigada.id,
                updatedAt: new Date(),
            });
            if (values.km_final !== registro.km_final) {
                await updateDoc(doc(database, 'brigadas', brigada.id), {
                    kilometrajeActual: values.km_final,
                    updatedAt: new Date(),
                });
            }
            if (onClose)
                onClose();
            return;
        }
        await addDoc(collection(database, 'control_combustible'), {
            ...values,
            fecha: values.fecha,
            idbrigada: brigada.id,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        await updateDoc(doc(database, 'brigadas', brigada.id), {
            kilometrajeActual: values.km_final,
            updatedAt: new Date(),
        });
        form.reset();
        if (onClose)
            onClose();
    };
    return (_jsxs(DialogContent, { className: 'sm:max-w-[500px]', children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: modo === 'editar'
                            ? 'Editar registro de combustible'
                            : 'Registrar carga de combustible' }), _jsxs(DialogDescription, { children: ["Brigada: ", _jsx("span", { className: 'font-semibold', children: brigada.nombre })] })] }), _jsx(Form, { ...form, children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: 'space-y-4', children: [_jsx(FormField, { control: form.control, name: 'fecha', render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Fecha" }), _jsx(FormControl, { children: _jsx(Input, { type: 'date', value: field.value, onChange: field.onChange }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: 'galones', render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Galones" }), _jsx(FormControl, { children: _jsx(Input, { type: 'number', min: 0, step: 0.01, ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: 'precio_galon', render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Precio por gal\u00F3n" }), _jsx(FormControl, { children: _jsx(Input, { type: 'number', min: 0, step: 0.01, ...field }) }), _jsx(FormMessage, {})] })) }), _jsxs("div", { className: 'grid grid-cols-2 gap-4', children: [_jsx(FormField, { control: form.control, name: 'km_inicial', render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Kilometraje inicial" }), _jsx(FormControl, { children: _jsx(Input, { type: 'number', min: 0, ...field, readOnly: true }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: 'km_final', rules: {
                                        validate: (value) => value >= form.getValues('km_inicial') ||
                                            'El kilometraje final no puede ser menor al inicial',
                                    }, render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Kilometraje final" }), _jsx(FormControl, { children: _jsx(Input, { type: 'number', min: form.getValues('km_inicial'), ...field }) }), _jsx(FormMessage, {})] })) })] }), _jsx(FormField, { control: form.control, name: 'referencia', render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Referencia" }), _jsx(FormControl, { children: _jsx(Input, { type: 'text', ...field }) }), _jsx(FormDescription, { children: "Ticket, factura o referencia de la carga" }), _jsx(FormMessage, {})] })) }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: 'submit', disabled: submitting, children: submitting
                                        ? modo === 'editar'
                                            ? 'Guardando...'
                                            : 'Registrando...'
                                        : modo === 'editar'
                                            ? 'Guardar cambios'
                                            : 'Registrar' }), onClose && (_jsx(Button, { type: 'button', variant: 'outline', onClick: onClose, disabled: submitting, children: "Cancelar" }))] })] }) })] }));
}
