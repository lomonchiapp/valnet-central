import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { equipoSchema, equiposMasivosSchema, EquipoFormValues, EquiposMasivosFormValues } from '../schemas'
import { useAlmacenState } from '@/context/global/useAlmacenState'
import { TipoArticulo, Unidad } from 'shared-types'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, ChevronsUpDown, Loader2, Cpu, ScanLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAgregarArticulo } from '../hooks/useAgregarArticulo'
import { toast } from 'sonner'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
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
import { Plus } from 'lucide-react'

interface NuevoEquipoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inventarioId: string
}

// Función para generar MAC desde serial
const generateMacFromSerial = (serial: string): string => {
  if (serial.length < 12) {
    return '00:00:00:00:00:00'
  }
  const cleanSerial = serial.replace(/[^0-9A-Fa-f]/g, '')
  const last12 = cleanSerial.slice(-12).padStart(12, '0')
  return last12.match(/.{2}/g)?.join(':') || '00:00:00:00:00:00'
}

// Función para generar MAC con prefijo
const generateMacWithPrefix = (prefix: string, serial: string): string => {
  const cleanPrefix = prefix
    .replace(/[^0-9A-Fa-f:]/g, '')
    .replace(/:{2,}/g, ':')
  const prefixParts = cleanPrefix.split(':').filter((p) => p.length > 0)

  if (prefixParts.length === 0) {
    return generateMacFromSerial(serial)
  }

  const cleanSerial = serial.replace(/[^0-9A-Fa-f]/g, '')
  const remainingParts = 6 - prefixParts.length

  if (remainingParts <= 0) {
    return prefixParts.slice(0, 6).join(':')
  }

  const serialParts: string[] = []
  for (let i = 0; i < remainingParts; i++) {
    const start = i * 2
    const part = cleanSerial.substring(start, start + 2).padStart(2, '0')
    serialParts.push(part || '00')
  }

  return [...prefixParts, ...serialParts].slice(0, 6).join(':')
}

export function NuevoEquipoForm({
  open,
  onOpenChange,
  inventarioId,
}: NuevoEquipoFormProps) {
  const { marcas, ubicaciones, articulos, subscribeToMarcas, subscribeToUbicaciones, subscribeToArticulos } = useAlmacenState()
  const { agregarArticulo, isLoading } = useAgregarArticulo(inventarioId)
  const { crearMarca, isLoading: isCreatingMarca } = useCrearMarca()
  const { crearUbicacion, isLoading: isCreatingUbicacion } = useCrearUbicacion()
  const [mode, setMode] = useState<'single' | 'massive'>('single')
  const [openMarca, setOpenMarca] = useState(false)
  const [openUbicacion, setOpenUbicacion] = useState(false)
  const [searchMarca, setSearchMarca] = useState('')
  const [searchUbicacion, setSearchUbicacion] = useState('')

  useEffect(() => {
    const unsubscribeMarcas = subscribeToMarcas()
    const unsubscribeUbicaciones = subscribeToUbicaciones()
    const unsubscribeArticulos = subscribeToArticulos()
    return () => {
      unsubscribeMarcas()
      unsubscribeUbicaciones()
      unsubscribeArticulos()
    }
  }, [subscribeToMarcas, subscribeToUbicaciones, subscribeToArticulos])

  // Form for Single Entry
  const formSingle = useForm<EquipoFormValues>({
    resolver: zodResolver(equipoSchema),
    defaultValues: {
      tipo: TipoArticulo.EQUIPO,
      nombre: '',
      marca: '',
      modelo: '',
      serial: '',
      mac: '',
      ubicacion: '',
      descripcion: '',
      costo: 0,
      wirelessKey: '',
      garantia: undefined,
    },
  })

  // Form for Massive Entry
  const formMassive = useForm<EquiposMasivosFormValues>({
    resolver: zodResolver(equiposMasivosSchema),
    defaultValues: {
      tipo: TipoArticulo.EQUIPO,
      nombre: '',
      marca: '',
      modelo: '',
      ubicacion: '',
      descripcion: '',
      costo: 0,
      seriales: '',
      prefijoMac: '',
    },
  })

  // Auto-generate MAC when serial changes (single mode)
  const serialWatch = formSingle.watch('serial')
  useEffect(() => {
    if (serialWatch && mode === 'single') {
      const generatedMac = generateMacFromSerial(serialWatch)
      formSingle.setValue('mac', generatedMac, { shouldValidate: false })
    }
  }, [serialWatch, mode, formSingle])

  const onSingleSubmit = async (data: EquipoFormValues) => {
    try {
      const result = await agregarArticulo({
        ...data,
        cantidad: 1,
        unidad: Unidad.UNIDAD,
      })
      if (result) {
        toast.success('Equipo agregado exitosamente')
        formSingle.reset()
        onOpenChange(false)
      } else {
        toast.error('Error al agregar equipo')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error inesperado')
    }
  }

  const onMassiveSubmit = async (data: EquiposMasivosFormValues) => {
    try {
      const serialsList = data.seriales
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      if (serialsList.length === 0) {
        toast.error('No hay seriales válidos en la lista')
        return
      }

      toast.info(`Procesando ${serialsList.length} equipos...`)

      let successCount = 0
      let errorCount = 0

      for (const serial of serialsList) {
        const mac = data.prefijoMac
          ? generateMacWithPrefix(data.prefijoMac, serial)
          : generateMacFromSerial(serial)

        try {
          await agregarArticulo({
            ...data,
            serial,
            mac,
            cantidad: 1,
            unidad: Unidad.UNIDAD,
            tipo: TipoArticulo.EQUIPO,
          })
          successCount++
        } catch {
          errorCount++
        }
      }

      if (successCount > 0) {
        toast.success(`Se agregaron ${successCount} de ${serialsList.length} equipos`)
        formMassive.reset()
        onOpenChange(false)
      } else {
        toast.error('No se pudo agregar ningún equipo')
      }
    } catch (error) {
      console.error(error)
      toast.error('Error en carga masiva')
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      formSingle.reset()
      formMassive.reset()
      setMode('single')
      onOpenChange(false)
    }
  }

  // Shared Brand Selection Component con creación rápida
  const BrandSelect = ({ form }: { form: any }) => (
    <FormField
      control={form.control}
      name="marca"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Marca <span className="text-destructive">*</span></FormLabel>
          <Popover open={openMarca} onOpenChange={setOpenMarca}>
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
                    ? marcas.find((m) => m.id === field.value)?.nombre || field.value
                    : "Buscar o crear marca"}
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
                            setOpenMarca(false)
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
                      .map((m) => (
                        <CommandItem
                          key={m.id}
                          value={m.nombre}
                          onSelect={() => {
                            form.setValue('marca', m.id)
                            setSearchMarca('')
                            setOpenMarca(false)
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
  )

  // Shared Location Selection Component con creación rápida
  const LocationSelect = ({ form }: { form: any }) => (
    <FormField
      control={form.control}
      name="ubicacion"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Ubicación</FormLabel>
          <Popover open={openUbicacion} onOpenChange={setOpenUbicacion}>
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
                    ? ubicaciones.find((u) => u.id === field.value)?.nombre || field.value
                    : "Buscar o crear ubicación"}
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
                            setOpenUbicacion(false)
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
                            setOpenUbicacion(false)
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
          <FormMessage />
        </FormItem>
      )}
    />
  )

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Agregar Nuevo Equipo
            </DialogTitle>
            <DialogDescription>
              Registre un equipo nuevo. Puede agregarlo de forma individual o en lote mediante escaneo masivo.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={mode} onValueChange={(v: string) => setMode(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="single" className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Unitario
              </TabsTrigger>
              <TabsTrigger value="massive" className="flex items-center gap-2">
                <ScanLine className="h-4 w-4" />
                Masivo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="single">
              <Form {...formSingle}>
                <form onSubmit={formSingle.handleSubmit(onSingleSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <BrandSelect form={formSingle} />
                    <FormField
                      control={formSingle.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre / Tipo de Equipo <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ej: Router ONU, Antena" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formSingle.control}
                      name="modelo"
                      render={({ field }) => {
                        const marcaId = formSingle.watch('marca')
                        const modelosExistentes = marcaId
                          ? articulos
                              .filter(a => a.marca === marcaId && a.modelo)
                              .map(a => a.modelo)
                              .filter((v, i, a) => a.indexOf(v) === i) // Unique
                          : []
                        
                        return (
                          <FormItem>
                            <FormLabel>Modelo <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ej: HG8145V5, WR-841N" list={`modelos-equipo-${marcaId || 'all'}`} />
                            </FormControl>
                            {modelosExistentes.length > 0 && (
                              <datalist id={`modelos-equipo-${marcaId || 'all'}`}>
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
                    <FormField
                      control={formSingle.control}
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
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/10 space-y-4">
                    <h4 className="font-medium text-sm">Datos Específicos del Equipo</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={formSingle.control}
                        name="serial"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Serial (S/N) <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Escanee o escriba S/N" />
                            </FormControl>
                            <FormDescription className="text-xs">
                              La MAC se generará automáticamente
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={formSingle.control}
                        name="mac"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>MAC Address <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="AA:BB:CC:DD:EE:FF" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={formSingle.control}
                        name="wirelessKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Wireless Key (Opcional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Clave Wi-Fi" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={formSingle.control}
                        name="garantia"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Garantía (meses)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                value={field.value || ''}
                                placeholder="Ej: 12"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <LocationSelect form={formSingle} />

                  <FormField
                    control={formSingle.control}
                    name="descripcion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Notas sobre este equipo..." rows={3} />
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
                      Guardar Equipo
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="massive">
              <Form {...formMassive}>
                <form onSubmit={formMassive.handleSubmit(onMassiveSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <BrandSelect form={formMassive} />
                    <FormField
                      control={formMassive.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre / Tipo de Equipo <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ej: Router ONU" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formMassive.control}
                      name="modelo"
                      render={({ field }) => {
                        const marcaId = formMassive.watch('marca')
                        const modelosExistentes = marcaId
                          ? articulos
                              .filter(a => a.marca === marcaId && a.modelo)
                              .map(a => a.modelo)
                              .filter((v, i, a) => a.indexOf(v) === i) // Unique
                          : []
                        
                        return (
                          <FormItem>
                            <FormLabel>Modelo <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ej: HG8145V5" list={`modelos-masivo-${marcaId || 'all'}`} />
                            </FormControl>
                            {modelosExistentes.length > 0 && (
                              <datalist id={`modelos-masivo-${marcaId || 'all'}`}>
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
                    <FormField
                      control={formMassive.control}
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
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <FormField
                      control={formMassive.control}
                      name="seriales"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lista de Seriales (Uno por línea) <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={10}
                              placeholder="SN001&#10;SN002&#10;SN003"
                              className="font-mono text-sm"
                            />
                          </FormControl>
                          <FormDescription>
                            Escanee múltiples códigos o ingrese manualmente. Cada número de serie debe estar en una línea separada.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formMassive.control}
                      name="prefijoMac"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prefijo MAC (Opcional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ej: AA:BB:CC" />
                          </FormControl>
                          <FormDescription>
                            Si se proporciona, las MACs se generarán usando este prefijo + el serial.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <LocationSelect form={formMassive} />

                  <FormField
                    control={formMassive.control}
                    name="descripcion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Notas sobre estos equipos..." rows={3} />
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
                      Cargar Lote
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

    </>
  )
}

