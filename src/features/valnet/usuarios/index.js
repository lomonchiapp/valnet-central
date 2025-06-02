import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { IconUsers } from '@tabler/icons-react';
import { useValnetState } from '@/context/global/useValnetState';
import { Card } from '@/components/ui/card';
import { Main } from '@/components/layout/main';
import { UsuarioItem } from './components/UsuarioItem';
import { UsuariosBotonesPrincipales } from './components/UsuariosBotonesPrincipales';
import { UsuariosDialogs } from './components/UsuariosDialogs';
export default function Usuarios() {
    const { users, subscribeToUsers } = useValnetState();
    const [isLoading, setIsLoading] = useState(true);
    const [open, setOpen] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    useEffect(() => {
        const unsubscribe = subscribeToUsers();
        return () => unsubscribe();
    }, [subscribeToUsers]);
    useEffect(() => {
        setIsLoading(false);
    }, [users]);
    return (_jsxs(Main, { children: [_jsxs("div", { className: 'space-y-6', children: [_jsxs("div", { children: [_jsx("h2", { className: 'text-2xl font-bold tracking-tight', children: "Gesti\u00F3n de Usuarios" }), _jsx("p", { className: 'text-muted-foreground', children: "Administra los usuarios de la plataforma, sus roles y permisos." })] }), _jsx(UsuariosBotonesPrincipales, { setOpen: setOpen }), isLoading ? (_jsx("div", { className: 'flex justify-center items-center py-12', children: _jsxs("div", { className: 'animate-pulse space-y-6', children: [_jsx("div", { className: 'h-2 w-48 bg-muted rounded' }), _jsx("div", { className: 'h-2 w-64 bg-muted rounded' })] }) })) : users.length > 0 ? (_jsx("div", { className: 'grid gap-6 md:grid-cols-2 lg:grid-cols-3', children: users.map((usuario) => (_jsx(UsuarioItem, { user: usuario, setOpen: setOpen, setCurrentUser: setCurrentUser }, usuario.id))) })) : (_jsxs(Card, { className: 'py-12 flex flex-col items-center justify-center text-center px-4', children: [_jsx(IconUsers, { size: 48, className: 'text-muted-foreground opacity-20 mb-4' }), _jsx("h3", { className: 'text-lg font-medium', children: "No hay usuarios registrados" }), _jsx("p", { className: 'text-muted-foreground', children: "Agrega usuarios para que aparezcan aqu\u00ED" })] }))] }), _jsx(UsuariosDialogs, { open: open, setOpen: setOpen, currentUser: currentUser, setCurrentUser: setCurrentUser })] }));
}
