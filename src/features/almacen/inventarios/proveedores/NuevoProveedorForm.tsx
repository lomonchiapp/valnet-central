import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { addDoc, collection, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { database } from "@/firebase";
import { Proveedor } from "@/types/interfaces/almacen/proveedor";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NuevoProveedorFormValues {
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  contacto: string;
}

interface NuevoProveedorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProveedorCreado?: (proveedor: Proveedor) => void;
}

export function NuevoProveedorForm({ open, onOpenChange, onProveedorCreado }: NuevoProveedorFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NuevoProveedorFormValues>();

  const onSubmit: SubmitHandler<NuevoProveedorFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const docRef = await addDoc(collection(database, "proveedores"), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await updateDoc(doc(database, "proveedores", docRef.id), {
        id: docRef.id,
      });
      const nuevoProveedor: Proveedor = {
        id: docRef.id,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      toast.success(`Proveedor "${data.nombre}" creado exitosamente.`);
      if (onProveedorCreado) {
        onProveedorCreado(nuevoProveedor);
      }
      reset();
      onOpenChange(false);
    } catch (error) {
      //eslint-disable-next-line no-console
      console.error("Error creando proveedor:", error);
      toast.error("Error al crear el proveedor. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = () => {
    if (!isLoading) {
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Proveedor</DialogTitle>
          <DialogDescription>
            Ingrese los datos del proveedor para agregarlo al sistema.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div>
            <Label htmlFor="nombreProveedor">Nombre <span className="text-destructive">*</span></Label>
            <Input
              id="nombreProveedor"
              placeholder="Ej: Suministros S.A."
              {...register("nombre", { required: "El nombre es obligatorio." })}
              className={errors.nombre ? "border-destructive" : ""}
              disabled={isLoading}
            />
            {errors.nombre && <p className="text-xs text-destructive mt-1">{errors.nombre.message}</p>}
          </div>
          <div>
            <Label htmlFor="direccionProveedor">Dirección</Label>
            <Input
              id="direccionProveedor"
              placeholder="Dirección física"
              {...register("direccion")}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="telefonoProveedor">Teléfono</Label>
            <Input
              id="telefonoProveedor"
              placeholder="Ej: +52 123 456 7890"
              {...register("telefono")}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="emailProveedor">Email</Label>
            <Input
              id="emailProveedor"
              placeholder="correo@ejemplo.com"
              type="email"
              {...register("email")}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="contactoProveedor">Contacto</Label>
            <Input
              id="contactoProveedor"
              placeholder="Persona de contacto"
              {...register("contacto")}
              disabled={isLoading}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar Proveedor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 