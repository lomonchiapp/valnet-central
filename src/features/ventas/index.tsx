import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IconPlus } from '@tabler/icons-react';
import MisVentas from './mis-ventas';

export default function Ventas() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portal de Ventas</h1>
          <p className="text-muted-foreground">
            Gestiona tus pre-registros y visualiza el estado de tus ventas
          </p>
        </div>
        <Button 
          onClick={() => navigate('/ventas/pre-registros/nuevo')}
          className="gap-2"
        >
          <IconPlus size={16} />
          Nuevo Pre-Registro
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mis Ventas</CardTitle>
            <CardDescription>
              Lista de todos tus pre-registros y ventas realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MisVentas />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 