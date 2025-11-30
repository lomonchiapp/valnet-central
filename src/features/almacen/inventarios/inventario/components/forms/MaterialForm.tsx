import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAgregarArticulo } from '../../hooks/useAgregarArticulo'
import { TipoArticulo, Unidad, Articulo } from 'shared-types'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { useAlmacenState } from '@/context/global/useAlmacenState'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCrearMarca } from '../../hooks/useCrearMarca'
import { useCrearUbicacion } from '../../hooks/useCrearUbicacion'
import { useMarcaGenerica } from '../../hooks/useMarcaGenerica'

const materialSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  codigo: z.string().optional(), // SKU opcional
  descripcion: z.string().optional(),
  cantidad: z.coerce.number().min(0, 'La cantidad debe ser mayor o igual a 0'),
  cantidad_minima: z.coerce.number().min(0, 'La cantidad mínima debe ser mayor o igual a 0').optional(),
  costo: z.coerce.number().min(0, 'El costo debe ser mayor o igual a 0'),
  unidad: z.nativeEnum(Unidad),
  marca: z.string().min(1, 'La marca es requerida'),
  modelo: z.string().min(1, 'El modelo es requerido'),
  ubicacion: z.string().optional(),
  imagen: z.any().optional(),
})

type MaterialFormValues = z.infer<typeof materialSchema>

interface MaterialFormProps {
  inventarioId: string
  onSuccess: () => void
}

export function MaterialForm({ inventarioId, onSuccess }: MaterialFormProps) {
  const { articulos, ubicaciones, marcas } = useAlmacenState()
  const { agregarArticulo, isLoading } = useAgregarArticulo(inventarioId)
  const [existingMaterial, setExistingMaterial] = useState<Articulo | null>(null)
  const [openNameCombo, setOpenNameCombo] = useState(false)
  const [openMarcaCombo, setOpenMarcaCombo] = useState(false)
  const [openUbicacionCombo, setOpenUbicacionCombo] = useState(false)
  
  const { crearMarca } = useCrearMarca()
  const { crearUbicacion } = useCrearUbicacion()
  const { marcaGenericaId, buscarOCrearMarcaGenerica } = useMarcaGenerica()

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      nombre: '',
      codigo: '',
      descripcion: '',
      cantidad: 0,
      cantidad_minima: 0,
      costo: 0,
      unidad: Unidad.UNIDAD,
      marca: '',
      modelo: 'GENERICO',
      ubicacion: '',
    },
  })

  // Cargar marca GENERICO al montar
  useEffect(() => {
    const initMarca = async () => {
      const id = await buscarOCrearMarcaGenerica()
      if (id) {
        const currentMarca = form.getValues('marca')
        if (!currentMarca) {
          form.setValue('marca', id)
        }
      }
    }
    initMarca()
  }, [])

  const materialesExistentes = articulos.filter(
    (a) => a.tipo === TipoArticulo.MATERIAL && a.idinventario === inventarioId
  )

  const onNameSelect = (nombre: string) => {
    const existing = materialesExistentes.find(
      (a) => a.nombre.toLowerCase() === nombre.toLowerCase()
    )

    if (existing) {
      setExistingMaterial(existing)
      form.setValue('nombre', existing.nombre)
      form.setValue('codigo', existing.codigo || '')
      form.setValue('descripcion', existing.descripcion || '')
      form.setValue('unidad', existing.unidad as Unidad)
      form.setValue('costo', existing.costo)
      form.setValue('marca', existing.marca)
      form.setValue('modelo', existing.modelo)
      form.setValue('ubicacion', existing.ubicacion)
      form.setValue('cantidad', 1) // Reset quantity for adding
      form.setValue('cantidad_minima', existing.cantidad_minima || 0)
    } else {
      setExistingMaterial(null)
      form.setValue('nombre', nombre)
      // Reset other fields if needed, or keep user input? 
      // Better to reset to defaults if switching from existing to new
      if (existingMaterial) {
        form.setValue('codigo', '')
        form.setValue('descripcion', '')
        form.setValue('unidad', Unidad.UNIDAD)
        form.setValue('costo', 0)
        if (marcaGenericaId) form.setValue('marca', marcaGenericaId)
        form.setValue('modelo', 'GENERICO')
        form.setValue('ubicacion', '')
        form.setValue('cantidad_minima', 0)
      }
    }
    setOpenNameCombo(false)
  }

  const onSubmit = async (data: MaterialFormValues) => {
    try {
      const result = await agregarArticulo({
        ...data,
        tipo: TipoArticulo.MATERIAL,
        serial: '', // Materiales no tienen serial
        imagen: data.imagen,
      })

      if (result) {
        toast.success(
          existingMaterial
            ? `Stock agregado a "${data.nombre}" exitosamente`
            : `Material "${data.nombre}" creado exitosamente`
        )
        onSuccess()
      }
    } catch (error) {
      console.error(error)
      toast.error('Error inesperado')
    }
  }

  const handleCrearMarca = async (nombre: string) => {
    const nuevaMarcaId = await crearMarca(nombre)
    if (nuevaMarcaId) {
      form.setValue('marca', nuevaMarcaId)
      setOpenMarcaCombo(false)
    }
  }

  const handleCrearUbicacion = async (nombre: string) => {
    const nuevaUbicacionId = await crearUbicacion(nombre, inventarioId)
    if (nuevaUbicacionId) {
      const nuevaUbicacion = ubicaciones.find(u => u.id === nuevaUbicacionId)
      if (nuevaUbicacion) {
        form.setValue('ubicacion', nuevaUbicacion.nombre) // Guardamos el nombre, no el ID
        setOpenUbicacionCombo(false)
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        
        {/* Nombre con Autocomplete */}
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Nombre del Material</FormLabel>
              <Popover open={openNameCombo} onOpenChange={setOpenNameCombo}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openNameCombo}
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value || "Seleccionar o escribir nombre..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar material..." />
                    <CommandList>
                      <CommandEmpty>
                        <div className="p-2">
                          <p className="text-sm text-muted-foreground mb-2">No encontrado.</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => onNameSelect(field.value)} // Usar el valor actual del input como nuevo nombre? No, command input is separate.
                            // Actually CommandInput value isn't directly accessible here easily without controlled state.
                            // Let's simplify: allow free text in a separate Input if not found? 
                            // Or use the CommandEmpty to set the search term as value.
                          >
                            Crear "{field.value}" (Escribe en el buscador)
                          </Button>
                        </div>
                      </CommandEmpty>
                      <CommandGroup heading="Materiales Existentes">
                        {materialesExistentes.map((material) => (
                          <CommandItem
                            key={material.id}
                            value={material.nombre}
                            onSelect={onNameSelect}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                material.nombre === field.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {material.nombre}
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({material.cantidad} {material.unidad})
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      <CommandGroup heading="Acciones">
                         <CommandItem value="new-item-trigger" onSelect={() => {
                           // This is tricky with standard shadcn command. 
                           // Better UX: Just use an Input that filters a list below it manually?
                           // For now, standard combo behavior.
                         }}>
                            Escribe para buscar...
                         </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {/* Fallback Input for manual entry if combo is annoying */}
              <Input 
                placeholder="O escribe un nombre nuevo aquí..." 
                {...field} 
                onChange={(e) => {
                  field.onChange(e)
                  // Check if matches existing
                  const existing = materialesExistentes.find(m => m.nombre.toLowerCase() === e.target.value.toLowerCase())
                  if (existing) {
                     setExistingMaterial(existing)
                     // Populate? Maybe verify with user first
                  } else {
                     setExistingMaterial(null)
                  }
                }}
                className="mt-2"
              />
              {existingMaterial && (
                <p className="text-sm text-amber-600 mt-1">
                  ⚠️ Material existente. Se sumará al stock actual.
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="codigo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código / SKU (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="EJ: MAT-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="modelo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo</FormLabel>
                <FormControl>
                  <Input placeholder="Modelo o Generico" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cantidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad a Agregar</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="unidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidad</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar unidad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(Unidad).map((unidad) => (
                      <SelectItem key={unidad} value={unidad}>
                        {unidad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="costo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Costo Unitario</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="cantidad_minima"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Mínimo (Alerta)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Marca con Autocomplete y Creación */}
        <FormField
          control={form.control}
          name="marca"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Marca</FormLabel>
              <Popover open={openMarcaCombo} onOpenChange={setOpenMarcaCombo}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openMarcaCombo}
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value 
                        ? marcas.find(m => m.id === field.value)?.nombre || "Marca seleccionada"
                        : "Seleccionar marca"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar marca..." />
                    <CommandList>
                      <CommandEmpty>
                        <div className="p-2">
                          <p className="text-sm text-muted-foreground mb-2">Marca no encontrada.</p>
                          {/* Aquí podríamos poner un botón para crear, pero CommandEmpty es limitado.
                              Mejor lógica de creación abajo.
                           */}
                        </div>
                      </CommandEmpty>
                      <CommandGroup>
                        {marcas.map((marca) => (
                          <CommandItem
                            key={marca.id}
                            value={marca.nombre}
                            onSelect={() => {
                              form.setValue('marca', marca.id!)
                              setOpenMarcaCombo(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                marca.id === field.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {marca.nombre}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                    <div className="p-2 border-t">
                        <Input 
                            placeholder="Nombre de nueva marca..." 
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleCrearMarca(e.currentTarget.value)
                                }
                            }}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Presiona Enter para crear una nueva marca</p>
                    </div>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Ubicación con Autocomplete y Creación */}
        <FormField
          control={form.control}
          name="ubicacion"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Ubicación</FormLabel>
              <Popover open={openUbicacionCombo} onOpenChange={setOpenUbicacionCombo}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openUbicacionCombo}
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value || "Seleccionar ubicación"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar ubicación..." />
                    <CommandList>
                      <CommandEmpty>Ubicación no encontrada.</CommandEmpty>
                      <CommandGroup>
                        {ubicaciones
                          .filter(u => u.idinventario === inventarioId)
                          .map((ubicacion) => (
                          <CommandItem
                            key={ubicacion.id}
                            value={ubicacion.nombre}
                            onSelect={(currentValue) => {
                              form.setValue('ubicacion', currentValue) // Guardamos nombre
                              setOpenUbicacionCombo(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                ubicacion.nombre === field.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {ubicacion.nombre}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                    <div className="p-2 border-t">
                        <Input 
                            placeholder="Nombre de nueva ubicación..." 
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleCrearUbicacion(e.currentTarget.value)
                                }
                            }}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Presiona Enter para crear una nueva ubicación</p>
                    </div>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Detalles adicionales..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imagen"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Imagen</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onChange(e.target.files?.[0])}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Guardando...' : existingMaterial ? 'Agregar Stock' : 'Crear Material'}
        </Button>
      </form>
    </Form>
  )
}
