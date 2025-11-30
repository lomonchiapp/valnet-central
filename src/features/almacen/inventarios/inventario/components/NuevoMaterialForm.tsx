import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { materialSchema, MaterialFormValues } from '../schemas'
import { useAlmacenState } from '@/context/global/useAlmacenState'
import { TipoArticulo, Unidad } from 'shared-types'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, ChevronsUpDown, Loader2, Box, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAgregarArticulo } from '../hooks/useAgregarArticulo'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCrearMarca } from '../hooks/useCrearMarca'
import { useCrearUbicacion } from '../hooks/useCrearUbicacion'
import { useMarcaGenerica } from '../hooks/useMarcaGenerica'
import { Plus } from 'lucide-react'

interface NuevoMaterialFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inventarioId: string
}

export function NuevoMaterialForm({
  open,
  onOpenChange,
  inventarioId,
}: NuevoMaterialFormProps) {
  const { articulos, ubicaciones, marcas, subscribeToArticulos, subscribeToUbicaciones, subscribeToMarcas } = useAlmacenState()
  const { agregarArticulo, isLoading } = useAgregarArticulo(inventarioId)
  const { crearMarca, isLoading: isCreatingMarca } = useCrearMarca()
  const { crearUbicacion, isLoading: isCreatingUbicacion } = useCrearUbicacion()
  const { marcaGenericaId, isInitializing: isInitializingGenerica } = useMarcaGenerica()
  const [existingMaterial, setExistingMaterial] = useState<any | null>(null)
  const [openNameCombo, setOpenNameCombo] = useState(false)
  const [openUbicacionCombo, setOpenUbicacionCombo] = useState(false)
  const [openMarcaCombo, setOpenMarcaCombo] = useState(false)
  const [searchNombre, setSearchNombre] = useState('')
  const [searchMarca, setSearchMarca] = useState('')
  const [searchUbicacion, setSearchUbicacion] = useState('')

  useEffect(() => {
    const unsubscribeArticulos = subscribeToArticulos()
    const unsubscribeUbicaciones = subscribeToUbicaciones()
    const unsubscribeMarcas = subscribeToMarcas()
    return () => {
      unsubscribeArticulos()
      unsubscribeUbicaciones()
      unsubscribeMarcas()
    }
  }, [subscribeToArticulos, subscribeToUbicaciones, subscribeToMarcas])

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      nombre: '',
      tipo: TipoArticulo.MATERIAL,
      cantidad: 1,
      unidad: Unidad.UNIDAD,
      costo: 0,
      marca: '',
      modelo: '',
      ubicacion: '',
      descripcion: '',
      cantidad_minima: undefined,
      codigo: '',
    },
  })

  // Generar SKU Automático
  const generateSKU = useCallback((nombre: string, marcaId: string, modelo: string) => {
    // Pattern: 3 letters of Name - 3 letters of Brand - 4 Random/Time
    const cleanName = nombre.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 3).padEnd(3, 'X')
    
    const marcaObj = marcas.find(m => m.id === marcaId)
    const marcaName = marcaObj ? marcaObj.nombre : 'GEN'
    const cleanMarca = marcaName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 3).padEnd(3, 'X')
    
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    
    return `${cleanName}-${cleanMarca}-${randomPart}`
  }, [marcas])

  // Effect to auto-generate SKU when name or brand changes if SKU is empty
  useEffect(() => {
    const nombre = form.watch('nombre')
    const marca = form.watch('marca')
    const modelo = form.watch('modelo')
    const currentSKU = form.getValues('codigo')

    if (nombre && marca && !existingMaterial && (!currentSKU || currentSKU.trim() === '')) {
      const newSKU = generateSKU(nombre, marca, modelo || '')
      form.setValue('codigo', newSKU)
    }
  }, [form.watch('nombre'), form.watch('marca'), form.watch('modelo'), existingMaterial, generateSKU, form])

  const handleRegenerateSKU = (e: React.MouseEvent) => {
    e.preventDefault()
    const nombre = form.getValues('nombre')
    const marca = form.getValues('marca')
    const modelo = form.getValues('modelo')
    
    if (nombre) {
        const newSKU = generateSKU(nombre, marca || '', modelo || '')
        form.setValue('codigo', newSKU)
        toast.info('SKU regenerado')
    } else {
        toast.warning('Ingrese un nombre para generar el SKU')
    }
  }

  // Asignar GENERICA automáticamente cuando esté disponible
  useEffect(() => {
    if (marcaGenericaId && !isInitializingGenerica && !form.getValues('marca')) {
      form.setValue('marca', marcaGenericaId)
    }
  }, [marcaGenericaId, isInitializingGenerica, form])

  // Filtrar solo materiales de este inventario
  const materialesExistentes = articulos.filter(
    (a) => a.idinventario === inventarioId && a.tipo === TipoArticulo.MATERIAL
  )

  const materialesFiltrados = materialesExistentes.filter((mat) =>
    mat.nombre.toLowerCase().includes(searchNombre.toLowerCase())
  )

  const onNameSelect = (nombre: string) => {
    const existing = materialesExistentes.find(
      (a) => a.nombre.toLowerCase() === nombre.toLowerCase()
    )

    if (existing) {
      setExistingMaterial(existing)
      form.setValue('nombre', existing.nombre)
      form.setValue('descripcion', existing.descripcion || '')
      form.setValue('unidad', existing.unidad as Unidad)
      form.setValue('costo', existing.costo)
      form.setValue('marca', existing.marca || marcaGenericaId || '')
      form.setValue('modelo', existing.modelo || '')
      form.setValue('ubicacion', existing.ubicacion || '')
      form.setValue('cantidad', 1)
      form.setValue('cantidad_minima', existing.cantidad_minima)
      form.setValue('codigo', existing.codigo || '') // Load existing SKU
    } else {
      setExistingMaterial(null)
      form.setValue('nombre', nombre)
      if (existingMaterial) {
        form.setValue('descripcion', '')
        form.setValue('unidad', Unidad.UNIDAD)
        form.setValue('costo', 0)
        form.setValue('marca', marcaGenericaId || '')
        form.setValue('modelo', '')
        form.setValue('ubicacion', '')
        form.setValue('cantidad_minima', undefined)
        form.setValue('codigo', '') // Clear SKU to allow regeneration
      }
    }
    setOpenNameCombo(false)
    setSearchNombre('')
  }

  const onSubmit = async (data: MaterialFormValues) => {
    try {
      // Si no hay marca seleccionada, asignar GENERICA
      const marcaFinal = data.marca || marcaGenericaId || ''
      
      if (!marcaFinal) {
        toast.error('No se pudo asignar la marca GENERICA. Por favor, intente nuevamente.')
        return
      }

      const result = await agregarArticulo({
        ...data,
        marca: marcaFinal,
        imagen: data.imagen,
      })

      if (result) {
        toast.success(
          existingMaterial
            ? `Stock agregado a "${data.nombre}" exitosamente`
            : `Material "${data.nombre}" creado exitosamente`
        )
        form.reset()
        setExistingMaterial(null)
        onOpenChange(false)
      } else {
        toast.error('Error al guardar el material')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error inesperado')
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      form.reset()
      // Asignar GENERICA después del reset
      if (marcaGenericaId) {
        setTimeout(() => {
          form.setValue('marca', marcaGenericaId)
        }, 0)
      }
      setExistingMaterial(null)
      setSearchNombre('')
      onOpenChange(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Box className="h-5 w-5" />
              Agregar Nuevo Material
            </DialogTitle>
            <DialogDescription>
              Ingrese los datos del material. Si el material ya existe, se sumará la cantidad al stock actual.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {existingMaterial && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertTitle className="text-blue-800 font-semibold">Material Existente Detectado</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    Se sumará la cantidad ingresada al stock actual ({existingMaterial.cantidad} {existingMaterial.unidad}).
                    Los demás datos se actualizarán si los modificas.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre con Autocomplete */}
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem className="flex flex-col md:col-span-2">
                      <FormLabel>Nombre del Material <span className="text-destructive">*</span></FormLabel>
                      <Popover open={openNameCombo} onOpenChange={setOpenNameCombo}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                              type="button"
                            >
                              {field.value || "Buscar o escribir nombre del material"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                          <Command shouldFilter={false}>
                            <CommandInput 
                              placeholder="Buscar material..." 
                              value={searchNombre}
                              onValueChange={(value) => {
                                setSearchNombre(value)
                                field.onChange(value)
                              }}
                            />
                            <CommandList>
                              {materialesFiltrados.length > 0 ? (
                                <CommandGroup heading="Materiales Existentes">
                                  {materialesFiltrados.map((mat) => (
                                    <CommandItem
                                      key={mat.id}
                                      value={mat.nombre}
                                      onSelect={() => onNameSelect(mat.nombre)}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          mat.nombre === field.value ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      <div className="flex flex-col">
                                        <span>{mat.nombre}</span>
                                        <span className="text-xs text-muted-foreground">
                                          Stock: {mat.cantidad} {mat.unidad}
                                        </span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              ) : (
                                <CommandEmpty>
                                  {searchNombre.trim() ? (
                                    <div className="p-2">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full justify-start"
                                        onClick={() => {
                                          onNameSelect(searchNombre.trim())
                                        }}
                                      >
                                        Crear nuevo: "{searchNombre.trim()}"
                                      </Button>
                                    </div>
                                  ) : (
                                    "Escriba para buscar materiales existentes"
                                  )}
                                </CommandEmpty>
                              )}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cantidad */}
                <FormField
                  control={form.control}
                  name="cantidad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad a {existingMaterial ? 'Agregar' : 'Ingresar'} <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 1)} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Unidad */}
                <FormField
                  control={form.control}
                  name="unidad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidad de Medida <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!!existingMaterial}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione unidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(Unidad).map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Costo */}
                <FormField
                  control={form.control}
                  name="costo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costo Unitario <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0} 
                          step="0.01" 
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cantidad Mínima */}
                <FormField
                  control={form.control}
                  name="cantidad_minima"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Mínimo (Alerta)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0} 
                          {...field} 
                          onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} 
                          value={field.value || ''}
                          placeholder="Opcional"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Código SKU Auto-generado */}
                <FormField
                  control={form.control}
                  name="codigo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Código SKU
                        <span className="text-xs text-muted-foreground font-normal">(Auto-generado o manual)</span>
                      </FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Ej: CAB-GEN-1234" 
                            className="font-mono"
                          />
                        </FormControl>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon" 
                          onClick={handleRegenerateSKU}
                          title="Regenerar SKU"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Marca con creación rápida */}
                <FormField
                  control={form.control}
                  name="marca"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Marca <span className="text-xs text-muted-foreground">(GENERICA por defecto)</span></FormLabel>
                      <Popover open={openMarcaCombo} onOpenChange={setOpenMarcaCombo}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                              type="button"
                            >
                              {field.value
                                ? marcas.find((m) => m.id === field.value)?.nombre || (field.value === marcaGenericaId ? 'GENERICA' : field.value)
                                : marcaGenericaId ? 'GENERICA (por defecto)' : "Cargando..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command shouldFilter={false}>
                            <CommandInput 
                              placeholder="Buscar marca..." 
                              value={searchMarca}
                              onValueChange={setSearchMarca}
                            />
                            <CommandList>
                              {searchMarca.trim() && !marcas.some(m => m.nombre.toLowerCase() === searchMarca.toLowerCase()) && (
                                <CommandGroup>
                                  <CommandItem
                                    onSelect={async () => {
                                      const nuevaMarcaId = await crearMarca(searchMarca)
                                      if (nuevaMarcaId) {
                                        form.setValue('marca', nuevaMarcaId)
                                        setSearchMarca('')
                                        setOpenMarcaCombo(false)
                                      }
                                    }}
                                    className="text-primary"
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Crear "{searchMarca}"
                                  </CommandItem>
                                </CommandGroup>
                              )}
                              <CommandEmpty>
                                {searchMarca.trim() 
                                  ? `No encontrada. Presione Enter para crear "${searchMarca}"`
                                  : "Escriba para buscar o crear"}
                              </CommandEmpty>
                              <CommandGroup heading="Marcas Existentes">
                                {marcas
                                  .filter(m => m.nombre.toLowerCase().includes(searchMarca.toLowerCase()))
                                  .sort((a, b) => {
                                    // Poner GENERICA primero
                                    if (a.nombre.toUpperCase() === 'GENERICA') return -1
                                    if (b.nombre.toUpperCase() === 'GENERICA') return 1
                                    return a.nombre.localeCompare(b.nombre)
                                  })
                                  .map((m) => (
                                    <CommandItem
                                      key={m.id}
                                      value={m.nombre}
                                      onSelect={() => {
                                        form.setValue('marca', m.id)
                                        setSearchMarca('')
                                        setOpenMarcaCombo(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          m.id === field.value ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {m.nombre}
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Modelo con sugerencias */}
                <FormField
                  control={form.control}
                  name="modelo"
                  render={({ field }) => {
                    const marcaId = form.watch('marca')
                    const modelosExistentes = marcaId
                      ? articulos
                          .filter(a => a.marca === marcaId && a.modelo)
                          .map(a => a.modelo)
                          .filter((v, i, a) => a.indexOf(v) === i) // Unique
                      : []
                    
                    return (
                      <FormItem>
                        <FormLabel>Modelo/Referencia</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ej: Generico, Cat6, etc." list={`modelos-${marcaId || 'all'}`} />
                        </FormControl>
                        {modelosExistentes.length > 0 && (
                          <datalist id={`modelos-${marcaId || 'all'}`}>
                            {modelosExistentes.map((modelo, idx) => (
                              <option key={idx} value={modelo} />
                            ))}
                          </datalist>
                        )}
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />

                {/* Ubicación */}
                <FormField
                  control={form.control}
                  name="ubicacion"
                  render={({ field }) => (
                    <FormItem className="flex flex-col md:col-span-2">
                      <FormLabel>Ubicación</FormLabel>
                      <div className="flex gap-2">
                        <Popover open={openUbicacionCombo} onOpenChange={setOpenUbicacionCombo}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "flex-1 justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                                type="button"
                              >
                                {field.value
                                  ? ubicaciones.find(u => u.id === field.value)?.nombre || field.value
                                  : "Seleccione ubicación"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0">
                            <Command shouldFilter={false}>
                              <CommandInput 
                                placeholder="Buscar ubicación..." 
                                value={searchUbicacion}
                                onValueChange={setSearchUbicacion}
                              />
                              <CommandList>
                                {searchUbicacion.trim() && !ubicaciones.some(u => u.nombre.toLowerCase() === searchUbicacion.toLowerCase()) && (
                                  <CommandGroup>
                                    <CommandItem
                                      onSelect={async () => {
                                        const nuevaUbicacionId = await crearUbicacion(searchUbicacion, inventarioId)
                                        if (nuevaUbicacionId) {
                                          form.setValue('ubicacion', nuevaUbicacionId)
                                          setSearchUbicacion('')
                                          setOpenUbicacionCombo(false)
                                        }
                                      }}
                                      className="text-primary"
                                    >
                                      <Plus className="mr-2 h-4 w-4" />
                                      Crear "{searchUbicacion}"
                                    </CommandItem>
                                  </CommandGroup>
                                )}
                                <CommandEmpty>
                                  {searchUbicacion.trim() 
                                    ? `No encontrada. Presione Enter para crear "${searchUbicacion}"`
                                    : "Escriba para buscar o crear"}
                                </CommandEmpty>
                                <CommandGroup heading="Ubicaciones Existentes">
                                  {ubicaciones
                                    .filter(u => u.nombre.toLowerCase().includes(searchUbicacion.toLowerCase()))
                                    .map((u) => (
                                      <CommandItem
                                        key={u.id}
                                        value={u.nombre}
                                        onSelect={() => {
                                          form.setValue('ubicacion', u.id)
                                          setSearchUbicacion('')
                                          setOpenUbicacionCombo(false)
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            u.id === field.value ? "opacity-100" : "opacity-0"
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
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Detalles adicionales..." rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {existingMaterial ? 'Agregar Stock' : 'Crear Material'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

    </>
  )
}
