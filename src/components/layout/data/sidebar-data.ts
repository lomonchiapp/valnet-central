import {
  IconChecklist,
  IconLayoutDashboard,
  IconMapPin,
  IconReceipt2,
} from '@tabler/icons-react'
import { AudioWaveform, Command, GalleryVerticalEnd, HandshakeIcon } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Franklin Franco',
    email: 'franklinfranco@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Shadcn Admin',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
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
        }
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
          title: 'Tickets',
          url: '/coordinacion/tickets',
          icon: IconMapPin,
        },
      ],
    },
    {
      title: 'Ventas',
      items: [
        {
          title: 'Pre-Registros',
          url: '/ventas/pre-registros',
          icon: IconChecklist,
        }
      ],
    },
  ],
}
