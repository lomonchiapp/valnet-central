import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Users, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
export function AdminTopBar() {
    const navigate = useNavigate();
    // Acciones para el botón "Administrar"
    const adminActions = [
        {
            label: 'Gestionar Usuarios',
            action: () => navigate('/admin/users'),
        },
        {
            label: 'Configuración del Sistema',
            action: () => navigate('/admin/settings'),
        },
        {
            label: 'Logs del Sistema',
            action: () => navigate('/admin/logs'),
        },
    ];
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: 'flex-1', children: [_jsx("h2", { className: 'text-xl font-medium', children: "Panel de Administraci\u00F3n" }), _jsx("p", { className: 'text-sm text-muted-foreground', children: "Control y gesti\u00F3n del sistema" })] }), _jsxs("div", { className: 'flex gap-3', children: [_jsxs(Button, { onClick: () => navigate('/admin/users'), variant: 'secondary', className: 'bg-white hover:bg-gray-100', children: [_jsx(Users, { className: 'mr-2 h-4 w-4 text-[#005BAA]' }), "Usuarios"] }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { style: { backgroundColor: '#F37021', borderColor: '#F37021' }, className: 'hover:bg-orange-500', children: [_jsx(Shield, { className: 'mr-2 h-4 w-4' }), "Administrar"] }) }), _jsx(DropdownMenuContent, { align: 'end', children: adminActions.map((action) => (_jsx(DropdownMenuItem, { onClick: action.action, className: 'cursor-pointer', children: action.label }, action.label))) })] })] })] }));
}
