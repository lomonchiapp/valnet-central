import { IconChecklist, IconGasStation, IconLayoutDashboard, IconMapPin, IconReceipt2, IconReportMoney, IconUser, } from '@tabler/icons-react';
import { Ticket as TicketIcon } from 'lucide-react';
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
            ],
        },
        {
            title: 'Compras',
            items: [
                {
                    title: 'Gastos / Pagos',
                    url: '/compras/gastos',
                    icon: IconReceipt2,
                },
                {
                    title: 'Pagos Recurrentes',
                    url: '/compras/pagos-recurrentes',
                    icon: IconChecklist,
                },
                {
                    title: 'Ordenes de Compra',
                    url: '/compras/ordenes',
                    icon: IconReportMoney,
                },
                {
                    title: 'Gastos Menores',
                    url: '/compras/gastos-menores',
                    icon: IconGasStation,
                },
                {
                    title: 'Proveedores',
                    url: '/compras/proveedores',
                    icon: IconUser,
                },
            ],
        },
        {
            title: 'Contabilidad',
            items: [
                {
                    title: 'Diario General',
                    url: '/contabilidad/diario-general',
                    icon: IconChecklist,
                },
                {
                    title: 'Asientos Contables',
                    url: '/contabilidad/asientos',
                    icon: IconReportMoney,
                },
                {
                    title: 'Cuentas',
                    url: '/contabilidad/cuentas',
                    icon: IconReceipt2,
                },
                {
                    title: 'Libro Diario',
                    url: '/contabilidad/libro-diario',
                    icon: IconMapPin,
                },
                {
                    title: 'Reportes',
                    url: '/contabilidad/reportes',
                    icon: IconLayoutDashboard,
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
