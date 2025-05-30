import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IconEdit, IconKey, IconUserOff, IconUserCheck, } from '@tabler/icons-react';
import { StatusUsuario } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from '@/components/ui/tooltip';
export function UsuarioItem({ user, setOpen, setCurrentUser, }) {
    const handleEdit = () => {
        // Mapear Usuario a User
        setCurrentUser({
            id: user.id,
            nombres: user.nombres,
            apellidos: user.apellidos,
            avatar: user.avatar,
            role: user.role,
            cedula: user.cedula,
            status: user.status,
            telefono: user.telefono,
            direccion: user.direccion,
            fechaNacimiento: user.fechaNacimiento,
            email: user.email,
            updatedAt: user.updatedAt,
            createdAt: user.createdAt,
        });
        setOpen('editar');
    };
    // Obtiene iniciales para el avatar
    const getInitials = () => {
        return `${user.nombres.charAt(0)}${user.apellidos.charAt(0)}`.toUpperCase();
    };
    // Determina el color del badge según el estado
    const getBadgeVariant = () => {
        switch (user.status) {
            case StatusUsuario.ONLINE:
                return 'default';
            case StatusUsuario.OFFLINE:
                return 'secondary';
            case StatusUsuario.ON_BREAK:
                return 'outline';
            case StatusUsuario.BUSY:
                return 'destructive';
            default:
                return 'outline';
        }
    };
    return (_jsxs(Card, { className: 'overflow-hidden', children: [_jsx(CardContent, { className: 'p-6', children: _jsxs("div", { className: 'flex items-start gap-4', children: [_jsx(Avatar, { className: 'h-12 w-12', children: _jsx(AvatarFallback, { className: 'bg-primary text-primary-foreground', children: getInitials() }) }), _jsxs("div", { className: 'flex-1 space-y-1', children: [_jsxs("div", { className: 'flex items-center justify-between', children: [_jsxs("h3", { className: 'font-medium', children: [user.nombres, " ", user.apellidos] }), _jsx(Badge, { variant: getBadgeVariant(), className: 'capitalize', children: user.status })] }), _jsxs("div", { className: 'text-sm text-muted-foreground space-y-1', children: [_jsx("p", { children: user.email }), _jsx("p", { children: user.telefono }), _jsx("div", { className: 'flex items-center gap-2 mt-1', children: _jsx(Badge, { variant: 'outline', className: 'capitalize', children: user.role }) })] })] })] }) }), _jsxs(CardFooter, { className: 'bg-muted/50 px-6 py-3 flex justify-between', children: [_jsx(TooltipProvider, { children: _jsxs("div", { className: 'flex items-center space-x-2', children: [_jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { variant: 'ghost', size: 'icon', onClick: () => { }, children: _jsx(IconKey, { size: 18, className: 'text-amber-500' }) }) }), _jsx(TooltipContent, { children: "Resetear contrase\u00F1a" })] }), _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { variant: 'ghost', size: 'icon', onClick: () => { }, children: user.status === StatusUsuario.ONLINE ? (_jsx(IconUserOff, { size: 18, className: 'text-zinc-500' })) : (_jsx(IconUserCheck, { size: 18, className: 'text-emerald-500' })) }) }), _jsx(TooltipContent, { children: user.status === StatusUsuario.ONLINE
                                                ? 'Desactivar usuario'
                                                : 'Activar usuario' })] })] }) }), _jsx("div", { className: 'flex items-center space-x-2', children: _jsxs(Button, { variant: 'ghost', size: 'sm', onClick: handleEdit, children: [_jsx(IconEdit, { size: 16, className: 'mr-1' }), " Editar"] }) })] })] }));
}
