import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { IconLock, IconLoader2 } from '@tabler/icons-react';
import { RoleUsuario, StatusUsuario, } from '@/types/interfaces/valnet/usuario';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle, DialogDescription, } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
export const UsuarioForm = ({ usuario, onSubmit, isLoading, onCancel, }) => {
    const [form, setForm] = useState({
        nombres: '',
        apellidos: '',
        email: '',
        role: RoleUsuario.VENDEDOR,
        cedula: '',
        status: StatusUsuario.OFFLINE,
        telefono: '',
        avatar: '',
        direccion: '',
        fechaNacimiento: '',
        password: '',
        confirmPassword: '',
        brigadaId: '',
        updatedAt: new Date(),
        createdAt: new Date(),
    });
    useEffect(() => {
        if (usuario) {
            setForm({
                nombres: usuario.nombres || '',
                avatar: usuario.avatar || '',
                apellidos: usuario.apellidos || '',
                email: usuario.email || '',
                role: usuario.role || RoleUsuario.VENDEDOR,
                cedula: usuario.cedula || '',
                status: usuario.status || StatusUsuario.OFFLINE,
                telefono: usuario.telefono || '',
                direccion: usuario.direccion || '',
                fechaNacimiento: usuario.fechaNacimiento || '',
                password: '',
                confirmPassword: '',
                brigadaId: usuario.brigadaId || '',
                updatedAt: usuario.updatedAt ? new Date(usuario.updatedAt) : new Date(),
                createdAt: usuario.createdAt ? new Date(usuario.createdAt) : new Date(),
            });
        }
    }, [usuario]);
    const handleChange = (field, value) => {
        setForm({
            ...form,
            [field]: value,
        });
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        // Validar contraseñas solo si se está creando o cambiando password
        if (form.password !== undefined && form.password !== form.confirmPassword) {
            toast({
                variant: 'destructive',
                title: 'Las contraseñas no coinciden',
                description: 'Verifica que ambas contraseñas sean iguales',
            });
            return;
        }
        // Validación básica de campos requeridos
        if (!form.nombres ||
            !form.apellidos ||
            !form.email ||
            !form.password ||
            !form.role) {
            toast({
                variant: 'destructive',
                title: 'Campos obligatorios faltantes',
                description: 'Completa todos los campos marcados con *',
            });
            return;
        }
        onSubmit(form);
    };
    return (_jsxs(_Fragment, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: usuario ? 'Editar Usuario' : 'Nuevo Usuario' }), _jsx(DialogDescription, { children: usuario
                            ? 'Edita los datos del usuario.'
                            : 'Agregar un nuevo usuario al sistema. Todos los campos marcados con * son obligatorios.' })] }), _jsxs("form", { onSubmit: handleSubmit, className: 'space-y-6 mt-4', children: [_jsxs("div", { className: 'space-y-4', children: [_jsxs("div", { className: 'grid grid-cols-2 gap-4', children: [_jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { htmlFor: 'nombres', children: "Nombre *" }), _jsx(Input, { id: 'nombres', value: form.nombres, onChange: (e) => handleChange('nombres', e.target.value), required: true })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { htmlFor: 'apellidos', children: "Apellido *" }), _jsx(Input, { id: 'apellidos', value: form.apellidos, onChange: (e) => handleChange('apellidos', e.target.value), required: true })] })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { htmlFor: 'email', children: "Email *" }), _jsx(Input, { id: 'email', type: 'email', value: form.email, onChange: (e) => handleChange('email', e.target.value), required: true })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { htmlFor: 'role', children: "Rol *" }), _jsxs(Select, { value: form.role, onValueChange: (value) => handleChange('role', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: 'Selecciona un rol' }) }), _jsx(SelectContent, { children: Object.values(RoleUsuario).map((role) => (_jsx(SelectItem, { value: role, children: role }, role))) })] })] })] }), _jsxs("div", { className: 'grid grid-cols-2 gap-4', children: [_jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { htmlFor: 'cedula', children: "C\u00E9dula" }), _jsx(Input, { id: 'cedula', value: form.cedula, onChange: (e) => handleChange('cedula', e.target.value) })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { htmlFor: 'telefono', children: "Tel\u00E9fono" }), _jsx(Input, { id: 'telefono', value: form.telefono, onChange: (e) => handleChange('telefono', e.target.value) })] })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { htmlFor: 'direccion', children: "Direcci\u00F3n" }), _jsx(Input, { id: 'direccion', value: form.direccion, onChange: (e) => handleChange('direccion', e.target.value) })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { htmlFor: 'fechaNacimiento', children: "Fecha de Nacimiento" }), _jsx(Input, { id: 'fechaNacimiento', type: 'date', value: form.fechaNacimiento, onChange: (e) => handleChange('fechaNacimiento', e.target.value) })] }), _jsxs("div", { className: 'grid grid-cols-2 gap-4', children: [_jsxs("div", { className: 'space-y-2', children: [_jsxs(Label, { htmlFor: 'password', children: ["Contrase\u00F1a ", usuario ? '' : '*'] }), _jsxs("div", { className: 'relative', children: [_jsx(Input, { id: 'password', type: 'password', value: form.password || '', onChange: (e) => handleChange('password', e.target.value), required: !usuario }), _jsx(IconLock, { size: 18, className: 'absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground' })] })] }), _jsxs("div", { className: 'space-y-2', children: [_jsxs(Label, { htmlFor: 'confirmPassword', children: ["Confirmar Contrase\u00F1a ", usuario ? '' : '*'] }), _jsx(Input, { id: 'confirmPassword', type: 'password', value: form.confirmPassword || '', onChange: (e) => handleChange('confirmPassword', e.target.value), required: !usuario })] })] }), _jsxs("div", { className: 'flex justify-end gap-2 pt-4', children: [_jsx(Button, { type: 'button', variant: 'outline', onClick: onCancel, children: "Cancelar" }), _jsx(Button, { type: 'submit', disabled: isLoading, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(IconLoader2, { size: 16, className: 'mr-2 animate-spin' }), "Guardando..."] })) : usuario ? ('Guardar Cambios') : ('Agregar Usuario') })] })] })] }));
};
