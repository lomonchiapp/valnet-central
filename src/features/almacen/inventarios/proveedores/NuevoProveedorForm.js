import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { database } from '@/firebase';
import { addDoc, collection, serverTimestamp, updateDoc, doc, } from 'firebase/firestore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose, } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
export function NuevoProveedorForm({ open, onOpenChange, onProveedorCreado, }) {
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset, } = useForm();
    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const docRef = await addDoc(collection(database, 'proveedores'), {
                ...data,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            await updateDoc(doc(database, 'proveedores', docRef.id), {
                id: docRef.id,
            });
            const nuevoProveedor = {
                id: docRef.id,
                ...data,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            toast.success(`Proveedor "${data.nombre}" creado exitosamente.`);
            if (onProveedorCreado) {
                onProveedorCreado(nuevoProveedor);
            }
            reset();
            onOpenChange(false);
        }
        catch (error) {
            //eslint-disable-next-line no-console
            console.error('Error creando proveedor:', error);
            toast.error('Error al crear el proveedor. Intente nuevamente.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleDialogClose = () => {
        if (!isLoading) {
            reset();
            onOpenChange(false);
        }
    };
    return (_jsx(Dialog, { open: open, onOpenChange: handleDialogClose, children: _jsxs(DialogContent, { className: 'sm:max-w-[425px]', children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Crear Nuevo Proveedor" }), _jsx(DialogDescription, { children: "Ingrese los datos del proveedor para agregarlo al sistema." })] }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: 'space-y-4 py-2', children: [_jsxs("div", { children: [_jsxs(Label, { htmlFor: 'nombreProveedor', children: ["Nombre ", _jsx("span", { className: 'text-destructive', children: "*" })] }), _jsx(Input, { id: 'nombreProveedor', placeholder: 'Ej: Suministros S.A.', ...register('nombre', { required: 'El nombre es obligatorio.' }), className: errors.nombre ? 'border-destructive' : '', disabled: isLoading }), errors.nombre && (_jsx("p", { className: 'text-xs text-destructive mt-1', children: errors.nombre.message }))] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: 'direccionProveedor', children: "Direcci\u00F3n" }), _jsx(Input, { id: 'direccionProveedor', placeholder: 'Direcci\u00F3n f\u00EDsica', ...register('direccion'), disabled: isLoading })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: 'telefonoProveedor', children: "Tel\u00E9fono" }), _jsx(Input, { id: 'telefonoProveedor', placeholder: 'Ej: +52 123 456 7890', ...register('telefono'), disabled: isLoading })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: 'emailProveedor', children: "Email" }), _jsx(Input, { id: 'emailProveedor', placeholder: 'correo@ejemplo.com', type: 'email', ...register('email'), disabled: isLoading })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: 'contactoProveedor', children: "Contacto" }), _jsx(Input, { id: 'contactoProveedor', placeholder: 'Persona de contacto', ...register('contacto'), disabled: isLoading })] }), _jsxs(DialogFooter, { children: [_jsx(DialogClose, { asChild: true, children: _jsx(Button, { type: 'button', variant: 'outline', disabled: isLoading, children: "Cancelar" }) }), _jsx(Button, { type: 'submit', disabled: isLoading, children: isLoading ? 'Guardando...' : 'Guardar Proveedor' })] })] })] }) }));
}
