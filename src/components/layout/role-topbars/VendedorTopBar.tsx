import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { NivelVendedor } from '@/types/interfaces/valnet/usuario';
import { BronzeIcon, SilverIcon, GoldIcon, DiamondIcon } from '@/components/icons/VendedorNivelIcons';
import { useNavigate } from 'react-router-dom';

const nivelIcons = {
  [NivelVendedor.BRONZE]: BronzeIcon,
  [NivelVendedor.SILVER]: SilverIcon,
  [NivelVendedor.GOLD]: GoldIcon,
  [NivelVendedor.DIAMOND]: DiamondIcon,
};

export function VendedorTopBar() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  if (!user) return null;
  const nivel = user.nivelVendedor || NivelVendedor.BRONZE;
  const NivelIcon = nivelIcons[nivel];

  return (
    <div className="flex-1 flex items-center gap-6">
      <div className="flex items-center gap-3">
        <NivelIcon width={36} height={36} />
        <div>
          <h2 className="text-xl font-bold text-white">{user.nombres} {user.apellidos}</h2>
          <div className="flex items-center gap-2 text-sm text-white/90">
            <span className="font-semibold">Nivel: {nivel}</span>
            <span className="ml-2 px-2 py-0.5 rounded bg-white/20 text-xs font-medium">{user.contratosMes || 0} contratos este mes</span>
          </div>
        </div>
      </div>
      <div className="flex gap-3 ml-auto">
        <Button
          style={{ backgroundColor: '#F37021', borderColor: '#F37021' }}
          className="hover:bg-orange-500 text-white font-semibold shadow"
          onClick={() => navigate('/ventas/pre-registros/nuevo')}
        >
          + Nueva Venta 
        </Button>
      </div>
    </div>
  );
}
