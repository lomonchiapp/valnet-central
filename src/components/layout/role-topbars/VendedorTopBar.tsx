import { NivelVendedor } from '@/types/interfaces/valnet/usuario'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import {
  BronzeIcon,
  SilverIcon,
  GoldIcon,
  DiamondIcon,
} from '@/components/icons/VendedorNivelIcons'
import { NotificacionesDropdown } from '@/features/notificaciones/components/NotificacionesDropdown'
import { UserMenu } from '@/components/layout/UserMenu'

const nivelIcons = {
  [NivelVendedor.BRONZE]: BronzeIcon,
  [NivelVendedor.SILVER]: SilverIcon,
  [NivelVendedor.GOLD]: GoldIcon,
  [NivelVendedor.DIAMOND]: DiamondIcon,
}

export function VendedorTopBar() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  if (!user) return null
  const nivel = user.nivelVendedor || NivelVendedor.BRONZE
  const NivelIcon = nivelIcons[nivel]

  return (
    <header className="flex w-full items-center h-20 bg-[#005BAA] shadow z-50 px-6">
      {/* 1. Logo */}
      <div className="flex items-center min-w-[160px]">
        <img src="/valdesk-white.png" alt="logo" className="w-36 h-auto" />
      </div>
      {/* 2. Info vendedor */}
      <div className="flex items-center gap-3 min-w-[260px] ml-4">
        <NivelIcon width={36} height={36} />
        <div>
          <h2 className="text-xl font-bold text-white">
            {user.nombres} {user.apellidos}
          </h2>
          <div className="flex items-center gap-2 text-sm text-white/90">
            <span className="font-semibold">Nivel: {nivel}</span>
            <span className="ml-2 px-2 py-0.5 rounded bg-white/20 text-xs font-medium">
              {user.contratosMes || 0} contratos este mes
            </span>
          </div>
        </div>
      </div>
      {/* 3. Buscador */}
      <div className="flex-1 flex justify-center px-6">
        <div className="w-full max-w-xl flex items-center bg-gray-100 rounded-md px-4 py-2">
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Buscar"
            className="bg-transparent outline-none border-none w-full text-gray-700 placeholder-gray-400"
            disabled
          />
        </div>
      </div>
      {/* 4. Acciones */}
      <div className="flex items-center pr-6 gap-3 min-w-[260px] justify-end">
        
        <NotificacionesDropdown />
        <Button
          style={{ backgroundColor: '#F37021', borderColor: '#F37021', marginRight: '10px' }}
          className="hover:bg-orange-500 text-white font-semibold shadow"
          onClick={() => navigate('/ventas/pre-registros/nuevo')}
        >
          +
        </Button>
        <UserMenu />
      </div>
    </header>
  )
}
