import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus, PenIcon, Trash2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { ControlCombustible } from "@/types/interfaces/coordinacion/controlCombustible";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface NuevoControlCombustibleFormValues {
  fecha: Date;
  galones: number;
  precio_galon: number;
  km_inicial: number;
  km_final: number;
  idbrigada: string;
  referencia: string;
}

export function ControlCombustiblePanel() {
  const [registros, setRegistros] = useState<ControlCombustible[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [brigadas] = useState([
    { id: "brigada-1", nombre: "Brigada Norte" },
    { id: "brigada-2", nombre: "Brigada Sur" },
    { id: "brigada-3", nombre: "Brigada Este" },
  ]);

  // Form for new fuel control
  const form = useForm<NuevoControlCombustibleFormValues>({
    defaultValues: {
      fecha: new Date(),
      galones: 0,
      precio_galon: 0,
      km_inicial: 0,
      km_final: 0,
      idbrigada: "",
      referencia: ""
    },
  });

  const onSubmit = (values: NuevoControlCombustibleFormValues) => {
    // Here you would typically handle the API call to save the fuel control
    // For now just add it to the local state
    const newRegistro: ControlCombustible = {
      ...values,
      fecha: format(values.fecha, "yyyy-MM-dd"),
      id: `combustible-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setRegistros([...registros, newRegistro]);
    setIsDialogOpen(false);
    form.reset();
  };

  const getBrigadaNombre = (id: string) => {
    const brigada = brigadas.find(b => b.id === id);
    return brigada ? brigada.nombre : id;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Control de Combustible</CardTitle>
            <CardDescription>
              Administra los registros de combustible para las brigadas
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-9">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Registro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Control de Combustible</DialogTitle>
                <DialogDescription>
                  Completa el formulario para registrar un nuevo control de combustible
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fecha"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: es })
                                ) : (
                                  <span>Selecciona una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="idbrigada"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brigada</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una brigada" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brigadas.map((brigada) => (
                              <SelectItem key={brigada.id} value={brigada.id}>
                                {brigada.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="galones"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Galones</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Cantidad de galones" 
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
                      name="precio_galon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio por galón</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Precio por galón" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="km_inicial"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>KM Inicial</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Kilometraje inicial" 
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
                      name="km_final"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>KM Final</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Kilometraje final" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="referencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referencia</FormLabel>
                        <FormControl>
                          <Input placeholder="Referencia o nota" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit">Guardar Registro</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Brigada</TableHead>
                  <TableHead>Galones</TableHead>
                  <TableHead>Precio/Galón</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>KM Recorridos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registros.length > 0 ? (
                  registros.map(registro => (
                    <TableRow key={registro.id}>
                      <TableCell>{registro.fecha}</TableCell>
                      <TableCell>{getBrigadaNombre(registro.idbrigada)}</TableCell>
                      <TableCell>{registro.galones}</TableCell>
                      <TableCell>${registro.precio_galon.toFixed(2)}</TableCell>
                      <TableCell>${(registro.galones * registro.precio_galon).toFixed(2)}</TableCell>
                      <TableCell>{registro.km_final - registro.km_inicial}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <PenIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      No hay registros de combustible
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 