import { RoleUsuario } from 'shared-types'
import { useAuthStore } from '@/stores/authStore'
import {
  AdminTopBar,
  InventarioTopBar,
  SacTopBar,
  VendedorTopBar,
} from '@/components/layout/role-topbars'

export function GlobalTopBar() {
  const { user } = useAuthStore()

  if (!user) return null

  switch (user.role) {
    case RoleUsuario.INVENTARIO:
      return <InventarioTopBar />
    case RoleUsuario.ADMIN:
      return <AdminTopBar />
    case RoleUsuario.SAC:
      return <SacTopBar />
    case RoleUsuario.VENDEDOR:
      return <VendedorTopBar />
    default:
      return null
  }
}
