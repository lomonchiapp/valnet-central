import { useForm, SubmitHandler } from "react-hook-form";
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
import { Loader2 } from "lucide-react";
import { useUbicaciones } from "../hooks/useUbicaciones";
import { useEffect } from "react";
import { Ubicacion } from "@/types/interfaces/almacen/ubicacion";

interface NuevaUbicacionFormValues {
  nombre: string;
}

interface NuevaUbicacionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUbicacionCreada?: (ubicacionId: string, ubicacionNombre: string) => void;
  ubicacionToEdit?: Ubicacion;
}

export function NuevaUbicacionForm({ 
  open, 
  onOpenChange, 
  onUbicacionCreada, 
  ubicacionToEdit 
}: NuevaUbicacionFormProps) {
  const { crearUbicacion, actualizarUbicacion, isLoading, error } = useUbicaciones();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<NuevaUbicacionFormValues>({
    defaultValues: {
      nombre: "",
    },
  });

  // Set form values when editing an existing location
  useEffect(() => {
    if (ubicacionToEdit && open) {
      setValue("nombre", ubicacionToEdit.nombre);
    } else if (!ubicacionToEdit && open) {
      reset();
    }
  }, [ubicacionToEdit, open, setValue, reset]);

  const onSubmit: SubmitHandler<NuevaUbicacionFormValues> = async (data) => {
    // If we're editing an existing location
    if (ubicacionToEdit) {
      const success = await actualizarUbicacion({
        id: ubicacionToEdit.id,
        nombre: data.nombre,
      });
      
      if (success) {
        toast.success(`Ubicación "${data.nombre}" actualizada correctamente`);
        reset();
        onOpenChange(false);
        
        if (onUbicacionCreada) {
          onUbicacionCreada(ubicacionToEdit.id, data.nombre);
        }
      } else if (error) {
        toast.error(error);
      }
    } else {
      // Creating a new location
      const ubicacion = await crearUbicacion({ nombre: data.nombre });
      
      if (ubicacion) {
        toast.success(`Ubicación "${data.nombre}" creada correctamente`);
        reset();
        onOpenChange(false);
        
        if (onUbicacionCreada) {
          onUbicacionCreada(ubicacion.id, ubicacion.nombre);
        }
      } else if (error) {
        toast.error(error);
      }
    }
  };

  const handleDialogClose = () => {
    if (!isLoading) {
      reset();
      onOpenChange(false);
    }
  };

  const isEditMode = !!ubicacionToEdit;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Ubicación" : "Nueva Ubicación"}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Modifica los detalles de la ubicación seleccionada." 
              : "Crea una nueva ubicación para los artículos en el inventario."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right">
                Nombre
              </Label>
              <Input
                id="nombre"
                className="col-span-3"
                {...register("nombre", {
                  required: "El nombre es obligatorio",
                  minLength: {
                    value: 2,
                    message: "El nombre debe tener al menos 2 caracteres",
                  },
                })}
              />
              {errors.nombre && (
                <p className="text-destructive text-sm col-start-2 col-span-3">
                  {errors.nombre.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleDialogClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Actualizar Ubicación" : "Crear Ubicación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 