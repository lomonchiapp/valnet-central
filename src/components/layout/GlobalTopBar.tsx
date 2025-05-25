import { ChevronLeftCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { RoleUsuario } from 'shared-types';
import { useSidebar } from '@/components/ui/sidebar';
import { AdminTopBar, InventarioTopBar, SacTopBar, VendedorTopBar } from '@/components/layout/role-topbars';

export function GlobalTopBar() {
  const { user } = useAuthStore();
  const { toggleSidebar } = useSidebar();
  
  // Contenido específico según el rol
  const renderRoleSpecificContent = () => {
    if (!user) return null;

    switch (user.role) {
      case RoleUsuario.INVENTARIO:
        return <InventarioTopBar />;
      case RoleUsuario.ADMIN:
        return <AdminTopBar />;
      case RoleUsuario.SAC:
        return <SacTopBar />;
      case RoleUsuario.VENDEDOR:
        return <VendedorTopBar />;
      // Agregar más casos según sea necesario para otros roles
      default:
        return (
          <>
            <div className="flex-1 ">
              <h2 className="text-xl font-medium">ValNet Central</h2>
              <p className="text-sm text-muted-foreground">Sistema de gestión integral</p>
            </div>
            {/* Botones por defecto aquí si es necesario */}
          </>
        );
    }
  };

  return (
    <div className="w-full flex justify-between items-center rounded-lg p-4 shadow mb-6 bg-[#005BAA]">
      <div className="flex items-center gap-4 w-full">
        {/* Icono para colapsar la sidebar */}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hover:bg-accent text-[#005BAA]">
          <ChevronLeftCircle className="h-8 w-8 text-white hover:text-[#005BAA]" />
        </Button>
        
        {/* Contenido específico del rol */}
        {renderRoleSpecificContent()}
      </div>
    </div>
  );
} 