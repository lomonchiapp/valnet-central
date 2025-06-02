import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { EstadoNotificacion, TipoNotificacion, } from '@/types/interfaces/notificaciones/notificacion';
import { es } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';
import { Users, Package, Wrench, Ticket, AlertCircle, RefreshCw, Bell, } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, } from '@/components/ui/card';
import { useObtenerNotificaciones } from '@/features/notificaciones/hooks';
import { WallNetDashboardWidget } from './SacDashboard';
// Mock data
const mockMetricas = {
    usuariosActivos: 156,
    inventarioTotal: 1245,
    ticketsAbiertos: 23,
    brigadasActivas: 8,
    pagosPendientes: 12,
    ingresosMensuales: 45000000,
    tendencias: {
        usuarios: 12.5,
        inventario: -2.3,
        tickets: 5.7,
        brigadas: 0,
        pagos: 8.2,
        ingresos: 15.3,
    },
};
const mockPagos = [
    {
        id: '1',
        cliente: {
            id: '1',
            nombre: 'Cliente A',
            email: 'cliente@a.com',
        },
        monto: 1500000,
        concepto: 'Mensualidad Enero',
        fechaVencimiento: Timestamp.fromDate(new Date(Date.now() + 86400000 * 2)), // 2 días
        estado: 'pendiente',
    },
    {
        id: '2',
        cliente: {
            id: '2',
            nombre: 'Cliente B',
            email: 'cliente@b.com',
        },
        monto: 2300000,
        concepto: 'Mensualidad Enero',
        fechaVencimiento: Timestamp.fromDate(new Date(Date.now() + 86400000 * 5)), // 5 días
        estado: 'pendiente',
    },
];
const mockInventario = [
    {
        id: '1',
        nombre: 'Router TP-Link',
        descripcion: 'Router inalámbrico de alta velocidad',
        categoria: 'Redes',
        stock: 5,
        threshold: 10,
        precio: 150000,
        proveedor: 'TP-Link',
        ultimaActualizacion: Timestamp.now(),
    },
    {
        id: '2',
        nombre: 'Cable UTP Cat6',
        descripcion: 'Cable de red categoría 6',
        categoria: 'Cables',
        stock: 50,
        threshold: 100,
        precio: 25000,
        proveedor: 'Belden',
        ultimaActualizacion: Timestamp.now(),
    },
    {
        id: '3',
        nombre: 'Switch 24 Puertos',
        descripcion: 'Switch de red 24 puertos',
        categoria: 'Redes',
        stock: 2,
        threshold: 5,
        precio: 450000,
        proveedor: 'Cisco',
        ultimaActualizacion: Timestamp.now(),
    },
];
const mockBrigadas = [
    {
        id: '1',
        nombre: 'Brigada Norte',
        miembros: [
            { id: '1', nombre: 'Juan Pérez', rol: 'Técnico' },
            { id: '2', nombre: 'María García', rol: 'Técnico' },
        ],
        tareas: [
            {
                id: '1',
                descripcion: 'Instalación cliente nuevo',
                estado: 'pendiente',
                fechaAsignacion: Timestamp.now(),
            },
            {
                id: '2',
                descripcion: 'Mantenimiento preventivo',
                estado: 'en_proceso',
                fechaAsignacion: Timestamp.now(),
            },
        ],
        estado: 'activo',
    },
    {
        id: '2',
        nombre: 'Brigada Sur',
        miembros: [
            { id: '3', nombre: 'Carlos López', rol: 'Técnico' },
            { id: '4', nombre: 'Ana Martínez', rol: 'Técnico' },
        ],
        tareas: [
            {
                id: '3',
                descripcion: 'Reparación de falla',
                estado: 'pendiente',
                fechaAsignacion: Timestamp.now(),
            },
        ],
        estado: 'activo',
    },
];
export function AdminDashboard() {
    const navigate = useNavigate();
    const [metricas, setMetricas] = useState(mockMetricas);
    const [pagos, setPagos] = useState(mockPagos);
    const [inventario, setInventario] = useState(mockInventario);
    const [brigadas, setBrigadas] = useState(mockBrigadas);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { obtenerNotificaciones } = useObtenerNotificaciones();
    const [notificacionesPagos, setNotificacionesPagos] = useState([]);
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // Obtener notificaciones de pagos
            const notifs = await obtenerNotificaciones(EstadoNotificacion.PENDIENTE);
            const pagosNotifs = notifs.filter((n) => n.tipo === TipoNotificacion.PAGO_PROXIMO ||
                n.tipo === TipoNotificacion.PAGO_VENCIDO);
            setNotificacionesPagos(pagosNotifs);
            // Por ahora usamos los datos mock
            setMetricas(mockMetricas);
            setPagos(mockPagos);
            setInventario(mockInventario);
            setBrigadas(mockBrigadas);
        }
        catch (err) {
            const errorMessage = err instanceof Error
                ? err.message
                : 'Error desconocido al cargar los datos';
            setError(errorMessage);
            console.error('Error en fetchData:', err);
        }
        finally {
            setLoading(false);
        }
    }, [obtenerNotificaciones]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    if (loading) {
        return (_jsx("div", { className: 'flex items-center justify-center min-h-screen', children: _jsx("div", { className: 'animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900' }) }));
    }
    if (error) {
        return (_jsxs("div", { className: 'flex flex-col items-center justify-center min-h-screen gap-4', children: [_jsx("div", { className: 'text-red-500 text-lg font-semibold', children: error }), _jsxs(Button, { variant: 'outline', onClick: fetchData, className: 'flex items-center gap-2', children: [_jsx(RefreshCw, { className: 'h-4 w-4' }), "Intentar nuevamente"] })] }));
    }
    const metrics = [
        {
            label: 'Usuarios Activos',
            value: metricas.usuariosActivos,
            icon: _jsx(Users, { className: 'h-4 w-4 text-muted-foreground' }),
            trend: metricas.tendencias.usuarios,
        },
        {
            label: 'Inventario Total',
            value: metricas.inventarioTotal,
            icon: _jsx(Package, { className: 'h-4 w-4 text-muted-foreground' }),
            trend: metricas.tendencias.inventario,
        },
        {
            label: 'Tickets Abiertos',
            value: metricas.ticketsAbiertos,
            icon: _jsx(Ticket, { className: 'h-4 w-4 text-muted-foreground' }),
            trend: metricas.tendencias.tickets,
        },
        {
            label: 'Brigadas Activas',
            value: metricas.brigadasActivas,
            icon: _jsx(Wrench, { className: 'h-4 w-4 text-muted-foreground' }),
            trend: metricas.tendencias.brigadas,
        },
    ];
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
    const getNotificacionColor = (tipo) => {
        switch (tipo) {
            case TipoNotificacion.PAGO_VENCIDO:
                return 'bg-red-100 text-red-800';
            case TipoNotificacion.PAGO_PROXIMO:
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };
    return (_jsxs("div", { className: 'space-y-8 px-4 md:px-8 py-6', children: [_jsx("div", { className: 'flex justify-end', children: _jsxs(Button, { variant: 'outline', size: 'sm', onClick: fetchData, className: 'flex items-center gap-2', children: [_jsx(RefreshCw, { className: 'h-4 w-4' }), "Actualizar datos"] }) }), _jsx("div", { className: 'grid gap-4 md:grid-cols-4', children: metrics.map((metric) => (_jsxs(Card, { children: [_jsxs(CardHeader, { className: 'flex flex-row items-center justify-between pb-2 space-y-0', children: [_jsx(CardTitle, { className: 'text-sm font-medium', children: metric.label }), metric.icon] }), _jsxs(CardContent, { children: [_jsx("div", { className: 'text-2xl font-bold', children: metric.value }), _jsxs("p", { className: `text-xs ${metric.trend > 0
                                        ? 'text-green-500'
                                        : metric.trend < 0
                                            ? 'text-red-500'
                                            : 'text-muted-foreground'}`, children: [metric.trend > 0 ? '+' : '', metric.trend.toFixed(1), "% desde el mes pasado"] })] })] }, metric.label))) }), _jsxs("div", { className: 'grid gap-6 md:grid-cols-2 lg:grid-cols-3', children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: 'flex items-center gap-2', children: [_jsx(Bell, { className: 'h-4 w-4' }), "Pagos y Notificaciones"] }), _jsx(CardDescription, { children: "Pr\u00F3ximos pagos y alertas" })] }), _jsx(CardContent, { children: _jsxs("div", { className: 'space-y-4', children: [notificacionesPagos.map((notif) => (_jsxs("div", { className: 'flex items-start gap-3 p-3 rounded-lg border', children: [_jsx("span", { className: 'text-xl', children: getNotificacionIcon(notif.tipo) }), _jsxs("div", { className: 'flex-1', children: [_jsxs("div", { className: 'flex items-center justify-between', children: [_jsx("h4", { className: 'font-medium', children: notif.titulo }), _jsx(Badge, { variant: 'outline', className: getNotificacionColor(notif.tipo), children: notif.tipo === TipoNotificacion.PAGO_VENCIDO
                                                                        ? 'Vencido'
                                                                        : 'Próximo' })] }), _jsx("p", { className: 'text-sm text-muted-foreground mt-1', children: notif.mensaje }), _jsx("p", { className: 'text-xs text-muted-foreground mt-2', children: format(new Date(notif.fechaNotificacion), 'PPP', {
                                                                locale: es,
                                                            }) })] })] }, notif.id))), pagos.map((payment) => (_jsxs("div", { className: 'flex justify-between items-center p-3 rounded-lg border', children: [_jsxs("div", { children: [_jsx("p", { className: 'font-medium', children: payment.cliente.nombre }), _jsxs("p", { className: 'text-xs text-muted-foreground', children: ["Vence:", ' ', payment.fechaVencimiento.toDate().toLocaleDateString()] })] }), _jsxs("div", { className: 'text-right', children: [_jsxs("p", { className: 'font-semibold', children: ["$", payment.monto.toLocaleString()] }), _jsx("p", { className: 'text-xs text-muted-foreground', children: payment.estado })] })] }, payment.id)))] }) }), _jsx(CardFooter, { children: _jsx(Button, { variant: 'ghost', className: 'w-full', onClick: () => navigate('/compras/pagos-recurrentes'), children: "Ver todos los pagos" }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: 'flex items-center gap-2', children: [_jsx(AlertCircle, { className: 'h-4 w-4 text-red-500' }), "Alertas de Inventario"] }), _jsx(CardDescription, { children: "Productos con stock bajo" })] }), _jsx(CardContent, { children: _jsx("div", { className: 'space-y-2', children: inventario.map((item) => (_jsxs("div", { className: 'flex justify-between items-center p-2 border-b', children: [_jsxs("div", { children: [_jsx("p", { className: 'font-medium', children: item.nombre }), _jsxs("p", { className: 'text-xs text-muted-foreground', children: ["Stock m\u00EDnimo: ", item.threshold] })] }), _jsxs("div", { className: 'text-right', children: [_jsxs("p", { className: `font-semibold ${item.stock <= item.threshold * 0.5
                                                            ? 'text-red-500'
                                                            : 'text-yellow-500'}`, children: [item.stock, " unidades"] }), _jsx("p", { className: 'text-xs text-muted-foreground', children: item.stock <= item.threshold * 0.5 ? 'Crítico' : 'Bajo' })] })] }, item.id))) }) }), _jsx(CardFooter, { children: _jsx(Button, { variant: 'ghost', className: 'w-full', onClick: () => navigate('/admin/inventario'), children: "Ver inventario completo" }) })] }), _jsxs(Card, { className: 'lg:col-span-1', children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "WallNet" }), _jsx(CardDescription, { children: "\u00DAltimas actualizaciones" })] }), _jsx(CardContent, { children: _jsx(WallNetDashboardWidget, {}) })] }), _jsxs(Card, { className: 'lg:col-span-2', children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: 'flex items-center gap-2', children: [_jsx(Wrench, { className: 'h-4 w-4' }), "Brigadas Activas"] }), _jsx(CardDescription, { children: "Equipos en campo" })] }), _jsx(CardContent, { children: _jsx("div", { className: 'space-y-2', children: brigadas.map((brigade) => (_jsxs("div", { className: 'flex justify-between items-center p-2 border-b', children: [_jsxs("div", { children: [_jsx("p", { className: 'font-medium', children: brigade.nombre }), _jsxs("p", { className: 'text-xs text-muted-foreground', children: [brigade.miembros.length, " miembros"] })] }), _jsxs("div", { className: 'text-right', children: [_jsxs("p", { className: 'font-semibold', children: [brigade.tareas.length, " tareas"] }), _jsx("p", { className: 'text-xs text-muted-foreground', children: brigade.estado })] })] }, brigade.id))) }) }), _jsx(CardFooter, { children: _jsx(Button, { variant: 'ghost', className: 'w-full', onClick: () => navigate('/admin/brigadas'), children: "Ver todas las brigadas" }) })] })] })] }));
}
export default AdminDashboard;
