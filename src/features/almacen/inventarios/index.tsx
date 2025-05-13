import { useEffect, useState } from "react"
import { useAlmacenState } from "@/context/global/useAlmacenState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { PlusCircle, Archive,  Warehouse } from "lucide-react"; // Iconos
import { Inventario, TipoInventario } from "shared-types";
import { NewInventoryForm } from "./components/NewInventoryForm"; // Importamos el nuevo formulario
import { useNavigate } from "react-router-dom";

export default function Inventarios() {
  const navigate = useNavigate();
  const { inventarios: inventariosDelContexto, subscribeToInventarios} = useAlmacenState();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Usamos directamente los inventarios del contexto. Aseguramos el tipo.
  const inventariosParaMostrar: Inventario[] = (inventariosDelContexto || []) as Inventario[];

  useEffect(() => {
    const unsubscribe = subscribeToInventarios();
    return () => unsubscribe();
  }, [subscribeToInventarios]);

  const getIconForType = (tipo: TipoInventario | undefined) => { // Ajustado a TipoInventario
    switch (tipo) {
      case TipoInventario.LOCAL: return <Warehouse className="w-5 h-5 mr-2" />; // Asumimos Warehouse para Local
      case TipoInventario.BRIGADA: return <Archive className="w-5 h-5 mr-2" />;
      default: return <Archive className="w-5 h-5 mr-2" />; // Icono por defecto
    }
  };

  const getTypeName = (tipo: TipoInventario | undefined) => { // Ajustado a TipoInventario
    switch (tipo) {
      case TipoInventario.LOCAL: return "Local";
      case TipoInventario.BRIGADA: return "Brigada";
      default: return "Otro"; // O manejar como indefinido/desconocido
    }
  };

  const handleInventoryCreated = (newInventoryId: string) => {
    // Aquí podrías hacer algo después de que el inventario se crea,
    // como una actualización optimista si el hook no lo hace ya,
    // o seleccionar el nuevo inventario, etc.
    // Por ahora, useAlmacenState (con subscribeToInventarios) debería actualizar la lista.
    //eslint-disable-next-line no-console
    console.log("Nuevo inventario creado con ID:", newInventoryId);
    // Si tienes una función para añadir optimistamente al estado de Zustand:
    // addInventarioOptimistic({ id: newInventoryId, nombre, tipo, descripcion, ...otrasPropsBase });
    // Esto dependerá de cómo esté implementado tu useAlmacenState y addInventarioOptimistic
  };

  // Componente para cuando no hay inventarios
  const NoInventoriesWarning = () => (
    <div className="text-center py-10 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
      <Warehouse className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50 mb-2">Aún no tienes inventarios creados</h2>
      <p className="text-md text-gray-600 dark:text-gray-400 max-w-md mb-1">
        Para comenzar a gestionar tus productos, es fundamental crear un <strong>Inventario Principal</strong> (tipo Local).
      </p>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        Este inventario centralizará todos tus artículos inicialmente. Luego, podrás crear inventarios específicos para brigadas y otros locales.
      </p>
      <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
        <PlusCircle className="mr-2 h-4 w-4" /> Crear Inventario Principal (Local)
      </Button>
    </div>
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Gestión de Inventarios</h1>
          <p className="text-muted-foreground">Crea y administra los inventarios del sistema Valnet.</p>
        </div>
        {/* El botón de crear solo se muestra si ya hay inventarios,
            si no, el componente NoInventoriesWarning tendrá su propio botón */}
        {inventariosParaMostrar.length > 0 && (
          <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Crear Nuevo Inventario
          </Button>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <NewInventoryForm 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={handleInventoryCreated} 
          />
        </DialogContent>
      </Dialog>

      {inventariosParaMostrar.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {inventariosParaMostrar.map((inventario) => (
            <Card key={inventario.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{inventario.nombre}</CardTitle>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary flex items-center">
                    {getIconForType(inventario.tipo)}
                    {getTypeName(inventario.tipo)}
                  </span>
                </div>
                {inventario.descripcion && (
                  <CardDescription className="text-sm pt-1">{inventario.descripcion}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">
                  Haz clic en "Gestionar" para ver los detalles y artículos.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => {
                  navigate(`/almacen/inventarios/${inventario.id}`);
                }}>
                  Gestionar Inventario
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <NoInventoriesWarning />
      )}
    </div>
  );
}
