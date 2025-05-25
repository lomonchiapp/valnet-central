import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleUsuario } from 'shared-types';

export function RoleDebugger() {
  const { user } = useAuthStore();
  
  const checkRoleMatch = (roleToCheck: string) => {
    if (!user) return false;
    return user.role === roleToCheck;
  };
  
  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle>Depuración de Rol de Usuario</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p><strong>Usuario actual:</strong> {user ? user.email : 'No autenticado'}</p>
          <p><strong>Rol guardado:</strong> {user ? user.role : 'N/A'}</p>
          <p><strong>ID de usuario:</strong> {user ? user.id : 'N/A'}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="p-2 border rounded">
            <p className="font-semibold">Comparación con RoleUsuario.INVENTARIO:</p>
            <p>user.role === RoleUsuario.INVENTARIO? {checkRoleMatch(RoleUsuario.INVENTARIO) ? '✓' : '✗'}</p>
            <p>RoleUsuario.INVENTARIO: {RoleUsuario.INVENTARIO}</p>
          </div>
          
          <div className="p-2 border rounded">
            <p className="font-semibold">Comparación con 'Inventario':</p>
            <p>user.role === 'Inventario'? {checkRoleMatch('Inventario') ? '✓' : '✗'}</p>
          </div>
        </div>
        
        <div className="p-3 bg-muted rounded">
          <p className="font-semibold">Todos los roles disponibles en RoleUsuario:</p>
          <ul className="list-disc pl-5 mt-2">
            {Object.entries(RoleUsuario).map(([key, value]) => (
              <li key={key}>
                <code>{key}</code>: {value}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 