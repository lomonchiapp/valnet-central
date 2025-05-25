import { useState, useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
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
import { Loader2, ChevronsUpDown, Check } from "lucide-react";
import { useSalidaArticulo } from "../hooks/useSalidaArticulo";
import { useAlmacenState } from "@/context/global/useAlmacenState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TipoMovimiento } from "@/types/interfaces/almacen/movimiento";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface SalidaArticuloFormProps {
  articulo: Articulo;
  inventarioId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSalidaCompletada?: () => void;
  usuarioId: string;
}

interface SalidaArticuloFormValues {
  cantidad: number;
  tipoMovimiento: TipoMovimiento;
  inventarioDestino: string;
  ubicacionDestino: string;
  descripcion: string;
}

export function SalidaArticuloForm({ 
  articulo, 
  inventarioId, 
  open, 
  onOpenChange, 
  onSalidaCompletada,
  usuarioId 
}: SalidaArticuloFormProps) {
  const { realizarSalida, realizarTransferencia, isLoading } = useSalidaArticulo();
  const { inventarios, ubicaciones, subscribeToInventarios, subscribeToUbicaciones } = useAlmacenState();
  const [openUbicacionCombobox, setOpenUbicacionCombobox] = useState(false);
  const [searchValueUbicacion, setSearchValueUbicacion] = useState("");
  
  // Validate articulo is complete and valid
  useEffect(() => {
    if (open && (!articulo || !articulo.id)) {
      console.error("SalidaArticuloForm: articulo or articulo.id is missing", articulo);
      toast.error("Error: Artículo no válido");
      onOpenChange(false);
    }
  }, [open, articulo, onOpenChange]);

  // Subscribe to inventarios and ubicaciones
  useEffect(() => {
    const unsubInventarios = subscribeToInventarios();
    const unsubUbicaciones = subscribeToUbicaciones();
    return () => {
      unsubInventarios();
      unsubUbicaciones();
    };
  }, [subscribeToInventarios, subscribeToUbicaciones]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<SalidaArticuloFormValues>({
    defaultValues: {
      cantidad: 1,
      tipoMovimiento: TipoMovimiento.SALIDA,
      inventarioDestino: "",
      ubicacionDestino: "",
      descripcion: "",
    },
  });

  const tipoMovimientoSeleccionado = watch("tipoMovimiento");
  const esTransferencia = tipoMovimientoSeleccionado === TipoMovimiento.TRANSFERENCIA;

  const onSubmit: SubmitHandler<SalidaArticuloFormValues> = async (data) => {
    console.log("Form submitted with data:", data);
    
    // Check if articulo and articulo.id exist
    if (!articulo || !articulo.id) {
      toast.error("Error: No se ha seleccionado un artículo válido");
      return;
    }
    
    const params = {
      articuloId: articulo.id,
      inventarioOrigenId: inventarioId,
      inventarioDestinoId: esTransferencia ? data.inventarioDestino : undefined,
      cantidad: data.cantidad,
      descripcion: data.descripcion,
      ubicacionDestino: esTransferencia ? data.ubicacionDestino : undefined,
      usuarioId,
    };
    console.log("Sending params:", params);

    let resultado;
    try {
      if (esTransferencia) {
        console.log("Calling realizarTransferencia");
        resultado = await realizarTransferencia(params);
      } else {
        console.log("Calling realizarSalida");
        resultado = await realizarSalida(params);
      }
      console.log("Result:", resultado);

      if (resultado.success) {
        toast.success(resultado.message);
        reset();
        onOpenChange(false);
        if (onSalidaCompletada) {
          onSalidaCompletada();
        }
      } else {
        console.error("Error in transfer:", resultado.message);
        toast.error(resultado.message);
      }
    } catch (error) {
      console.error("Exception caught:", error);
      toast.error("Error inesperado: " + (error instanceof Error ? error.message : "Desconocido"));
    }
  };

  const handleDialogClose = () => {
    if (!isLoading) {
      reset();
      onOpenChange(false);
    }
  };

  // Filter out the current inventory from the destination options
  const inventariosDestino = inventarios.filter(inv => inv.id !== inventarioId);

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {esTransferencia ? "Transferir Artículo" : "Registrar Salida de Artículo"}
          </DialogTitle>
          <DialogDescription>
            {articulo.nombre} - {articulo.marca} {articulo.modelo}
            <div className="mt-1 text-sm">
              Disponible: <span className="font-semibold">{articulo.cantidad}</span> {articulo.unidad}
            </div>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipoMovimiento" className="text-right">
                Tipo
              </Label>
              <Controller
                control={control}
                name="tipoMovimiento"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccionar tipo de movimiento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TipoMovimiento.SALIDA}>Salida</SelectItem>
                      <SelectItem value={TipoMovimiento.TRANSFERENCIA}>Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cantidad" className="text-right">
                Cantidad
              </Label>
              <Input
                id="cantidad"
                type="number"
                min="1"
                max={articulo.cantidad}
                className="col-span-3"
                {...register("cantidad", {
                  required: "La cantidad es obligatoria",
                  min: {
                    value: 1,
                    message: "La cantidad debe ser al menos 1",
                  },
                  max: {
                    value: articulo.cantidad,
                    message: `La cantidad no puede ser mayor a ${articulo.cantidad}`,
                  },
                  valueAsNumber: true,
                })}
                disabled={isLoading}
              />
              {errors.cantidad && (
                <p className="text-destructive text-sm col-start-2 col-span-3">
                  {errors.cantidad.message}
                </p>
              )}
            </div>

            {esTransferencia && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="inventarioDestino" className="text-right">
                    Destino
                  </Label>
                  <Controller
                    control={control}
                    name="inventarioDestino"
                    rules={{ required: "El inventario destino es obligatorio" }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <SelectTrigger 
                          className={cn(
                            "col-span-3",
                            errors.inventarioDestino && "border-destructive"
                          )}
                        >
                          <SelectValue placeholder="Seleccionar inventario destino" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventariosDestino.map((inv) => (
                            <SelectItem key={inv.id} value={inv.id}>
                              {inv.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.inventarioDestino && (
                    <p className="text-destructive text-sm col-start-2 col-span-3">
                      {errors.inventarioDestino.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ubicacionDestino" className="text-right">
                    Ubicación
                  </Label>
                  <div className="col-span-3">
                    <Controller
                      name="ubicacionDestino"
                      control={control}
                      render={({ field }) => (
                        <Popover open={openUbicacionCombobox} onOpenChange={setOpenUbicacionCombobox}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openUbicacionCombobox}
                              className="w-full justify-between"
                              disabled={isLoading}
                            >
                              {field.value
                                ? ubicaciones.find((u) => u.id === field.value)?.nombre || field.value
                                : "-- Seleccionar ubicación --"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput 
                                placeholder="Buscar ubicación..." 
                                value={searchValueUbicacion}
                                onValueChange={setSearchValueUbicacion}
                              />
                              <CommandList>
                                <CommandEmpty>
                                  {searchValueUbicacion === "" ? "Escriba para buscar." : `No se encontró la ubicación "${searchValueUbicacion}".`}
                                </CommandEmpty>
                                <CommandGroup>
                                  {ubicaciones
                                    .filter(u => u.nombre.toLowerCase().includes(searchValueUbicacion.toLowerCase()))
                                    .sort((a,b) => a.nombre.localeCompare(b.nombre))
                                    .map((u) => (
                                      <CommandItem
                                        key={u.id}
                                        value={u.id}
                                        onSelect={(currentValue) => {
                                          field.onChange(currentValue === field.value ? "" : currentValue);
                                          setOpenUbicacionCombobox(false);
                                          setSearchValueUbicacion("");
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            field.value === u.id ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {u.nombre}
                                      </CommandItem>
                                    ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="descripcion" className="text-right pt-2">
                Descripción
              </Label>
              <Textarea
                id="descripcion"
                className="col-span-3"
                rows={3}
                {...register("descripcion", {
                  required: "La descripción es obligatoria",
                })}
                placeholder={esTransferencia 
                  ? "Motivo de la transferencia" 
                  : "Motivo de la salida, destino, etc."
                }
                disabled={isLoading}
              />
              {errors.descripcion && (
                <p className="text-destructive text-sm col-start-2 col-span-3">
                  {errors.descripcion.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleDialogClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              onClick={() => console.log("Submit button clicked")}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {esTransferencia ? "Transferir" : "Registrar Salida"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 