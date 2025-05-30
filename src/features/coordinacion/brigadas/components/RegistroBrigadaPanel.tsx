import  { useState, useEffect, useRef } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, PenIcon, Trash2Icon, PackageIcon, CalendarIcon, TagIcon, MapPinIcon } from "lucide-react";
import { Brigada } from "@/types/interfaces/coordinacion/brigada";
import { useAlmacenState } from "@/context/global/useAlmacenState";
import { NewInventoryForm } from "@/features/almacen/inventarios/components/NewInventoryForm";
import { useCoordinacionState } from "@/context/global/useCoordinacionState";
import { NuevaBrigadaForm, NuevaBrigadaFormValues } from "./NuevaBrigadaForm";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { InventarioBrigadaDialog } from "./InventarioBrigadaDialog";
import { useCrearBrigada } from "../hooks/useCrearBrigada";

// Tipos para manejar las fechas de Firestore
type FirestoreTimestamp = {
  toDate: () => Date;
};

type DateValue = Date | string | FirestoreTimestamp | null | undefined;

export function RegistroBrigadaPanel() {
  const { brigadas, setBrigadas } = useCoordinacionState();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewInventoryDialogOpen, setIsNewInventoryDialogOpen] = useState(false);
  const [isInventarioDialogOpen, setIsInventarioDialogOpen] = useState(false);
  const [selectedBrigada, setSelectedBrigada] = useState<Brigada | null>(null);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null);
  const formRef = useRef<{ setInventoryId: (id: string) => void } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Usar inventarios reales de Firestore
  const { inventarios, subscribeToInventarios } = useAlmacenState();
  const crearBrigada = useCrearBrigada();
  
  // Suscribirse a los inventarios reales
  useEffect(() => {
    const unsubscribe = subscribeToInventarios();
    
    // Simular una carga para mejorar la UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [subscribeToInventarios]);

  // Cuando cambia el selectedInventoryId, actualizar el formulario
  useEffect(() => {
    if (selectedInventoryId && formRef.current) {
      formRef.current.setInventoryId(selectedInventoryId);
    }
  }, [selectedInventoryId]);

  const onSubmit = async (values: NuevaBrigadaFormValues) => {
    // Crear la brigada en la base de datos
    const result = await crearBrigada(values);
    if (result && result.id) {
      setBrigadas([
        ...brigadas,
        {
          ...result,
          inventarioId: result.inventarioId || "",
          coordenadas: result.coordenadas || { lat: 0, lng: 0 },
        },
      ]);
    }
    setIsDialogOpen(false);
  };

  // Función para obtener el nombre de un inventario a partir de su ID
  const getInventarioNombre = (id: string | undefined) => {
    if (!id) return "No asignado";
    const inventario = inventarios.find(inv => inv.id === id);
    return inventario ? inventario.nombre : id;
  };

  const handleNewInventoryCreated = (newInventoryId: string) => {
    // Save the newly created inventory ID to use it when the form is rendered
    setSelectedInventoryId(newInventoryId);
    setIsNewInventoryDialogOpen(false);
  };

  // Función para formatear la fecha
  const formatDate = (date: DateValue): string => {
    if (!date) return "Fecha desconocida";
    
    // Si es un timestamp de Firestore
    if (date && typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
      date = date.toDate();
    }
    
    // Si es un string, convertir a Date
    if (typeof date === 'string') {
      date = new Date(date);
    }
    
    // Verificar si es un objeto Date válido
    if (date instanceof Date && !isNaN(date.getTime())) {
      return format(date, "d 'de' MMMM, yyyy", { locale: es });
    }
    
    return "Fecha inválida";
  };

  // Función para eliminar una brigada
  const handleDeleteBrigada = (id: string) => {
    // Aquí iría la lógica para eliminar de Firebase
    // Por ahora solo lo quitamos del estado local
    setBrigadas(brigadas.filter(b => b.id !== id));
  };

  // Función para ver el inventario de una brigada
  const handleVerInventario = (brigada: Brigada) => {
    setSelectedBrigada(brigada);
    setIsInventarioDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Registro de Brigadas</CardTitle>
            <CardDescription>
              Administra el registro de brigadas en el sistema
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-9">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Brigada
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Registrar Nueva Brigada</DialogTitle>
                <DialogDescription>
                  Completa el formulario para registrar una nueva brigada
                </DialogDescription>
              </DialogHeader>
              
              <NuevaBrigadaForm 
                onSubmit={onSubmit}
                onNewInventoryClick={() => setIsNewInventoryDialogOpen(true)}
              />
            </DialogContent>
          </Dialog>
          
          {/* Dialog for new inventory creation */}
          <Dialog open={isNewInventoryDialogOpen} onOpenChange={setIsNewInventoryDialogOpen}>
            <DialogContent>
              <NewInventoryForm 
                onClose={() => setIsNewInventoryDialogOpen(false)} 
                onSuccess={handleNewInventoryCreated}
              />
            </DialogContent>
          </Dialog>

          {/* Dialog para ver el inventario de una brigada */}
          <InventarioBrigadaDialog
            open={isInventarioDialogOpen}
            onOpenChange={setIsInventarioDialogOpen}
            inventarioId={selectedBrigada?.inventarioId || null}
            brigadaNombre={selectedBrigada?.nombre || ""}
          />
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(3).fill(null).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-1/2 mb-2" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <Skeleton className="h-9 w-28" />
                    <div className="flex gap-1">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : brigadas.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <PackageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
              <h3 className="text-lg font-medium mb-1">No hay brigadas registradas</h3>
              <p className="text-muted-foreground mb-4">Crea una nueva brigada para empezar a gestionar tu equipo</p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                variant="outline"
                className="mx-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear brigada
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {brigadas.map(brigada => (
                <Card key={brigada.id} className="overflow-hidden border-l-4 hover:shadow-md transition-shadow duration-200" style={{ borderLeftColor: '#0ea5e9' }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      {brigada.nombre}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <TagIcon className="h-3 w-3" />
                        {brigada.matricula}
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <PackageIcon className="h-3 w-3" />
                        {getInventarioNombre(brigada.inventarioId)}
                      </Badge>
                      {brigada.coordenadas && (brigada.coordenadas.lat !== 0 || brigada.coordenadas.lng !== 0) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center gap-1 cursor-help">
                                <MapPinIcon className="h-3 w-3" />
                                Ubicación
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Lat: {brigada.coordenadas.lat}, Lng: {brigada.coordenadas.lng}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      Creado: {formatDate(brigada.createdAt)}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => handleVerInventario(brigada)}
                      disabled={!brigada.inventarioId} // Deshabilitar si no hay inventario asignado
                    >
                      <PackageIcon className="h-4 w-4" />
                      Ver Inventario
                    </Button>
                    <div className="flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <PenIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar brigada</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteBrigada(brigada.id)}
                              className="hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Eliminar brigada</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 