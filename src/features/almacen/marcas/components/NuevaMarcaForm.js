import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { database } from '@/firebase';
import { addDoc, collection, serverTimestamp, updateDoc, doc, } from 'firebase/firestore';
// Asumiendo que tienes un tipo Marca definido
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose, // Para cerrar el diálogo
 } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
export function NuevaMarcaForm({ open, onOpenChange, onMarcaCreada, }) {
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset, } = useForm();
    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const nombreMarcaNormalizado = data.nombre.trim();
            // Opcional: Verificar si la marca ya existe para evitar duplicados exactos (case-insensitive)
            // Esto requeriría una consulta a Firestore antes de agregar.
            const docRef = await addDoc(collection(database, 'marcas'), {
                nombre: nombreMarcaNormalizado,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                // Considera si necesitas más campos por defecto para una marca
                // No incluir el id aquí, se añadirá con updateDoc
            });
            // Actualizar el documento recién creado para incluir su propio ID
            await updateDoc(doc(database, 'marcas', docRef.id), {
                id: docRef.id,
            });
            const nuevaMarca = {
                id: docRef.id, // El ID ya está aquí
                nombre: nombreMarcaNormalizado,
                // createdAt y updatedAt serán establecidos por Firestore y actualizados por la suscripción global.
            };
            toast.success(`Marca "${nombreMarcaNormalizado}" creada exitosamente.`);
            if (onMarcaCreada) {
                onMarcaCreada(nuevaMarca); // Hacemos un type assertion aquí
            }
            reset();
            onOpenChange(false);
        }
        catch {
            toast.error('Error al crear la marca. Intente nuevamente.');
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
    return (_jsx(Dialog, { open: open, onOpenChange: handleDialogClose, children: _jsxs(DialogContent, { className: 'sm:max-w-[425px]', children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Crear Nueva Marca" }), _jsx(DialogDescription, { children: "Ingrese el nombre de la nueva marca para agregarla al sistema." })] }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: 'space-y-4 py-2', children: [_jsxs("div", { children: [_jsxs(Label, { htmlFor: 'nombreMarca', className: 'text-right', children: ["Nombre de la Marca ", _jsx("span", { className: 'text-destructive', children: "*" })] }), _jsx(Input, { id: 'nombreMarca', placeholder: 'Ej: Huawei, TP-Link, Cisco', ...register('nombre', {
                                        required: 'El nombre de la marca es obligatorio.',
                                        minLength: { value: 2, message: 'Mínimo 2 caracteres.' },
                                        pattern: {
                                            value: /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ .,'&()-]+$/, // Permitir más caracteres si es necesario
                                            message: 'Nombre de marca inválido.',
                                        },
                                    }), className: errors.nombre ? 'border-destructive' : '', disabled: isLoading }), errors.nombre && (_jsx("p", { className: 'text-xs text-destructive mt-1', children: errors.nombre.message }))] }), _jsxs(DialogFooter, { children: [_jsx(DialogClose, { asChild: true, children: _jsx(Button, { type: 'button', variant: 'outline', disabled: isLoading, children: "Cancelar" }) }), _jsx(Button, { type: 'submit', disabled: isLoading, children: isLoading ? 'Guardando...' : 'Guardar Marca' })] })] })] }) }));
}
