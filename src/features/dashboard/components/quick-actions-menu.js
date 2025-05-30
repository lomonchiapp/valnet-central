import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
export function QuickActionsMenu() {
    const navigate = useNavigate();
    const actions = [
        {
            label: 'Agregar Contribuyente',
            href: '/citizens/new',
        },
        {
            label: 'Agregar Servicio',
            href: '/services/new',
        },
        {
            label: 'Agregar Sector',
            href: '/sectors/new',
        },
        {
            label: 'Asignar Servicio',
            href: '/service-assignments/new',
        },
    ];
    return (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { children: [_jsx(IconPlus, { className: 'mr-2 h-4 w-4' }), "Acciones R\u00E1pidas"] }) }), _jsx(DropdownMenuContent, { align: 'end', children: actions.map((action) => (_jsx(DropdownMenuItem, { onClick: () => navigate(action.href), children: action.label }, action.href))) })] }));
}
