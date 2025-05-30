import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { FIREBASE_AUTH, database } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar, } from '@/components/ui/sidebar';
export function NavUser() {
    const { isMobile } = useSidebar();
    const { user } = useAuthStore();
    useEffect(() => {
        const handleBeforeUnload = async () => {
            if (user?.id) {
                try {
                    await updateDoc(doc(database, 'usuarios', user.id), {
                        status: 'Offline',
                    });
                }
                catch {
                    // Ignorar error de actualización de status al cerrar pestaña
                }
            }
        };
        const handleOffline = async () => {
            if (user?.id) {
                try {
                    await updateDoc(doc(database, 'usuarios', user.id), {
                        status: 'Offline',
                    });
                }
                catch {
                    // Ignorar error de actualización de status al perder conexión
                }
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('offline', handleOffline);
        };
    }, [user]);
    return (_jsx(SidebarMenu, { children: _jsx(SidebarMenuItem, { children: _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(SidebarMenuButton, { size: 'lg', className: 'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground', children: [_jsxs(Avatar, { className: 'h-8 w-8 rounded-lg', children: [_jsx(AvatarImage, { alt: user ? `${user.nombres} ${user.apellidos}` : '' }), _jsx(AvatarFallback, { className: 'rounded-lg', children: "FF" })] }), _jsxs("div", { className: 'grid flex-1 text-left text-sm leading-tight', children: [_jsxs("span", { className: 'truncate font-semibold', children: [user ? `${user.nombres} ${user.apellidos}` : '', " (", user?.role, ")"] }), _jsx("span", { className: 'truncate text-xs', children: user?.email })] }), _jsx(ChevronsUpDown, { className: 'ml-auto size-4' })] }) }), _jsxs(DropdownMenuContent, { className: 'w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg', side: isMobile ? 'bottom' : 'right', align: 'end', sideOffset: 4, children: [_jsx(DropdownMenuLabel, { className: 'p-0 font-normal', children: _jsxs("div", { className: 'flex items-center gap-2 px-1 py-1.5 text-left text-sm', children: [_jsxs(Avatar, { className: 'h-8 w-8 rounded-lg', children: [_jsx(AvatarImage, { alt: user ? `${user.nombres} ${user.apellidos}` : '' }), _jsx(AvatarFallback, { className: 'rounded-lg', children: "FF" })] }), _jsxs("div", { className: 'grid flex-1 text-left text-sm leading-tight', children: [_jsx("span", { className: 'truncate font-semibold', children: user ? `${user.nombres} ${user.apellidos}` : '' }), _jsx("span", { className: 'truncate text-xs', children: user?.email })] })] }) }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuGroup, { children: [_jsx(DropdownMenuItem, { asChild: true, children: _jsxs(Link, { to: '/settings/account', children: [_jsx(BadgeCheck, {}), "Cuenta"] }) }), _jsx(DropdownMenuItem, { asChild: true, children: _jsxs(Link, { to: '/settings', children: [_jsx(CreditCard, {}), "Configuraci\u00F3n"] }) }), _jsx(DropdownMenuItem, { asChild: true, children: _jsxs(Link, { to: '/settings/notifications', children: [_jsx(Bell, {}), "Notificaciones"] }) })] }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: async () => {
                                    if (user?.id) {
                                        await updateDoc(doc(database, 'usuarios', user.id), {
                                            status: 'Offline',
                                        });
                                    }
                                    await signOut(FIREBASE_AUTH);
                                }, children: [_jsx(LogOut, {}), "Cerrar sesi\u00F3n"] })] })] }) }) }));
}
