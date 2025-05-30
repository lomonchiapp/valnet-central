import { IconChecklist, IconGasStation, IconLayoutDashboard, IconMapPin, IconReceipt2, IconReportMoney, IconUser, } from '@tabler/icons-react';
import { HandshakeIcon, Ticket as TicketIcon } from 'lucide-react';
export const sidebarData = {
    navGroups: [
        {
            title: 'Dashboard',
            items: [
                {
                    title: 'Panel Principal',
                    url: '/',
                    icon: IconLayoutDashboard,
                },
            ],
        },
        {
            title: 'Almacen',
            items: [
                {
                    title: 'Inventarios',
                    url: '/almacen/inventarios',
                    icon: IconLayoutDashboard,
                },
                {
                    title: 'Movimientos',
                    url: '/almacen/movimientos',
                    icon: IconReceipt2,
                },
                {
                    title: 'Solicitudes',
                    url: '/almacen/solicitudes',
                    icon: HandshakeIcon,
                },
            ],
        },
        {
            title: 'Contabilidad',
            items: [
                {
                    title: 'Pagos',
                    url: '/contabilidad/pagos',
                    icon: IconLayoutDashboard,
                },
                {
                    title: 'Recurrentes',
                    url: '/contabilidad/recurrentes',
                    icon: IconReceipt2,
                },
                {
                    title: 'Facturas',
                    url: '/contabilidad/facturas',
                    icon: HandshakeIcon,
                },
            ],
        },
        {
            title: 'Coordinacion',
            items: [
                {
                    title: 'Brigadas',
                    url: '/coordinacion/brigadas',
                    icon: IconMapPin,
                },
                {
                    title: 'Combustible',
                    url: '/coordinacion/combustible',
                    icon: IconGasStation,
                },
                {
                    title: 'Averías / Encargos',
                    url: '/coordinacion/tickets',
                    icon: TicketIcon,
                },
            ],
        },
        {
            title: 'Soporte',
            items: [
                {
                    title: 'Tickets',
                    url: '/soporte/tickets',
                    icon: TicketIcon,
                },
            ],
        },
        {
            title: 'Ventas',
            items: [
                {
                    title: 'Pre-Registros',
                    url: '/ventas/pre-registros/todos',
                    icon: IconChecklist,
                },
                {
                    title: 'Mis Ventas',
                    url: '/ventas/pre-registros',
                    icon: IconReportMoney,
                },
            ],
        },
        {
            title: 'Valnet',
            items: [
                {
                    title: 'Clientes / Instalaciones',
                    url: '/instalaciones',
                    icon: IconMapPin,
                },
                {
                    title: 'Configurar WallNet',
                    url: '/valnet/wallnet/config',
                    icon: IconChecklist,
                },
            ],
        },
        {
            title: 'Configuración',
            items: [
                {
                    title: 'Usuarios Valnet',
                    url: '/valnet/usuarios',
                    icon: IconUser,
                },
            ],
        },
    ],
};
