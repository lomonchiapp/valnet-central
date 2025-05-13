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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TipoArticulo, Unidad, Articulo } from "shared-types";
import { Marca } from "@/types";
import { useAgregarArticulo, NuevoArticuloData } from "../hooks/useAgregarArticulo";
import { useState, useEffect, useCallback } from "react";
import { Upload, X, Cpu, Box, ChevronsUpDown, Check, PlusCircle, Search } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { database } from "@/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlmacenState } from "@/context/global/useAlmacenState";
import { NuevaMarcaForm } from "@/features/almacen/marcas/components/NuevaMarcaForm";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface NuevoArticuloFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventarioId: string;
}

const STEPS = {
  SELECCION_TIPO: 1,
  DETALLES_MATERIAL: 2,
  DETALLES_EQUIPO_MARCA_MODELO: 3,
  DETALLES_EQUIPO_ESPECIFICOS: 4,
};

export function NuevoArticuloForm({ open, onOpenChange, inventarioId }: NuevoArticuloFormProps) {
  const { agregarArticulo, isLoading, error: agregarError } = useAgregarArticulo(inventarioId);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [articuloExistenteDetectado, setArticuloExistenteDetectado] = useState<Partial<NuevoArticuloData> & { id?: string; cantidad?: number; unidad?: Unidad; costo?: number } | null>(null);
  const [isCheckingArticulo, setIsCheckingArticulo] = useState(false);
  const [currentStep, setCurrentStep] = useState(STEPS.SELECCION_TIPO);
  const [showNuevaMarcaForm, setShowNuevaMarcaForm] = useState(false);
  const [marcaPendienteSeleccionId, setMarcaPendienteSeleccionId] = useState<string | null>(null);
  const [openMarcaCombobox, setOpenMarcaCombobox] = useState(false);
  const [searchValueMarca, setSearchValueMarca] = useState("");
  const [openModeloCombobox, setOpenModeloCombobox] = useState(false);
  const [searchValueModelo, setSearchValueModelo] = useState("");
  const [filtroTablaArticulos, setFiltroTablaArticulos] = useState("");
  const [articulosBaseEncontrados, setArticulosBaseEncontrados] = useState<Articulo[]>([]);
  const [isSearchingArticulosBase, setIsSearchingArticulosBase] = useState(false);
  const [selectedArticuloBaseId, setSelectedArticuloBaseId] = useState<string | null>(null);
  const [mostrandoFormNuevoArticuloBase, setMostrandoFormNuevoArticuloBase] = useState(false);
  const [openMaterialNombreCombobox, setOpenMaterialNombreCombobox] = useState(false);
  const [searchValueMaterialNombre, setSearchValueMaterialNombre] = useState("");

  const { marcas, articulos, subscribeToMarcas, subscribeToArticulos } = useAlmacenState();
  console.log("Marcas en NuevoArticuloForm:", marcas);

  useEffect(() => {
    const unsubMarcas = subscribeToMarcas();
    const unsubArticulos = subscribeToArticulos();
    return () => {
      unsubMarcas();
      unsubArticulos();
    };
  }, [subscribeToMarcas, subscribeToArticulos]);
  
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    reset,
    watch,
    setValue,
    trigger,
    getValues,
  } = useForm<NuevoArticuloData>({
    defaultValues: {
      nombre: "",
      descripcion: "",
      tipo: undefined,
      cantidad: 1,
      costo: 0,
      unidad: Unidad.UNIDAD,
      marca: "",
      modelo: "",
      serial: "",
      ubicacion: "",
      imagenUrl: "",
      codigoBarras: "",
      mac: "",
      wirelessKey: "",
      garantia: 0,
    },
    mode: "onChange",
  });

  const tipoSeleccionado = watch("tipo");
  const nombreArticuloWatch = watch("nombre");
  const marcaSeleccionadaWatch = watch("marca");
  const modeloWatch = watch("modelo");

  const resetFormAndState = useCallback(() => {
    reset({
        nombre: "",
        descripcion: "",
        tipo: undefined,
        cantidad: 1,
        costo: 0,
        unidad: Unidad.UNIDAD,
        marca: "",
        modelo: "",
        serial: "",
        ubicacion: "",
        imagenUrl: "",
        codigoBarras: "",
        mac: "",
        wirelessKey: "",
        garantia: 0,
      });
      setSelectedImage(null);
      setImagePreview(null);
      setArticuloExistenteDetectado(null);
      setIsCheckingArticulo(false);
      setArticulosBaseEncontrados([]);
      setIsSearchingArticulosBase(false);
      setSelectedArticuloBaseId(null);
      setMarcaPendienteSeleccionId(null);
      setOpenMarcaCombobox(false);
      setSearchValueMarca("");
      setOpenModeloCombobox(false);
      setSearchValueModelo("");
      setFiltroTablaArticulos("");
  }, [reset]);

  const handleCloseDialog = () => {
    resetFormAndState();
    setCurrentStep(STEPS.SELECCION_TIPO);
    onOpenChange(false);
  };

  useEffect(() => {
    if (!open) {
      handleCloseDialog();
    }
  }, [open]);

  useEffect(() => {
    // Cuando se cambia de marca, o se sale del modo de creación de nuevo tipo base,
    // se resetea el estado de mostrandoFormNuevoArticuloBase
    if (currentStep !== STEPS.DETALLES_EQUIPO_MARCA_MODELO) {
      setMostrandoFormNuevoArticuloBase(false);
    }
  }, [currentStep, marcaSeleccionadaWatch]);

  const verificarArticuloExistenteDebounced = useCallback(
    (() => {
      let timer: NodeJS.Timeout;
      return async (nombre: string) => {
        clearTimeout(timer);
        timer = setTimeout(async () => {
          const currentTipo = getValues("tipo");
          if (!nombre || nombre.trim().length < 3 || currentTipo !== TipoArticulo.MATERIAL) {
            setArticuloExistenteDetectado(null);
            setIsCheckingArticulo(false);
            return;
          }
          setIsCheckingArticulo(true);
          setArticuloExistenteDetectado(null); 

          try {
            const articulosRef = collection(database, 'articulos');
            const q = query(
              articulosRef,
              where('idinventario', '==', inventarioId),
              where('nombre', '==', nombre.trim()),
              where('tipo', '==', TipoArticulo.MATERIAL),
              limit(1)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const docData = querySnapshot.docs[0].data() as NuevoArticuloData;
              setArticuloExistenteDetectado({
                id: querySnapshot.docs[0].id,
                nombre: docData.nombre,
                cantidad: docData.cantidad,
                costo: docData.costo,
                unidad: docData.unidad,
              });
            } else {
              setArticuloExistenteDetectado(null);
            }
          } catch (error) {
            console.error("Error buscando artículo existente:", error);
            setArticuloExistenteDetectado(null);
          } finally {
            setIsCheckingArticulo(false);
          }
        }, 500); 
      };
    })(),
    [inventarioId, getValues]
  );

  useEffect(() => {
    const currentValues = getValues();
    const currentTipo = currentValues.tipo;
    const nombreMaterial = currentValues.nombre;

    if (currentTipo === TipoArticulo.MATERIAL && nombreMaterial) {
      verificarArticuloExistenteDebounced(nombreMaterial);
    } else {
      setArticuloExistenteDetectado(null);
      setIsCheckingArticulo(false);
    }
  }, [nombreArticuloWatch, tipoSeleccionado, getValues, verificarArticuloExistenteDebounced]);

  useEffect(() => {
    const currentTipo = getValues("tipo");
    if (currentTipo === TipoArticulo.EQUIPO) {
      setValue("cantidad", 1);
      setValue("unidad", Unidad.UNIDAD);
    } else if (currentTipo === TipoArticulo.MATERIAL) {
      setValue("serial", "");
      setValue("mac", "");
      setValue("wirelessKey", "");
      setValue("garantia", 0);
    }
  }, [tipoSeleccionado, setValue, getValues]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setValue("imagenUrl", file.name);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setValue("imagenUrl", "");
    const fileInput = document.getElementById('imagenFile') as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const onSubmitHandler: SubmitHandler<NuevoArticuloData> = async (data) => {
    const formData: any = {
      ...data,
      imagen: selectedImage,
    };
    
    const nuevoArticuloId = await agregarArticulo(formData as NuevoArticuloData & { imagen?: File | null });
    if (nuevoArticuloId) {
      toast.success(articuloExistenteDetectado && data.tipo === TipoArticulo.MATERIAL ? "Material actualizado exitosamente" : "Artículo agregado exitosamente");
      handleCloseDialog();
    } else {
      toast.error(`Error al agregar/actualizar el artículo: ${agregarError?.message || "Error desconocido"}`);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof NuevoArticuloData)[] = [];
    switch (currentStep) {
      case STEPS.SELECCION_TIPO:
        if (!tipoSeleccionado) {
          toast.error("Por favor, seleccione un tipo de artículo.");
          return;
        }
        if (tipoSeleccionado === TipoArticulo.MATERIAL) {
          setCurrentStep(STEPS.DETALLES_MATERIAL);
        } else if (tipoSeleccionado === TipoArticulo.EQUIPO) {
          setCurrentStep(STEPS.DETALLES_EQUIPO_MARCA_MODELO);
        }
        return;
      case STEPS.DETALLES_MATERIAL:
        fieldsToValidate = ['nombre', 'cantidad', 'costo', 'unidad'];
        if(articuloExistenteDetectado) {
            fieldsToValidate = ['cantidad'];
            setValue('nombre', articuloExistenteDetectado.nombre || getValues("nombre"));
            setValue('costo', articuloExistenteDetectado.costo !== undefined ? articuloExistenteDetectado.costo : getValues("costo"));
            setValue('unidad', articuloExistenteDetectado.unidad || getValues("unidad"));
        }
        break;
      case STEPS.DETALLES_EQUIPO_MARCA_MODELO:
        fieldsToValidate = ['marca', 'modelo', 'nombre'];
        break;
      case STEPS.DETALLES_EQUIPO_ESPECIFICOS:
        fieldsToValidate = ['serial', 'mac'];
        break;
    }
    
    const isValidStep = await trigger(fieldsToValidate);
    if (isValidStep) {
      if (currentStep === STEPS.DETALLES_MATERIAL || currentStep === STEPS.DETALLES_EQUIPO_ESPECIFICOS) {
         handleSubmit(onSubmitHandler)(); 
      } else {
        if (currentStep === STEPS.DETALLES_EQUIPO_MARCA_MODELO) {
            setCurrentStep(STEPS.DETALLES_EQUIPO_ESPECIFICOS);
        }
      }
    } else {
       toast.error("Por favor, complete todos los campos obligatorios del paso actual.")
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => {
      if (prev === STEPS.DETALLES_MATERIAL || prev === STEPS.DETALLES_EQUIPO_MARCA_MODELO) {
        return STEPS.SELECCION_TIPO;
      }
      if (prev === STEPS.DETALLES_EQUIPO_ESPECIFICOS) {
        return STEPS.DETALLES_EQUIPO_MARCA_MODELO;
      }
      return prev;
    });
  };

  useEffect(() => {
    if (marcaPendienteSeleccionId && marcas.find(m => m.id === marcaPendienteSeleccionId)) {
      setValue("marca", marcaPendienteSeleccionId, { shouldValidate: true, shouldTouch: true });
      trigger("nombre"); 
      setMarcaPendienteSeleccionId(null);
      toast.info(`Marca seleccionada: ${marcas.find(m => m.id === marcaPendienteSeleccionId)?.nombre}`);
    }
  }, [marcaPendienteSeleccionId, marcas, setValue, trigger]);

  const renderStepContent = () => {
    switch (currentStep) {
      case STEPS.SELECCION_TIPO:
        return (
          <div className="space-y-6">
            <DialogDescription className="text-center text-lg">
              Seleccione el tipo de articulo que desea agregar:
            </DialogDescription>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card 
                className={`cursor-pointer hover:shadow-xl transition-shadow ${tipoSeleccionado === TipoArticulo.EQUIPO ? 'ring-2 ring-primary shadow-xl' : 'hover:border-primary/70'}`}
                onClick={() => {
                  setValue("tipo", TipoArticulo.EQUIPO, { shouldValidate: true, shouldTouch: true });
                  nextStep(); 
                }}
              >
                <CardHeader className="items-center">
                  <Cpu size={48} className="mb-3 text-primary" />
                  <CardTitle>Equipo</CardTitle>
                  <CardDescription className="text-center">Artículo único con número de serie/MAC (ej: Router, ONT, Antena).</CardDescription>
                </CardHeader>
              </Card>
              <Card 
                className={`cursor-pointer hover:shadow-xl transition-shadow ${tipoSeleccionado === TipoArticulo.MATERIAL ? 'ring-2 ring-primary shadow-xl' : 'hover:border-primary/70'}`}
                onClick={() => {
                  setValue("tipo", TipoArticulo.MATERIAL, { shouldValidate: true, shouldTouch: true });
                  nextStep();
                }}
              >
                <CardHeader className="items-center">
                  <Box size={48} className="mb-3 text-primary" />
                  <CardTitle>Material</CardTitle>
                  <CardDescription className="text-center">Artículo consumible o de stock (ej: Cable, Conectores, Cajas).</CardDescription>
                </CardHeader>
              </Card>
            </div>
            {errors.tipo && <p className="text-xs text-destructive mt-2 text-center">{errors.tipo.message}</p>}
          </div>
        );
      case STEPS.DETALLES_MATERIAL:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="nombre">Nombre del Material <span className="text-destructive">*</span></Label>
                <Controller
                  name="nombre"
                  control={control}
                  rules={{ 
                    required: "El nombre es obligatorio.",
                    minLength: { value: 3, message: "Mínimo 3 caracteres." }
                  }}
                  render={({ field }) => (
                    <Popover open={openMaterialNombreCombobox} onOpenChange={setOpenMaterialNombreCombobox}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openMaterialNombreCombobox}
                          className={`w-full justify-between ${errors.nombre ? "border-destructive" : ""}`}
                          disabled={!!articuloExistenteDetectado || isLoading}
                        >
                          {field.value || "-- Escriba o seleccione un material --"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command
                          filter={(value, search) => {
                            // Si el valor es el del campo y coincide con la búsqueda, o si el item incluye la búsqueda
                            if (value === search) return 1;
                            return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
                          }}
                        >
                          <CommandInput 
                            placeholder="Buscar o crear material..."
                            value={searchValueMaterialNombre}
                            onValueChange={(search) => {
                                setSearchValueMaterialNombre(search);
                                if (!openMaterialNombreCombobox && search.length > 0) {
                                    setOpenMaterialNombreCombobox(true);
                                }
                                // Actualizar el campo del formulario directamente al escribir en el input del combobox
                                // Esto permite crear nuevos nombres directamente.
                                field.onChange(search); 
                            }}
                            disabled={!!articuloExistenteDetectado || isLoading}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {searchValueMaterialNombre.trim() === "" 
                                ? "Escriba para buscar materiales existentes." 
                                : `No se encontró el material "${searchValueMaterialNombre}". Puede crearlo con este nombre.`}
                            </CommandEmpty>
                            <CommandGroup heading={articulos.filter(a => a.idinventario === inventarioId && a.tipo === TipoArticulo.MATERIAL && a.nombre.toLowerCase().includes(searchValueMaterialNombre.toLowerCase())).length > 0 ? "Materiales Existentes" : undefined}>
                              {articulos
                                .filter(a => 
                                  a.idinventario === inventarioId && 
                                  a.tipo === TipoArticulo.MATERIAL &&
                                  a.nombre.toLowerCase().includes(searchValueMaterialNombre.toLowerCase())
                                )
                                .sort((a,b) => a.nombre.localeCompare(b.nombre))
                                .map((material) => {
                                  if (!material || typeof material.id !== 'string' || material.id === "") return null;
                                  return (
                                    <CommandItem
                                      key={material.id}
                                      value={material.nombre} // Usar el nombre para el filtro del Command y para el onSelect
                                      onSelect={(currentValue) => {
                                        // Cuando un item es seleccionado, currentValue es el 'value' del CommandItem (material.nombre)
                                        field.onChange(currentValue); // Establece el nombre del formulario
                                        setSearchValueMaterialNombre(currentValue); // Sincroniza el input de búsqueda
                                        verificarArticuloExistenteDebounced(currentValue); // Dispara la verificación
                                        setOpenMaterialNombreCombobox(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === material.nombre ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {material.nombre} 
                                      {material.descripcion && <span className="ml-2 text-xs text-muted-foreground">({material.descripcion.substring(0,30)}{material.descripcion.length > 30 ? '...' : ''})</span>}
                                    </CommandItem>
                                  );
                              })}
                            </CommandGroup>
                             {searchValueMaterialNombre.trim().length >=3 && !articulos.some(a => a.idinventario === inventarioId && a.tipo === TipoArticulo.MATERIAL && a.nombre.toLowerCase() === searchValueMaterialNombre.toLowerCase().trim()) && (
                                <CommandItem
                                    key="crear-nuevo"
                                    value={searchValueMaterialNombre.trim()}
                                    onSelect={(currentValue) => {
                                        field.onChange(currentValue);
                                        setSearchValueMaterialNombre(currentValue);
                                        setArticuloExistenteDetectado(null); // Es un nombre nuevo, limpiar detección previa
                                        setIsCheckingArticulo(false); // No hay nada que chequear aún de forma automática
                                        setOpenMaterialNombreCombobox(false);
                                        toast.info(`Creando nuevo material: "${currentValue}"`);
                                    }}
                                    className="text-sm text-muted-foreground italic"
                                >
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  Crear nuevo material: "{searchValueMaterialNombre.trim()}"
                                </CommandItem>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.nombre && <p className="text-xs text-destructive mt-1">{errors.nombre.message}</p>}
                {isCheckingArticulo && (
                  <p className="text-xs text-muted-foreground mt-1">Buscando si el material ya existe...</p>
                )}
                {articuloExistenteDetectado && (
                  <div className="mt-2 p-3 border border-yellow-400 bg-yellow-50 rounded-md text-sm shadow">
                    <p className="font-semibold text-yellow-700">¡Atención! Este material ya existe.</p>
                    <ul className="list-disc list-inside text-yellow-600 mt-1">
                      <li>ID: {articuloExistenteDetectado.id}</li>
                      <li>Nombre: {articuloExistenteDetectado.nombre}</li>
                      <li>Stock actual: {articuloExistenteDetectado.cantidad || 0} {articuloExistenteDetectado.unidad || ''}</li>
                      <li>Costo unitario actual: {articuloExistenteDetectado.costo !== undefined ? articuloExistenteDetectado.costo : 'N/A'}</li>
                    </ul>
                    <p className="text-yellow-600 mt-1.5">
                      Al guardar, se <span className="font-bold">sumará la cantidad</span> que ingrese a continuación al stock existente y se 
                      <span className="font-bold">actualizarán los demás datos</span> (costo, unidad, descripción, etc.) con los nuevos valores del formulario.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cantidad">
                  Cantidad a {articuloExistenteDetectado ? 'Agregar' : 'Registrar'} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cantidad"
                  type="number"
                  min={articuloExistenteDetectado ? 0 : 1}
                  step="1" 
                  placeholder={articuloExistenteDetectado ? "Ej: 5 (se sumarán al stock)" : "Ej: 10"}
                  {...register("cantidad", {
                    required: "La cantidad es obligatoria.",
                    valueAsNumber: true,
                    min: { value: articuloExistenteDetectado ? 0: 1, message: articuloExistenteDetectado ? "No puede ser negativo." : "Debe ser al menos 1." },
                  })}
                  className={errors.cantidad ? "border-destructive" : ""}
                />
                {errors.cantidad && <p className="text-xs text-destructive mt-1">{errors.cantidad.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="unidad">Unidad de Medida <span className="text-destructive">*</span></Label>
                <Controller
                  control={control}
                  name="unidad"
                  rules={{ required: "La unidad es obligatoria." }}
                  render={({ field }) => (
                    <Select 
                        onValueChange={field.onChange} 
                        value={field.value || (articuloExistenteDetectado?.unidad || Unidad.UNIDAD)}
                    >
                      <SelectTrigger id="unidad" className={`w-full ${errors.unidad ? "border-destructive" : ""}`}>
                        <SelectValue placeholder="-- Seleccionar unidad --" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(Unidad).map(u => (
                          <SelectItem key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1).toLowerCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.unidad && <p className="text-xs text-destructive mt-1">{errors.unidad.message}</p>}
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="costo">Costo Unitario (Moneda Local) <span className="text-destructive">*</span></Label>
                <Input
                  id="costo"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ej: 25.50"
                  {...register("costo", {
                    required: "El costo es obligatorio.",
                    valueAsNumber: true,
                    min: { value: 0, message: "No puede ser negativo." },
                  })}
                  className={errors.costo ? "border-destructive" : ""}
                />
                {errors.costo && <p className="text-xs text-destructive mt-1">{errors.costo.message}</p>}
              </div>
            </div>
            
            <div className="space-y-5 pt-4 border-t mt-4">
                <div className="space-y-1.5">
                    <Label htmlFor="descripcion">Descripción Adicional</Label>
                    <Textarea
                    id="descripcion"
                    placeholder="Cualquier detalle relevante: color, proveedor, notas especiales, etc."
                    {...register("descripcion")}
                    rows={3}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div className="space-y-1.5">
                        <Label htmlFor="ubicacion">Ubicación en Almacén</Label>
                        <Input
                        id="ubicacion"
                        placeholder="Ej: Estante B2, Caja 3"
                        {...register("ubicacion")}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="codigoBarras">Código de Barras</Label>
                        <Input
                        id="codigoBarras"
                        placeholder="Ingrese o escanee código de barras"
                        {...register("codigoBarras")}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label>Imagen del Material (Opcional)</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center space-y-3 hover:border-primary transition-colors">
                    {imagePreview ? (
                        <div className="relative group inline-block">
                        <img 
                            src={imagePreview} 
                            alt="Vista previa" 
                            className="max-h-48 mx-auto rounded-md shadow-md object-contain"
                        />
                        <TooltipProvider>
                            <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                type="button" 
                                variant="destructive" 
                                size="icon" 
                                className="absolute -top-2 -right-2 opacity-80 group-hover:opacity-100 transition-opacity rounded-full h-7 w-7" 
                                onClick={removeImage}
                                >
                                <X className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Eliminar imagen</p>
                            </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        </div>
                    ) : (
                        <div 
                        className="flex flex-col items-center justify-center space-y-2 cursor-pointer"
                        onClick={() => document.getElementById('imagenFile')?.click()}
                        >
                        <Upload className="h-10 w-10 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            Arrastra una imagen o <span className="text-primary font-medium">haz clic aquí</span> para seleccionar.
                        </p>
                        <Input
                            id="imagenFile"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                        </div>
                    )}
                    </div>
                    {errors.imagenUrl && <p className="text-xs text-destructive mt-1">{errors.imagenUrl.message}</p>}
                </div>
            </div>
          </div>
        );
      case STEPS.DETALLES_EQUIPO_MARCA_MODELO:
        const marcaSeleccionadaId = getValues("marca");
        const articulosDeMarcaFiltrados = marcaSeleccionadaId
          ? articulos
              .filter(a => 
                a.marca === marcaSeleccionadaId && 
                a.tipo === TipoArticulo.EQUIPO &&
                ( (a.nombre && a.nombre.toLowerCase().includes(filtroTablaArticulos.toLowerCase())) ||
                  (a.modelo && a.modelo.toLowerCase().includes(filtroTablaArticulos.toLowerCase())) )
              )
              .sort((a, b) => a.nombre.localeCompare(b.nombre))
          : [];
        
        return (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="marca">1. Seleccione la Marca del Equipo <span className="text-destructive">*</span></Label>
              <div className="flex items-center gap-2">
                <Controller
                    name="marca"
                    control={control}
                    rules={{ required: "La marca es obligatoria." }}
                    render={({ field }) => (
                      <Popover open={openMarcaCombobox} onOpenChange={setOpenMarcaCombobox}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openMarcaCombobox}
                            className={`w-full justify-between ${errors.marca ? "border-destructive" : ""}`}
                            disabled={isLoading}
                          >
                            {field.value
                              ? marcas.find((m) => m.id === field.value)?.nombre
                              : "-- Seleccionar marca --"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput 
                                placeholder="Buscar marca..." 
                                value={searchValueMarca}
                                onValueChange={setSearchValueMarca}
                            />
                            <CommandList>
                                <CommandEmpty>
                                    {searchValueMarca === "" ? "Escriba para buscar o cree una nueva." : `No se encontró la marca "${searchValueMarca}".`}
                                </CommandEmpty>
                                <CommandGroup>
                                  {marcas
                                    .filter(m => m.nombre.toLowerCase().includes(searchValueMarca.toLowerCase()))
                                    .sort((a,b) => a.nombre.localeCompare(b.nombre))
                                    .map((m) => {
                                      if (!m || typeof m.id !== 'string' || m.id === "") return null;
                                      return (
                                        <CommandItem
                                          key={m.id}
                                          value={m.id} 
                                          onSelect={(currentValue) => { 
                                            field.onChange(currentValue === field.value ? "" : currentValue);
                                            setFiltroTablaArticulos("");
                                            setSelectedArticuloBaseId(null); 
                                            setValue("modelo", "");
                                            setValue("nombre", "");
                                            setOpenMarcaCombobox(false);
                                            setSearchValueMarca("");
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              field.value === m.id ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          {m.nombre}
                                        </CommandItem>
                                      );
                                  })}
                                </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowNuevaMarcaForm(true)} 
                    disabled={isLoading}
                  >
                    Nueva Marca
                  </Button>
              </div>
              {errors.marca && <p className="text-xs text-destructive mt-1">{errors.marca.message}</p>}
            </div>

            {marcaSeleccionadaId && (
              <div className="space-y-4">
                <Label>2. Seleccione una Definición de Equipo Existente (Nombre y Modelo)</Label>
                <div className="flex items-center gap-2 mb-2">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            type="search"
                            placeholder="Filtrar por nombre o modelo..."
                            value={filtroTablaArticulos}
                            onChange={(e) => setFiltroTablaArticulos(e.target.value)}
                            className="pl-8 w-full"
                            disabled={isLoading || mostrandoFormNuevoArticuloBase}
                        />
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => { 
                            setMostrandoFormNuevoArticuloBase(!mostrandoFormNuevoArticuloBase); 
                            if (!mostrandoFormNuevoArticuloBase) {
                                // Limpiar campos que podrían usarse en el form de nuevo tipo base
                                // para evitar que se pre-rellenen si el usuario estuvo editando antes.
                                // Estos son campos del formulario principal que podrían tener otro uso
                                // en el contexto de un "articulo base".
                                // Por ahora, asumimos que el form de articulo base tendrá sus propios campos.
                            }
                        }}
                        disabled={isLoading}
                    > 
                        {mostrandoFormNuevoArticuloBase ? (
                           <><X className="mr-2 h-4 w-4"/> Cancelar Nuevo</> 
                        ) : (
                           <><PlusCircle className="mr-2 h-4 w-4"/> Definir Nuevo</> 
                        )}
                    </Button>
                </div>
                
                {mostrandoFormNuevoArticuloBase ? (
                  // Placeholder para el formulario de nuevo tipo de equipo
                  <div className="my-4 p-4 border rounded-md bg-muted/10">
                    <h3 className="text-lg font-semibold mb-3">Definir Nuevo Tipo de Equipo</h3>
                    <p className="text-sm text-muted-foreground">Aquí irá el formulario para crear un nuevo tipo de equipo (Articulo Base) asociado a la marca seleccionada.</p>
                    {/* TODO: Implementar el formulario aquí */}
                  </div>
                ) : articulosDeMarcaFiltrados.length > 0 ? (
                  <div className="rounded-md border max-h-[300px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre del Artículo</TableHead>
                          <TableHead>Modelo</TableHead>
                          <TableHead className="text-right">Acción</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {articulosDeMarcaFiltrados.map((articulo) => (
                          <TableRow key={articulo.id}>
                            <TableCell className="font-medium">{articulo.nombre}</TableCell>
                            <TableCell>{articulo.modelo || "N/A"}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setValue("nombre", articulo.nombre, { shouldTouch: true, shouldValidate: true });
                                  setValue("modelo", articulo.modelo || "", { shouldTouch: true, shouldValidate: true });
                                  setValue("costo", articulo.costo || 0, { shouldTouch: true });
                                  setValue("descripcion", articulo.descripcion || "", { shouldTouch: true });
                                  setSelectedArticuloBaseId(articulo.id);
                                  toast.success(`"${articulo.nombre}" seleccionado.`);
                                  nextStep(); 
                                }}
                                disabled={isLoading}
                              >
                                Seleccionar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {filtroTablaArticulos 
                        ? `No se encontraron definiciones de equipo para "${filtroTablaArticulos}".` 
                        : "No hay definiciones de equipo para esta marca. Puede crear una con \"Definir Nuevo\""}
                  </p>
                )}
              </div>
            )}
            
            <NuevaMarcaForm 
                open={showNuevaMarcaForm} 
                onOpenChange={setShowNuevaMarcaForm} 
                onMarcaCreada={(nuevaMarca: Marca) => { 
                    setMarcaPendienteSeleccionId(nuevaMarca.id);
                    setShowNuevaMarcaForm(false); 
                }}
            />
          </div>
        );
      case STEPS.DETALLES_EQUIPO_ESPECIFICOS:
        return (
          <div className="space-y-6">
            <div className="mb-4 p-4 border rounded-md bg-muted/50">
              <h4 className="font-medium text-lg mb-1">Resumen del Equipo Base:</h4>
              <p className="text-sm text-muted-foreground">
                <strong>Nombre:</strong> {getValues("nombre") || "N/A"}<br/>
                <strong>Marca:</strong> {marcas.find(m => m.id === getValues("marca"))?.nombre || "N/A"} <br/>
                <strong>Modelo:</strong> {getValues("modelo") || "N/A"}
              </p>
              {selectedArticuloBaseId && (
                <p className="text-xs text-green-600 mt-1">Se están utilizando los datos (costo, descripción general) de esta definición de equipo.</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {/* Número de Serie (S/N) */}
              <div className="space-y-1.5">
                <Label htmlFor="serial">Número de Serie (S/N) <span className="text-destructive">*</span></Label>
                <Input
                  id="serial"
                  placeholder="Ingrese o escanee S/N"
                  {...register("serial", {
                    required: "El S/N es obligatorio para equipos.",
                    minLength: {value: 3, message: "S/N debe tener al menos 3 caracteres"}
                  })}
                  className={errors.serial ? "border-destructive" : ""}
                  disabled={isLoading}
                />
                {errors.serial && <p className="text-xs text-destructive mt-1">{errors.serial.message}</p>}
              </div>

              {/* Dirección MAC */}
              <div className="space-y-1.5">
                <Label htmlFor="mac">Dirección MAC <span className="text-destructive">*</span></Label>
                <Input
                  id="mac"
                  placeholder="AA:BB:CC:DD:EE:FF"
                  {...register("mac", {
                    required: "La MAC es obligatoria para equipos.",
                    pattern: { 
                      value: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^([0-9A-Fa-f]{12})$/,
                      message: "Formato MAC inválido (ej: AA:BB:CC:DD:EE:FF o AABBCCDDEEFF)"
                    }
                  })}
                  className={errors.mac ? "border-destructive" : ""}
                  disabled={isLoading}
                />
                {errors.mac && <p className="text-xs text-destructive mt-1">{errors.mac.message}</p>}
              </div>

              {/* Clave Inalámbrica (Wireless Key) */}
              <div className="space-y-1.5">
                <Label htmlFor="wirelessKey">Clave Inalámbrica (Wireless Key)</Label>
                <Input
                  id="wirelessKey"
                  placeholder="Clave de Wi-Fi si aplica"
                  {...register("wirelessKey")}
                  disabled={isLoading}
                />
              </div>

              {/* Garantía (en meses) */}
              <div className="space-y-1.5">
                <Label htmlFor="garantia">Garantía (en meses)</Label>
                <Input
                  id="garantia"
                  type="number"
                  min="0"
                  placeholder="Ej: 12"
                  {...register("garantia", {
                    valueAsNumber: true,
                    min: { value: 0, message: "No puede ser negativo." },
                  })}
                  className={errors.garantia ? "border-destructive" : ""}
                  disabled={isLoading}
                />
                {errors.garantia && <p className="text-xs text-destructive mt-1">{errors.garantia.message}</p>}
              </div>

              {/* Ubicación Específica de esta unidad */}
               <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="ubicacion">Ubicación de esta Unidad (Opcional)</Label>
                <Input
                  id="ubicacion"
                  placeholder="Ej: Bodega Cliente X, Instalado en Rack Y"
                  {...register("ubicacion")} // Hereda de defaultValues o la definición base si se implementa
                  disabled={isLoading}
                />
              </div>

              {/* Código de Barras Específico */}
              <div className="space-y-1.5">
                <Label htmlFor="codigoBarras">Código de Barras de esta Unidad</Label>
                <Input
                  id="codigoBarras"
                  placeholder="Ingrese o escanee código de barras"
                  {...register("codigoBarras")}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Descripción Específica de esta unidad */}
            <div className="space-y-1.5">
                <Label htmlFor="descripcionUnidad">Descripción Específica de esta Unidad</Label>
                <Textarea
                id="descripcionUnidad"
                placeholder="Notas sobre esta unidad en particular (ej: Rayón en carcasa, Configuración especial)"
                {...register("descripcion")} // Usará el campo 'descripcion' general, podría necesitar uno nuevo si la desc base se mantiene
                rows={3}
                disabled={isLoading}
                />
            </div>
            
            {/* Imagen Específica de esta unidad (Opcional) */}
            <div className="space-y-1.5">
                <Label>Imagen de esta Unidad (Opcional)</Label>
                {/* Copiar la lógica de carga de imagen del paso de Materiales si es necesario */}
                <div className="border-2 border-dashed rounded-lg p-6 text-center space-y-3 hover:border-primary transition-colors">
                    {imagePreview ? (
                        <div className="relative group inline-block">
                        <img 
                            src={imagePreview} 
                            alt="Vista previa de unidad" 
                            className="max-h-48 mx-auto rounded-md shadow-md object-contain"
                        />
                        <TooltipProvider>
                            <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                type="button" 
                                variant="destructive" 
                                size="icon" 
                                className="absolute -top-2 -right-2 opacity-80 group-hover:opacity-100 transition-opacity rounded-full h-7 w-7" 
                                onClick={removeImage} // removeImage ya existe y funciona con selectedImage/imagePreview
                                >
                                <X className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Eliminar imagen</p>
                            </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        </div>
                    ) : (
                        <div 
                        className="flex flex-col items-center justify-center space-y-2 cursor-pointer"
                        onClick={() => document.getElementById('imagenFileEquipo')?.click()} // ID único para este input de archivo
                        >
                        <Upload className="h-10 w-10 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            Arrastra una imagen o <span className="text-primary font-medium">haz clic aquí</span> para seleccionar.
                        </p>
                        <Input
                            id="imagenFileEquipo" // ID único
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange} // handleImageChange ya existe
                        />
                        </div>
                    )}
                </div>
                {errors.imagenUrl && <p className="text-xs text-destructive mt-1">{errors.imagenUrl.message}</p>}
            </div>
          </div>
        );
      default:
        return <div>Paso desconocido</div>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        handleCloseDialog();
      } else {
        setCurrentStep(STEPS.SELECCION_TIPO); 
        onOpenChange(true);
      }
    }}>
      <DialogContent className="sm:max-w-[700px] md:max-w-[800px] lg:max-w-[900px] max-h-[95vh] overflow-y-auto p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl">
            {currentStep === STEPS.SELECCION_TIPO && "Agregar Nuevo Artículo"}
            {currentStep === STEPS.DETALLES_MATERIAL && `Agregar Material: ${getValues("nombre") || '...'}`}
            {currentStep === STEPS.DETALLES_EQUIPO_MARCA_MODELO && "Agregar Equipo: Marca y Modelo"}
            {currentStep === STEPS.DETALLES_EQUIPO_ESPECIFICOS && "Agregar Equipo: Detalles Específicos"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
          {renderStepContent()}
          
          <DialogFooter className="pt-8 flex justify-between w-full">
            <div>
              {currentStep !== STEPS.SELECCION_TIPO && (
                <Button type="button" variant="outline" onClick={prevStep} disabled={isLoading}>
                  Anterior
                </Button>
              )}
            </div>
            <div>
              <Button type="button" variant="ghost" onClick={handleCloseDialog} disabled={isLoading} className="mr-2">
                Cancelar
              </Button>
              {currentStep === STEPS.DETALLES_MATERIAL || currentStep === STEPS.DETALLES_EQUIPO_ESPECIFICOS ? (
                <Button 
                  type="submit" 
                  disabled={isLoading || !isValid ||
                    (tipoSeleccionado === TipoArticulo.MATERIAL && articuloExistenteDetectado && touchedFields.cantidad === undefined && getValues("cantidad") <= 0) ||
                    (tipoSeleccionado === TipoArticulo.MATERIAL && !articuloExistenteDetectado && (!getValues("nombre") || getValues("cantidad") <= 0 || getValues("costo") < 0 || !getValues("unidad") )) ||
                    (tipoSeleccionado === TipoArticulo.EQUIPO && currentStep === STEPS.DETALLES_EQUIPO_ESPECIFICOS && (!getValues("serial") || !getValues("mac") || !!errors.serial || !!errors.mac))
                  }
                >
                  {isLoading ? (
                    <><span className="animate-spin mr-2"> yükleniyor...</span> Guardando...</> 
                  ) : (articuloExistenteDetectado && tipoSeleccionado === TipoArticulo.MATERIAL ? "Actualizar Material" : "Guardar Artículo")}
                </Button>
              ) : (
                <Button type="button" onClick={nextStep} disabled={isLoading 
                   || (currentStep === STEPS.SELECCION_TIPO && !tipoSeleccionado)
                }>
                  Siguiente
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 