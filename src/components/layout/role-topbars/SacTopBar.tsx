import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ClipboardPlus, List } from 'lucide-react';

export function SacTopBar() {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex-1">
        <h2 className="text-xl font-medium text-white">Servicio al Cliente</h2>
        <p className="text-sm text-muted-foreground text-slate-300">Gestión de pre-registros y atención al cliente</p>
      </div>
      <div className="flex gap-3">
        <Button
          style={{ backgroundColor: '#F37021', borderColor: '#F37021' }}
          className="hover:bg-orange-500 text-white"
          onClick={() => navigate('/ventas/pre-registros/nuevo')}
        >
          <ClipboardPlus className="mr-2 h-4 w-4" />
          Nuevo Pre-Registro
        </Button>
        <Button
          variant="secondary"
          className="bg-white hover:bg-gray-100 text-[#005BAA]"
          onClick={() => navigate('/ventas/pre-registros')}
        >
          <List className="mr-2 h-4 w-4 text-[#005BAA]" />
          Ver Pre-Registros
        </Button>
      </div>
    </>
  );
} 