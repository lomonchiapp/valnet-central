import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { signOut } from 'firebase/auth';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
export function UserMenu() {
    const navigate = useNavigate();
    const { user, clearUser } = useAuthStore();
    const { toast } = useToast();
    if (!user)
        return null;
    const getInitials = (name, lastName) => {
        return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };
    const handleLogout = async () => {
        try {
            await signOut(auth);
            clearUser();
            toast({
                title: 'Sesión cerrada',
                description: 'Has cerrado sesión exitosamente',
            });
            navigate('/login');
        }
        catch (error) {
            console.error('Error al cerrar sesión:', error);
            toast({
                title: 'Error',
                description: 'Hubo un error al cerrar sesión',
                variant: 'destructive',
            });
        }
    };
    return (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: 'ghost', className: 'relative h-10 w-10 rounded-full p-0', children: _jsxs("div", { className: 'flex items-center bg-white/10 hover:bg-white/20 rounded-full px-2 py-1.5', children: [_jsxs(Avatar, { className: 'h-8 w-8', children: [_jsx(AvatarImage, { src: user.avatar, alt: user.nombres }), _jsx(AvatarFallback, { className: 'bg-[#F37021] text-white', children: getInitials(user.nombres, user.apellidos) })] }), _jsx(ChevronDown, { className: 'h-4 w-4 text-white ml-1' })] }) }) }), _jsxs(DropdownMenuContent, { className: 'w-56', align: 'end', forceMount: true, children: [_jsx(DropdownMenuLabel, { className: 'font-normal', children: _jsxs("div", { className: 'flex flex-col space-y-1', children: [_jsxs("p", { className: 'text-sm font-medium leading-none', children: [user.nombres, " ", user.apellidos] }), _jsx("p", { className: 'text-xs leading-none text-muted-foreground', children: user.email })] }) }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: () => navigate('/perfil'), children: [_jsx(User, { className: 'mr-2 h-4 w-4' }), _jsx("span", { children: "Mi Perfil" })] }), _jsxs(DropdownMenuItem, { onClick: () => navigate('/configuracion'), children: [_jsx(Settings, { className: 'mr-2 h-4 w-4' }), _jsx("span", { children: "Configuraci\u00F3n" })] }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: handleLogout, className: 'text-red-600', children: [_jsx(LogOut, { className: 'mr-2 h-4 w-4' }), _jsx("span", { children: "Cerrar Sesi\u00F3n" })] })] })] }));
}
