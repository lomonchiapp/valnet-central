import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Articulo } from "shared-types";
import { Loader2 } from "lucide-react";
import { useAlmacenState } from "@/context/global/useAlmacenState";
import { useActualizarArticulo } from "../hooks/useActualizarArticulo";

// Extended type for our UI that includes additional fields
interface ExtendedArticulo extends Articulo {
  codigoBarras?: string;
  mac?: string;
  wirelessKey?: string;
  garantia?: number;
  imagenUrl?: string;
}

interface EditEquipoFormProps {
  equipo: ExtendedArticulo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEquipoUpdated?: () => void;
}

export function EditEquipoForm({ equipo, open, onOpenChange, onEquipoUpdated }: EditEquipoFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Get marcas from global state
  const { marcas, subscribeToMarcas } = useAlmacenState();
  
  // Use our new hook
  const { actualizarArticulo, error: updateError } = useActualizarArticulo();
  
  // Subscribe to marcas on component mount
  useEffect(() => {
    const unsubscribe = subscribeToMarcas();
    return () => unsubscribe();
  }, [subscribeToMarcas]);
  
  // Function to get brand name from brand ID
  const getBrandName = (brandId: string): string => {
    const brand = marcas.find(m => m.id === brandId);
    return brand ? brand.nombre : brandId;
  };

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<ExtendedArticulo>({
    defaultValues: {
      serial: equipo?.serial || "",
      descripcion: equipo?.descripcion || "",
      ubicacion: equipo?.ubicacion || "",
      mac: equipo?.mac || "",
      wirelessKey: equipo?.wirelessKey || "",
      garantia: equipo?.garantia || 0,
      costo: equipo?.costo || 0,
    },
  });

  // Reset form when equipo changes
  useState(() => {
    if (equipo) {
      reset({
        serial: equipo.serial || "",
        descripcion: equipo.descripcion || "",
        ubicacion: equipo.ubicacion || "",
        mac: equipo.mac || "",
        wirelessKey: equipo.wirelessKey || "",
        garantia: equipo.garantia || 0,
        costo: equipo.costo || 0,
      });
    }
  });

  const onSubmit = async (data: Partial<ExtendedArticulo>) => {
    if (!equipo) return;
    
    setIsLoading(true);
    
    try {
      const success = await actualizarArticulo({
        id: equipo.id,
        serial: data.serial,
        descripcion: data.descripcion,
        ubicacion: data.ubicacion,
        mac: data.mac,
        wirelessKey: data.wirelessKey,
        garantia: data.garantia,
        costo: data.costo,
      });
      
      if (success) {
        toast.success("Equipo actualizado correctamente");
        onOpenChange(false);
        if (onEquipoUpdated) onEquipoUpdated();
      } else {
        toast.error("Error al actualizar el equipo");
      }
    } catch {
      toast.error("Error al actualizar el equipo");
    } finally {
      setIsLoading(false);
    }
  };

  // Show error toast if update error occurs
  useEffect(() => {
    if (updateError) {
      toast.error(`Error: ${updateError.message}`);
    }
  }, [updateError]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Equipo</DialogTitle>
          <DialogDescription>
            {equipo?.nombre} - {equipo?.marca ? getBrandName(equipo.marca) : ""} {equipo?.modelo}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="serial" className="text-right">
                Número de Serie
              </Label>
              <Input
                id="serial"
                className="col-span-3"
                {...register("serial")}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mac" className="text-right">
                Dirección MAC
              </Label>
              <Input
                id="mac"
                className="col-span-3 font-mono"
                {...register("mac")}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="wirelessKey" className="text-right">
                Clave Wireless
              </Label>
              <Input
                id="wirelessKey"
                className="col-span-3"
                {...register("wirelessKey")}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ubicacion" className="text-right">
                Ubicación
              </Label>
              <Input
                id="ubicacion"
                className="col-span-3"
                {...register("ubicacion")}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="garantia" className="text-right">
                Garantía (meses)
              </Label>
              <Input
                id="garantia"
                type="number"
                className="col-span-3"
                {...register("garantia", { valueAsNumber: true })}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="costo" className="text-right">
                Costo
              </Label>
              <Input
                id="costo"
                type="number"
                step="0.01"
                className="col-span-3"
                {...register("costo", { valueAsNumber: true })}
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="descripcion" className="text-right pt-2">
                Descripción
              </Label>
              <Textarea
                id="descripcion"
                className="col-span-3"
                rows={4}
                {...register("descripcion")}
                placeholder="Estado del equipo, observaciones, etc."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 