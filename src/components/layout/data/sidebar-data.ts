import {
  IconChecklist,
  IconGasStation,
  IconLayoutDashboard,
  IconMapPin,
  IconReceipt2,
  IconReportMoney,
  IconUser,
  IconClock,
  IconCircleCheck,
} from '@tabler/icons-react'
import { Ticket as TicketIcon } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: 'Dashboard',
      items: [
        {
          type: 'link',
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
          type: 'link',
          title: 'Inventarios',
          url: '/almacen/inventarios',
          icon: IconLayoutDashboard,
        },
      ],
    },
    {
      title: 'Contabilidad',
      items: [
        {
          type: 'group',
          title: 'Ingresos',
          icon: IconReportMoney,
          children: [
            {
              type: 'link',
              title: 'Facturas Pendientes',
              url: '/ingresos/facturas/pendientes',
              icon: IconClock,
            },
            {
              type: 'link',
              title: 'Facturas Pagadas',
              url: '/ingresos/facturas/pagadas',
              icon: IconCircleCheck,
            },
          ],
        },
        {
          type: 'group',
          title: 'Compras',
          icon: IconChecklist,
          children: [
            {
              type: 'link',
              title: 'Gastos / Pagos',
              url: '/compras/gastos',
              icon: IconReceipt2,
            },
            {
              type: 'link',
              title: 'Pagos Recurrentes',
              url: '/compras/pagos-recurrentes',
              icon: IconChecklist,
            },
            {
              type: 'link',
              title: 'Ordenes de Compra',
              url: '/compras/ordenes',
              icon: IconReportMoney,
            },
            {
              type: 'link',
              title: 'Gastos Menores',
              url: '/compras/gastos-menores',
              icon: IconGasStation,
            },
            {
              type: 'link',
              title: 'Proveedores',
              url: '/compras/proveedores',
              icon: IconUser,
            },
          ],
        },
        {
          type: 'link',
          title: 'Diario General',
          url: '/contabilidad/diario-general',
          icon: IconChecklist,
        },
        {
          type: 'link',
          title: 'Asientos Contables',
          url: '/contabilidad/asientos',
          icon: IconReportMoney,
        },
        {
          type: 'link',
          title: 'Cuentas',
          url: '/contabilidad/cuentas',
          icon: IconReceipt2,
        },
        {
          type: 'link',
          title: 'Libro Diario',
          url: '/contabilidad/libro-diario',
          icon: IconMapPin,
        },
        {
          type: 'link',
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
          type: 'link',
          title: 'Brigadas',
          url: '/coordinacion/brigadas',
          icon: IconMapPin,
        },
        {
          type: 'link',
          title: 'Combustible',
          url: '/coordinacion/combustible',
          icon: IconGasStation,
        },
        {
          type: 'link',
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
          type: 'link',
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
          type: 'link',
          title: 'Pre-Registros',
          url: '/ventas/pre-registros/todos',
          icon: IconChecklist,
        },
        {
          type: 'link',
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
          type: 'link',
          title: 'Clientes / Instalaciones',
          url: '/instalaciones',
          icon: IconMapPin,
        },
        {
          type: 'link',
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
          type: 'link',
          title: 'Usuarios Valnet',
          url: '/valnet/usuarios',
          icon: IconUser,
        },
      ],
    },
  ],
}
