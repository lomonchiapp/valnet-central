import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PackageIcon, HardHatIcon, WrenchIcon, Loader2, AlertTriangleIcon } from "lucide-react";
import { useAlmacenState } from "@/context/global/useAlmacenState";
import { TipoArticulo } from "@/types/interfaces/almacen/articulo";

interface InventarioBrigadaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventarioId: string | null;
  brigadaNombre: string;
}

export function InventarioBrigadaDialog({
  open,
  onOpenChange,
  inventarioId,
  brigadaNombre,
}: InventarioBrigadaDialogProps) {
  const [isLoading, setIsLoading] = useState(true);
  const { inventarios, articulos, subscribeToArticulos } = useAlmacenState();

  // Suscribirse a artículos cuando se abre el diálogo
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    if (open && inventarioId) {
      setIsLoading(true);
      
      // Suscribirse a los artículos
      unsubscribe = subscribeToArticulos();
      
      // Simular un tiempo mínimo de carga para mejor UX
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800);
      
      return () => {
        clearTimeout(timer);
        if (unsubscribe) unsubscribe();
      };
    }
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [open, inventarioId, subscribeToArticulos]);

  // Obtener el inventario seleccionado
  const inventarioSeleccionado = inventarioId 
    ? inventarios.find(inv => inv.id === inventarioId) 
    : null;

  // Filtrar artículos por el inventario seleccionado
  const articulosInventario = articulos.filter(articulo => 
    articulo.idinventario === inventarioId
  );

  // Separar artículos por tipo
  const materiales = articulosInventario.filter(
    articulo => articulo.tipo === TipoArticulo.MATERIAL
  );
  
  const equipos = articulosInventario.filter(
    articulo => articulo.tipo === TipoArticulo.EQUIPO
  );

  // Función para determinar el color del badge según la ubicación del artículo
  const getBadgeClass = (ubicacion?: string): string => {
    if (!ubicacion) return "bg-blue-50 text-blue-700 border-blue-200";
    
    const ubicacionLower = ubicacion.toLowerCase();
    if (ubicacionLower.includes("buen") || ubicacionLower.includes("nuevo")) {
      return "bg-green-50 text-green-700 border-green-200";
    } else if (ubicacionLower.includes("regular")) {
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    } else {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  // Formatear precio para que se muestre como moneda
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageIcon className="h-5 w-5" />
            Inventario de Brigada: {brigadaNombre}
          </DialogTitle>
          <DialogDescription>
            {inventarioSeleccionado ? (
              <>
                <span className="font-medium">{inventarioSeleccionado.nombre}</span> - 
                Visualización del inventario asignado a esta brigada.
              </>
            ) : (
              "Cargando información del inventario..."
            )}
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-2" />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Cargando inventario...</p>
          </div>
        ) : (
          <Tabs defaultValue="equipos" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="equipos" className="flex items-center gap-2">
                <WrenchIcon className="h-4 w-4" />
                Equipos <Badge variant="secondary" className="ml-1">{equipos.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="materiales" className="flex items-center gap-2">
                <HardHatIcon className="h-4 w-4" />
                Materiales <Badge variant="secondary" className="ml-1">{materiales.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="equipos" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Equipos</CardTitle>
                  <CardDescription>
                    Equipos asignados a la brigada para realizar sus operaciones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {equipos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <AlertTriangleIcon className="h-12 w-12 text-yellow-500 mb-2 opacity-70" />
                      <p>No hay equipos registrados en este inventario</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Marca/Modelo</TableHead>
                          <TableHead>Serial</TableHead>
                          <TableHead>Costo</TableHead>
                          <TableHead>Ubicación</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {equipos.map(equipo => (
                          <TableRow key={equipo.id}>
                            <TableCell className="font-medium">
                              {equipo.nombre}
                              {equipo.descripcion && (
                                <div className="text-xs text-muted-foreground">{equipo.descripcion}</div>
                              )}
                            </TableCell>
                            <TableCell>{equipo.marca} / {equipo.modelo}</TableCell>
                            <TableCell>{equipo.serial}</TableCell>
                            <TableCell>{formatCurrency(equipo.costo)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getBadgeClass(equipo.ubicacion)}>
                                {equipo.ubicacion || "No especificado"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="materiales" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Materiales</CardTitle>
                  <CardDescription>
                    Materiales asignados a la brigada para realizar sus operaciones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {materiales.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <AlertTriangleIcon className="h-12 w-12 text-yellow-500 mb-2 opacity-70" />
                      <p>No hay materiales registrados en este inventario</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Cantidad</TableHead>
                          <TableHead>Unidad</TableHead>
                          <TableHead>Costo Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {materiales.map(material => (
                          <TableRow key={material.id}>
                            <TableCell className="font-medium">
                              {material.nombre}
                              {material.descripcion && (
                                <div className="text-xs text-muted-foreground">{material.descripcion}</div>
                              )}
                            </TableCell>
                            <TableCell>{material.cantidad}</TableCell>
                            <TableCell>{material.unidad}</TableCell>
                            <TableCell>{formatCurrency(material.cantidad * material.costo)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
} 