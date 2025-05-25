import { useForm } from "react-hook-form";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { useAlmacenState } from "@/context/global/useAlmacenState";
import { Plus } from "lucide-react";
import { useEffect } from "react";

export interface NuevaBrigadaFormValues {
  nombre: string;
  matricula: string;
  inventarioId: string;
  coordenadas: {
    lat: number;
    lng: number;
  };
  kilometrajeActual: number;
}

interface NuevaBrigadaFormProps {
  onSubmit: (values: NuevaBrigadaFormValues) => Promise<void>;
  onNewInventoryClick: () => void;
}

export const NuevaBrigadaForm = ({ onSubmit, onNewInventoryClick }: NuevaBrigadaFormProps) => {
  const { inventarios, subscribeToInventarios } = useAlmacenState()

  const form = useForm<NuevaBrigadaFormValues>({
    defaultValues: {
      nombre: "",
      matricula: "",
      inventarioId: "",
      coordenadas: {
        lat: 0,
        lng: 0
      },
      kilometrajeActual: 0
    },
  });

  useEffect(() => {
   const unsub = subscribeToInventarios()
   return () => unsub()
  }, [subscribeToInventarios])


  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Nombre de la brigada" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="matricula"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Matrícula</FormLabel>
              <FormControl>
                <Input placeholder="Matrícula del vehículo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="inventarioId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inventario Asignado</FormLabel>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar inventario" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {inventarios.map(inv => (
                        <SelectItem key={inv.id} value={inv.id}>
                          {inv.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  className="h-10 w-10"
                  onClick={onNewInventoryClick}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <FormDescription>
                Inventario que se asignará a esta brigada para control de equipos y materiales
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="kilometrajeActual"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kilometraje actual</FormLabel>
              <FormControl>
                <Input type="number" min={0} placeholder="Kilometraje actual del vehículo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="coordenadas.lat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitud</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Latitud" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="coordenadas.lng"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitud</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Longitud" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <DialogFooter>
          <Button type="submit">Guardar Brigada</Button>
        </DialogFooter>
      </form>
    </Form>
  )
}