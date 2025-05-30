import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter, } from '@/components/ui/dialog';
export function UsuariosEliminarDialog({ setOpen, currentUser, }) {
    const [isLoading, setIsLoading] = useState(false);
    const handleEliminar = async () => {
        if (!currentUser)
            return;
        try {
            setIsLoading(true);
            // Simulación de eliminación - Reemplazar con lógica real
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setIsLoading(false);
            setOpen(null);
            toast({
                title: 'Usuario eliminado',
                description: 'El usuario ha sido eliminado exitosamente',
            });
        }
        catch (error) {
            setIsLoading(false);
            toast({
                variant: 'destructive',
                title: 'Error al eliminar el usuario',
                description: error instanceof Error ? error.message : 'Error desconocido',
            });
        }
    };
    return (_jsxs(_Fragment, { children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Eliminar Usuario" }), _jsx(DialogDescription, { children: "Esta acci\u00F3n no se puede deshacer. Esto eliminar\u00E1 permanentemente al usuario y eliminar\u00E1 sus datos de nuestros servidores." })] }), _jsxs("div", { className: 'flex items-center gap-4 py-4', children: [_jsx("div", { className: 'bg-amber-50 dark:bg-amber-950 p-3 rounded-full', children: _jsx(IconAlertTriangle, { size: 24, className: 'text-amber-500' }) }), _jsxs("div", { children: [_jsx("h4", { className: 'text-lg font-medium', children: "\u00BFEst\u00E1 seguro que desea eliminar este usuario?" }), currentUser && (_jsxs("p", { className: 'text-sm text-muted-foreground', children: [currentUser.nombres, " ", currentUser.apellidos, " (", currentUser.email, ")"] }))] })] }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: 'outline', onClick: () => setOpen(null), children: "Cancelar" }), _jsx(Button, { variant: 'destructive', onClick: handleEliminar, disabled: isLoading, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(IconLoader2, { size: 16, className: 'mr-2 animate-spin' }), "Eliminando..."] })) : ('Eliminar Usuario') })] })] }));
}
