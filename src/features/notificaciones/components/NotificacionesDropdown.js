import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { EstadoNotificacion, TipoNotificacion, } from '@/types/interfaces/notificaciones/notificacion';
import { es } from 'date-fns/locale';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useObtenerNotificaciones, useMarcarNotificacionLeida, useArchivarNotificacion, } from '../hooks';
export function NotificacionesDropdown() {
    const navigate = useNavigate();
    const [notificaciones, setNotificaciones] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const { obtenerNotificaciones } = useObtenerNotificaciones();
    const { marcarNotificacionLeida } = useMarcarNotificacionLeida();
    const { archivarNotificacion } = useArchivarNotificacion();
    const loadNotificaciones = useCallback(async () => {
        try {
            const notifs = await obtenerNotificaciones(EstadoNotificacion.PENDIENTE);
            setNotificaciones(notifs);
        }
        catch (error) {
            console.error('Error al cargar notificaciones:', error);
        }
    }, [obtenerNotificaciones]);
    useEffect(() => {
        loadNotificaciones();
        // Refresh notifications every minute
        const interval = setInterval(loadNotificaciones, 60000);
        return () => clearInterval(interval);
    }, [loadNotificaciones]);
    const handleNotificacionClick = async (notificacion) => {
        try {
            // Mark as read
            await marcarNotificacionLeida(notificacion.id, 'current-user-id'); // TODO: Get actual user ID
            // Navigate based on action
            if (notificacion.accion) {
                switch (notificacion.accion.tipo) {
                    case 'IR_A_PAGO':
                        navigate(`/compras/pagos-recurrentes/${notificacion.accion.id}`);
                        break;
                    case 'IR_A_CUENTA':
                        navigate(`/contabilidad/cuentas/${notificacion.accion.id}`);
                        break;
                }
            }
            // Close dropdown
            setIsOpen(false);
        }
        catch (error) {
            console.error('Error al manejar notificación:', error);
        }
    };
    const handleArchivar = async (id, e) => {
        e.stopPropagation();
        try {
            await archivarNotificacion(id);
            setNotificaciones((prev) => prev.filter((n) => n.id !== id));
        }
        catch (error) {
            console.error('Error al archivar notificación:', error);
        }
    };
    const getNotificacionIcon = (tipo) => {
        switch (tipo) {
            case TipoNotificacion.PAGO_RECURRENTE:
                return '💰';
            case TipoNotificacion.PAGO_VENCIDO:
                return '⚠️';
            case TipoNotificacion.PAGO_PROXIMO:
                return '🔔';
            default:
                return '📌';
        }
    };
    const getPrioridadColor = (prioridad) => {
        switch (prioridad) {
            case 'ALTA':
                return 'bg-red-100 text-red-800';
            case 'MEDIA':
                return 'bg-yellow-100 text-yellow-800';
            case 'BAJA':
                return 'bg-green-100 text-green-800';
        }
    };
    return (_jsxs(DropdownMenu, { open: isOpen, onOpenChange: setIsOpen, children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: 'ghost', size: 'icon', className: 'relative', style: { borderColor: '#F37021', borderWidth: '1px' }, children: [_jsx(Bell, { className: 'h-5 w-5 text-white' }), notificaciones.length > 0 && (_jsx(Badge, { variant: 'destructive', className: 'absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0', children: notificaciones.length }))] }) }), _jsx(DropdownMenuContent, { align: 'end', className: 'w-80', children: _jsx(ScrollArea, { className: 'h-[400px]', children: notificaciones.length === 0 ? (_jsx("div", { className: 'p-4 text-center text-muted-foreground', children: "No hay notificaciones pendientes" })) : (notificaciones.map((notificacion) => (_jsxs(DropdownMenuItem, { className: 'flex flex-col items-start p-4 cursor-pointer hover:bg-accent', onClick: () => handleNotificacionClick(notificacion), children: [_jsxs("div", { className: 'flex items-center gap-2 w-full', children: [_jsx("span", { className: 'text-lg', children: getNotificacionIcon(notificacion.tipo) }), _jsx("span", { className: 'font-medium flex-1', children: notificacion.titulo }), _jsx(Badge, { variant: 'outline', className: getPrioridadColor(notificacion.prioridad), children: notificacion.prioridad })] }), _jsx("p", { className: 'text-sm text-muted-foreground mt-1', children: notificacion.mensaje }), _jsxs("div", { className: 'flex items-center justify-between w-full mt-2', children: [_jsx("span", { className: 'text-xs text-muted-foreground', children: format(new Date(notificacion.fechaNotificacion), 'PPP', {
                                            locale: es,
                                        }) }), _jsx(Button, { variant: 'ghost', size: 'sm', className: 'h-6 px-2 text-xs', onClick: (e) => handleArchivar(notificacion.id, e), children: "Archivar" })] })] }, notificacion.id)))) }) })] }));
}
