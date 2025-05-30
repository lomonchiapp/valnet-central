import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { IconLoader2, IconMail } from '@tabler/icons-react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter, } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
export function UsuariosInvitarDialog({ setOpen }) {
    const [emails, setEmails] = useState('');
    const [role, setRole] = useState('vendedor');
    const [mensaje, setMensaje] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const handleInvitar = async (e) => {
        e.preventDefault();
        // Validación básica
        if (!emails.trim()) {
            toast({
                variant: 'destructive',
                title: 'Error al enviar invitaciones',
                description: 'Ingresa al menos un correo electrónico',
            });
            return;
        }
        try {
            setIsLoading(true);
            // Simulación de invitación - Reemplazar con lógica real
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setIsLoading(false);
            setOpen(null);
            toast({
                title: 'Invitaciones enviadas',
                description: 'Las invitaciones han sido enviadas exitosamente',
            });
        }
        catch (error) {
            setIsLoading(false);
            toast({
                variant: 'destructive',
                title: 'Error al enviar invitaciones',
                description: error instanceof Error ? error.message : 'Error desconocido',
            });
        }
    };
    return (_jsxs("form", { onSubmit: handleInvitar, children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Invitar Usuarios" }), _jsx(DialogDescription, { children: "Env\u00EDa invitaciones por correo electr\u00F3nico para que nuevos usuarios se unan a la plataforma." })] }), _jsxs("div", { className: 'space-y-4 py-4', children: [_jsxs("div", { className: 'space-y-2', children: [_jsxs(Label, { htmlFor: 'emails', children: ["Correos electr\u00F3nicos", ' ', _jsx("span", { className: 'text-muted-foreground', children: "(separados por comas)" })] }), _jsx(Textarea, { id: 'emails', value: emails, onChange: (e) => setEmails(e.target.value), placeholder: 'usuario1@ejemplo.com, usuario2@ejemplo.com', className: 'h-24', required: true })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { htmlFor: 'role', children: "Rol para los invitados" }), _jsxs(Select, { value: role, onValueChange: setRole, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: 'Selecciona un rol' }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: 'vendedor', children: "Vendedor" }), _jsx(SelectItem, { value: 'cajero', children: "Cajero" }), _jsx(SelectItem, { value: 'inventario', children: "Inventario" }), _jsx(SelectItem, { value: 'soporte', children: "Soporte" })] })] })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { htmlFor: 'mensaje', children: "Mensaje personalizado (opcional)" }), _jsx(Textarea, { id: 'mensaje', value: mensaje, onChange: (e) => setMensaje(e.target.value), placeholder: 'Escribe un mensaje personalizado para la invitaci\u00F3n...', className: 'h-24' })] }), _jsx("div", { className: 'bg-muted/50 p-3 rounded-md text-sm text-muted-foreground', children: _jsx("p", { children: "Los usuarios invitados recibir\u00E1n un correo electr\u00F3nico con un enlace para registrarse. El enlace caducar\u00E1 despu\u00E9s de 7 d\u00EDas." }) })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { type: 'button', variant: 'outline', onClick: () => setOpen(null), children: "Cancelar" }), _jsx(Button, { type: 'submit', disabled: isLoading, className: 'gap-2', children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(IconLoader2, { size: 16, className: 'animate-spin' }), "Enviando..."] })) : (_jsxs(_Fragment, { children: [_jsx(IconMail, { size: 16 }), "Enviar Invitaciones"] })) })] })] }));
}
