import { useState, useEffect, useCallback } from 'react'
import { useForm, Controller, SubmitHandler } from 'react-hook-form'
import { database } from '@/firebase'
import { TipoArticulo, Unidad } from '@/types'
import { Marca } from '@/types'
import { collection, query, where, getDocs, limit } from 'firebase/firestore'
import {
  Upload,
  X,
  Cpu,
  Box,
  ChevronsUpDown,
  Check,
  PlusCircle,
  Search,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAlmacenState } from '@/context/global/useAlmacenState'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { NuevaMarcaForm } from '@/features/almacen/marcas/components/NuevaMarcaForm'
import {
  useAgregarArticulo,
  NuevoArticuloData,
} from '../hooks/useAgregarArticulo'
import { NuevaUbicacionForm } from './NuevaUbicacionForm'
import { useHotkeys } from 'react-hotkeys-hook'

interface NuevoArticuloFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inventarioId: string
}

const STEPS = {
  SELECCION_TIPO: 1,
  DETALLES_MATERIAL: 2,
  DETALLES_EQUIPO_MARCA_MODELO: 3,
  DETALLES_EQUIPO_ESPECIFICOS: 4,
  DETALLES_EQUIPOS_MULTIPLES: 5,
}

export function NuevoArticuloForm({
  open,
  onOpenChange,
  inventarioId,
}: NuevoArticuloFormProps) {
  const {
    agregarArticulo,
    isLoading,
    error: agregarError,
  } = useAgregarArticulo(inventarioId)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [articuloExistenteDetectado, setArticuloExistenteDetectado] = useState<{
    id?: string
    nombre?: string
    cantidad?: number
    costo?: number
    unidad?: Unidad
  } | null>(null)
  const [isCheckingArticulo, setIsCheckingArticulo] = useState(false)
  const [currentStep, setCurrentStep] = useState(STEPS.SELECCION_TIPO)
  const [showNuevaMarcaForm, setShowNuevaMarcaForm] = useState(false)
  const [showNuevaUbicacionForm, setShowNuevaUbicacionForm] = useState(false)
  const [openMarcaCombobox, setOpenMarcaCombobox] = useState(false)
  const [searchValueMarca, setSearchValueMarca] = useState('')
  const [filtroTablaArticulos, setFiltroTablaArticulos] = useState('')
  const [selectedArticuloBaseId, setSelectedArticuloBaseId] = useState<
    string | null
  >(null)
  const [mostrandoFormNuevoArticuloBase, setMostrandoFormNuevoArticuloBase] =
    useState(false)
  const [openMaterialNombreCombobox, setOpenMaterialNombreCombobox] =
    useState(false)
  const [searchValueMaterialNombre, setSearchValueMaterialNombre] = useState('')
  const [multipleSNList, setMultipleSNList] = useState('')
  const [isMultipleMode, setIsMultipleMode] = useState(false)
  const [openUbicacionCombobox, setOpenUbicacionCombobox] = useState(false)
  const [searchValueUbicacion, setSearchValueUbicacion] = useState('')

  const {
    marcas,
    articulos,
    ubicaciones,
    subscribeToMarcas,
    subscribeToArticulos,
    subscribeToUbicaciones,
  } = useAlmacenState()

  useEffect(() => {
    const unsubMarcas = subscribeToMarcas()
    const unsubArticulos = subscribeToArticulos()
    const unsubUbicaciones = subscribeToUbicaciones()
    return () => {
      unsubMarcas()
      unsubArticulos()
      unsubUbicaciones()
    }
  }, [subscribeToMarcas, subscribeToArticulos, subscribeToUbicaciones])

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
      nombre: '',
      descripcion: '',
      tipo: undefined,
      cantidad: 1,
      costo: 0,
      unidad: Unidad.UNIDAD,
      marca: '',
      modelo: '',
      serial: '',
      ubicacion: '',
      imagenUrl: '',
      codigoBarras: '',
      mac: '',
      wirelessKey: '',
      garantia: 0,
    },
    mode: 'onChange',
  })

  const tipoSeleccionado = watch('tipo')
  const nombreArticuloWatch = watch('nombre')
  const marcaSeleccionadaWatch = watch('marca')

  const marcaSeleccionadaId = getValues('marca')

  const resetFormAndState = useCallback(() => {
    reset({
      nombre: '',
      descripcion: '',
      tipo: undefined,
      cantidad: 1,
      costo: 0,
      unidad: Unidad.UNIDAD,
      marca: '',
      modelo: '',
      serial: '',
      ubicacion: '',
      imagenUrl: '',
      codigoBarras: '',
      mac: '',
      wirelessKey: '',
      garantia: 0,
    })
    setSelectedImage(null)
    setImagePreview(null)
    setArticuloExistenteDetectado(null)
    setIsCheckingArticulo(false)
    setFiltroTablaArticulos('')
    setMultipleSNList('')
    setIsMultipleMode(false)
    setOpenUbicacionCombobox(false)
    setSearchValueUbicacion('')
  }, [reset])

  const handleCloseDialog = () => {
    resetFormAndState()
    setCurrentStep(STEPS.SELECCION_TIPO)
    onOpenChange(false)
  }

  useEffect(() => {
    if (!open) {
      resetFormAndState()
      setCurrentStep(STEPS.SELECCION_TIPO)
      onOpenChange(false)
    }
  }, [open, resetFormAndState, setCurrentStep, onOpenChange])

  useEffect(() => {
    if (currentStep !== STEPS.DETALLES_EQUIPO_MARCA_MODELO) {
      setMostrandoFormNuevoArticuloBase(false)
    }
  }, [currentStep, marcaSeleccionadaWatch])

  const verificarArticuloExistenteDebounced = useCallback(() => {
    let timer: NodeJS.Timeout
    return async (nombre: string) => {
      clearTimeout(timer)
      timer = setTimeout(async () => {
        const currentTipo = getValues('tipo')
        if (
          !nombre ||
          nombre.trim().length < 3 ||
          currentTipo !== TipoArticulo.MATERIAL
        ) {
          setArticuloExistenteDetectado(null)
          setIsCheckingArticulo(false)
          return
        }
        setIsCheckingArticulo(true)
        setArticuloExistenteDetectado(null)

        try {
          const articulosRef = collection(database, 'articulos')
          const q = query(
            articulosRef,
            where('idinventario', '==', inventarioId),
            where('nombre', '==', nombre.trim()),
            where('tipo', '==', TipoArticulo.MATERIAL),
            limit(1)
          )
          const querySnapshot = await getDocs(q)
          if (!querySnapshot.empty) {
            const docData = querySnapshot.docs[0].data() as NuevoArticuloData
            setArticuloExistenteDetectado({
              id: querySnapshot.docs[0].id,
              nombre: docData.nombre,
              cantidad: docData.cantidad,
              costo: docData.costo,
              unidad: docData.unidad as Unidad,
            })
          } else {
            setArticuloExistenteDetectado(null)
          }
        } catch {
          setArticuloExistenteDetectado(null)
        } finally {
          setIsCheckingArticulo(false)
        }
      }, 500)
    }
  }, [getValues, inventarioId])

  useEffect(() => {
    const currentValues = getValues()
    const currentTipo = currentValues.tipo
    const nombreMaterial = currentValues.nombre

    if (currentTipo === TipoArticulo.MATERIAL && nombreMaterial) {
      verificarArticuloExistenteDebounced()(nombreMaterial)
    } else {
      setArticuloExistenteDetectado(null)
      setIsCheckingArticulo(false)
    }
  }, [
    nombreArticuloWatch,
    tipoSeleccionado,
    getValues,
    verificarArticuloExistenteDebounced,
  ])

  useEffect(() => {
    const currentTipo = getValues('tipo')
    if (currentTipo === TipoArticulo.EQUIPO) {
      setValue('cantidad', 1)
      setValue('unidad', Unidad.UNIDAD)
    } else if (currentTipo === TipoArticulo.MATERIAL) {
      setValue('serial', '')
      setValue('mac', '')
      setValue('wirelessKey', '')
      setValue('garantia', 0)
    }
  }, [tipoSeleccionado, setValue, getValues])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedImage(file)

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setValue('imagenUrl', file.name)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setValue('imagenUrl', '')
    const fileInput = document.getElementById(
      'imagenFile'
    ) as HTMLInputElement | null
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const generateMacFromSerial = (serial: string): string => {
    if (serial.length < 12) {
      return '00:00:00:00:00:00'
    }

    const cleanSerial = serial.replace(/[^0-9A-Fa-f]/g, '')
    const last12 = cleanSerial.slice(-12).padStart(12, '0')

    return last12.match(/.{2}/g)?.join(':') || '00:00:00:00:00:00'
  }

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

  const onSubmitHandler: SubmitHandler<NuevoArticuloData> = async (data) => {
    try {
      if (isMultipleMode && currentStep === STEPS.DETALLES_EQUIPOS_MULTIPLES) {
        const seriales = parseMultipleSNList(multipleSNList)
        if (seriales.length === 0) {
          toast.error('No se pudo procesar ningún número de serie válido.')
          return
        }

        const prefixMacElement = document.getElementById(
          'prefixMac'
        ) as HTMLInputElement
        const prefixMac = prefixMacElement?.value || ''

        toast.info(`Registrando ${seriales.length} equipos...`)
        let contadorExito = 0

        for (const serial of seriales) {
          const mac = prefixMac
            ? generateMacWithPrefix(prefixMac, serial)
            : generateMacFromSerial(serial)

          const equipoData: NuevoArticuloData = {
            ...data,
            serial: serial,
            mac: mac,
            cantidad: 1,
            unidad: Unidad.UNIDAD,
          }

          try {
            const nuevoArticuloId = await agregarArticulo({
              ...equipoData,
              imagen: selectedImage,
            } as NuevoArticuloData & { imagen?: File | null })

            if (nuevoArticuloId) {
              contadorExito++
            }
          } catch {
            // Capturamos el error pero no usamos console.log
            // Podríamos agregar el error a un array de errores si quisiéramos mostrarlos después
          }
        }

        if (contadorExito > 0) {
          toast.success(
            `Se registraron ${contadorExito} de ${seriales.length} equipos exitosamente`
          )
          handleCloseDialog()
        } else {
          toast.error('No se pudo registrar ningún equipo')
        }
      } else {
        // Comportamiento normal para un solo artículo
        const formData = {
          ...data,
          imagen: selectedImage,
        }

        const nuevoArticuloId = await agregarArticulo(
          formData as NuevoArticuloData & { imagen?: File | null }
        )
        if (nuevoArticuloId) {
          toast.success(
            articuloExistenteDetectado && data.tipo === TipoArticulo.MATERIAL
              ? 'Material actualizado exitosamente'
              : 'Artículo agregado exitosamente'
          )
          handleCloseDialog()
        } else {
          toast.error(
            `Error al agregar/actualizar el artículo: ${agregarError?.message || 'Error desconocido'}`
          )
        }
      }
    } catch {
      toast.error('Ocurrió un error al procesar el formulario')
    }
  }

  const nextStep = async () => {
    let fieldsToValidate: (keyof NuevoArticuloData)[] = []
    switch (currentStep) {
      case STEPS.SELECCION_TIPO:
        if (!tipoSeleccionado) {
          toast.error('Por favor, seleccione un tipo de artículo.')
          return
        }
        if (tipoSeleccionado === TipoArticulo.MATERIAL) {
          setCurrentStep(STEPS.DETALLES_MATERIAL)
        } else if (tipoSeleccionado === TipoArticulo.EQUIPO) {
          setCurrentStep(STEPS.DETALLES_EQUIPO_MARCA_MODELO)
        }
        return
      case STEPS.DETALLES_MATERIAL:
        fieldsToValidate = ['nombre', 'cantidad', 'costo', 'unidad']
        if (articuloExistenteDetectado) {
          fieldsToValidate = ['cantidad']
          setValue(
            'nombre',
            articuloExistenteDetectado.nombre || getValues('nombre')
          )
          setValue(
            'costo',
            articuloExistenteDetectado.costo !== undefined
              ? articuloExistenteDetectado.costo
              : getValues('costo')
          )
          setValue(
            'unidad',
            articuloExistenteDetectado.unidad || getValues('unidad')
          )
        }
        break
      case STEPS.DETALLES_EQUIPO_MARCA_MODELO:
        fieldsToValidate = ['marca', 'modelo', 'nombre']
        break
      case STEPS.DETALLES_EQUIPO_ESPECIFICOS:
        if (isMultipleMode) {
          setCurrentStep(STEPS.DETALLES_EQUIPOS_MULTIPLES)
          return
        }
        fieldsToValidate = ['serial', 'mac']
        break
      case STEPS.DETALLES_EQUIPOS_MULTIPLES: {
        if (multipleSNList.trim() === '') {
          toast.error('Por favor, ingrese al menos un número de serie.')
          return
        }
        const seriales = parseMultipleSNList(multipleSNList)
        if (seriales.length === 0) {
          toast.error('No se pudo procesar ningún número de serie válido.')
          return
        }
        break
      }
    }

    const isValidStep = await trigger(fieldsToValidate)
    if (isValidStep) {
      if (
        currentStep === STEPS.DETALLES_MATERIAL ||
        currentStep === STEPS.DETALLES_EQUIPO_ESPECIFICOS ||
        currentStep === STEPS.DETALLES_EQUIPOS_MULTIPLES
      ) {
        handleSubmit(onSubmitHandler)()
      } else {
        if (currentStep === STEPS.DETALLES_EQUIPO_MARCA_MODELO) {
          setCurrentStep(STEPS.DETALLES_EQUIPO_ESPECIFICOS)
        }
      }
    } else {
      toast.error(
        'Por favor, complete todos los campos obligatorios del paso actual.'
      )
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => {
      if (
        prev === STEPS.DETALLES_MATERIAL ||
        prev === STEPS.DETALLES_EQUIPO_MARCA_MODELO
      ) {
        return STEPS.SELECCION_TIPO
      }
      if (prev === STEPS.DETALLES_EQUIPO_ESPECIFICOS) {
        return STEPS.DETALLES_EQUIPO_MARCA_MODELO
      }
      if (prev === STEPS.DETALLES_EQUIPOS_MULTIPLES) {
        return STEPS.DETALLES_EQUIPO_ESPECIFICOS
      }
      return prev
    })
  }

  const parseMultipleSNList = (text: string): string[] => {
    return text
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
  }

  const handleUbicacionCreada = (
    ubicacionId: string,
    ubicacionNombre: string
  ) => {
    setValue('ubicacion', ubicacionId)
    toast.success(`Ubicación "${ubicacionNombre}" seleccionada`)
  }

  const renderStepContent = () => {
    const seriales = parseMultipleSNList(multipleSNList)
    const articulosDeMarcaFiltrados = marcaSeleccionadaId
      ? articulos
          .filter(
            (a) =>
              a.marca === marcaSeleccionadaId &&
              a.tipo === TipoArticulo.EQUIPO &&
              ((a.nombre &&
                a.nombre
                  .toLowerCase()
                  .includes(filtroTablaArticulos.toLowerCase())) ||
                (a.modelo &&
                  a.modelo
                    .toLowerCase()
                    .includes(filtroTablaArticulos.toLowerCase())))
          )
          .sort((a, b) => a.nombre.localeCompare(b.nombre))
      : []

    switch (currentStep) {
      case STEPS.SELECCION_TIPO:
        return (
          <div className='space-y-6'>
            <DialogDescription className='text-center text-lg'>
              Seleccione el tipo de articulo que desea agregar:
            </DialogDescription>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <Card
                className={`cursor-pointer hover:shadow-xl transition-shadow ${tipoSeleccionado === TipoArticulo.EQUIPO ? 'ring-2 ring-primary shadow-xl' : 'hover:border-primary/70'}`}
                onClick={() => {
                  setValue('tipo', TipoArticulo.EQUIPO, {
                    shouldValidate: true,
                    shouldTouch: true,
                  })
                  nextStep()
                }}
              >
                <CardHeader className='items-center'>
                  <Cpu size={48} className='mb-3 text-primary' />
                  <CardTitle>Equipo</CardTitle>
                  <CardDescription className='text-center'>
                    Artículo único con número de serie/MAC (ej: Router, ONT,
                    Antena).
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card
                className={`cursor-pointer hover:shadow-xl transition-shadow ${tipoSeleccionado === TipoArticulo.MATERIAL ? 'ring-2 ring-primary shadow-xl' : 'hover:border-primary/70'}`}
                onClick={() => {
                  setValue('tipo', TipoArticulo.MATERIAL, {
                    shouldValidate: true,
                    shouldTouch: true,
                  })
                  nextStep()
                }}
              >
                <CardHeader className='items-center'>
                  <Box size={48} className='mb-3 text-primary' />
                  <CardTitle>Material</CardTitle>
                  <CardDescription className='text-center'>
                    Artículo consumible o de stock (ej: Cable, Conectores,
                    Cajas).
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
            {errors.tipo && (
              <p className='text-xs text-destructive mt-2 text-center'>
                {errors.tipo.message}
              </p>
            )}
          </div>
        )
      case STEPS.DETALLES_MATERIAL:
        return (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5'>
              <div className='space-y-1.5 md:col-span-2'>
                <Label htmlFor='nombre'>
                  Nombre del Material{' '}
                  <span className='text-destructive'>*</span>
                </Label>
                <Controller
                  name='nombre'
                  control={control}
                  rules={{
                    required: 'El nombre es obligatorio.',
                    minLength: { value: 3, message: 'Mínimo 3 caracteres.' },
                  }}
                  render={({ field }) => (
                    <div className='relative'>
                      <Popover
                        open={openMaterialNombreCombobox}
                        onOpenChange={setOpenMaterialNombreCombobox}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant='outline'
                            role='combobox'
                            aria-expanded={openMaterialNombreCombobox}
                            className={`w-full justify-between ${errors.nombre ? 'border-destructive' : ''} ${articuloExistenteDetectado ? 'bg-muted/60 cursor-not-allowed' : ''}`}
                            disabled={!!articuloExistenteDetectado || isLoading}
                          >
                            {field.value ||
                              '-- Escriba o seleccione un material --'}
                            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-[--radix-popover-trigger-width] p-0'>
                          <Command
                            filter={(value, search) => {
                              if (value === search) return 1
                              return value
                                .toLowerCase()
                                .includes(search.toLowerCase())
                                ? 1
                                : 0
                            }}
                          >
                            <CommandInput
                              placeholder='Buscar o crear material...'
                              value={searchValueMaterialNombre}
                              onValueChange={(search) => {
                                setSearchValueMaterialNombre(search)
                                if (
                                  !openMaterialNombreCombobox &&
                                  search.length > 0
                                ) {
                                  setOpenMaterialNombreCombobox(true)
                                }
                                field.onChange(search)
                              }}
                              disabled={
                                !!articuloExistenteDetectado || isLoading
                              }
                            />
                            <CommandList>
                              <CommandEmpty>
                                {searchValueMaterialNombre.trim() === ''
                                  ? 'Escriba para buscar materiales existentes.'
                                  : `No se encontró el material "${searchValueMaterialNombre}". Puede crearlo con este nombre.`}
                              </CommandEmpty>
                              <CommandGroup
                                heading={
                                  articulos.filter(
                                    (a) =>
                                      a.idinventario === inventarioId &&
                                      a.tipo === TipoArticulo.MATERIAL &&
                                      a.nombre
                                        .toLowerCase()
                                        .includes(
                                          searchValueMaterialNombre.toLowerCase()
                                        )
                                  ).length > 0
                                    ? 'Materiales Existentes'
                                    : undefined
                                }
                              >
                                {articulos
                                  .filter(
                                    (a) =>
                                      a.idinventario === inventarioId &&
                                      a.tipo === TipoArticulo.MATERIAL &&
                                      a.nombre
                                        .toLowerCase()
                                        .includes(
                                          searchValueMaterialNombre.toLowerCase()
                                        )
                                  )
                                  .sort((a, b) =>
                                    a.nombre.localeCompare(b.nombre)
                                  )
                                  .map((material) => {
                                    if (
                                      !material ||
                                      typeof material.id !== 'string' ||
                                      material.id === ''
                                    )
                                      return null
                                    return (
                                      <CommandItem
                                        key={material.id}
                                        value={material.nombre}
                                        onSelect={(currentValue) => {
                                          field.onChange(currentValue)
                                          setSearchValueMaterialNombre(
                                            currentValue
                                          )
                                          verificarArticuloExistenteDebounced()(
                                            currentValue
                                          )
                                          setOpenMaterialNombreCombobox(false)
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            'mr-2 h-4 w-4',
                                            field.value === material.nombre
                                              ? 'opacity-100'
                                              : 'opacity-0'
                                          )}
                                        />
                                        {material.nombre}
                                        {material.descripcion && (
                                          <span className='ml-2 text-xs text-muted-foreground'>
                                            (
                                            {material.descripcion.substring(
                                              0,
                                              30
                                            )}
                                            {material.descripcion.length > 30
                                              ? '...'
                                              : ''}
                                            )
                                          </span>
                                        )}
                                      </CommandItem>
                                    )
                                  })}
                              </CommandGroup>
                              {searchValueMaterialNombre.trim().length >= 3 &&
                                !articulos.some(
                                  (a) =>
                                    a.idinventario === inventarioId &&
                                    a.tipo === TipoArticulo.MATERIAL &&
                                    a.nombre.toLowerCase() ===
                                      searchValueMaterialNombre
                                        .toLowerCase()
                                        .trim()
                                ) && (
                                  <CommandItem
                                    key='crear-nuevo'
                                    value={searchValueMaterialNombre.trim()}
                                    onSelect={(currentValue) => {
                                      field.onChange(currentValue)
                                      setSearchValueMaterialNombre(currentValue)
                                      setArticuloExistenteDetectado(null)
                                      setIsCheckingArticulo(false)
                                      setOpenMaterialNombreCombobox(false)
                                      toast.info(
                                        `Creando nuevo material: "${currentValue}"`
                                      )
                                    }}
                                    className='text-sm text-muted-foreground italic'
                                  >
                                    <PlusCircle className='mr-2 h-4 w-4' />
                                    Crear nuevo material: "
                                    {searchValueMaterialNombre.trim()}"
                                  </CommandItem>
                                )}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {articuloExistenteDetectado && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type='button'
                                size='icon'
                                variant='ghost'
                                className='absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7 text-destructive border border-destructive bg-white hover:bg-destructive/10'
                                onClick={() => {
                                  setArticuloExistenteDetectado(null)
                                  setIsCheckingArticulo(false)
                                  setValue('nombre', '', {
                                    shouldValidate: true,
                                    shouldTouch: true,
                                  })
                                  setSearchValueMaterialNombre('')
                                }}
                                tabIndex={0}
                                aria-label='Limpiar selección de material'
                              >
                                <X className='h-4 w-4' />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Limpiar selección de material
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  )}
                />
                {errors.nombre && (
                  <p className='text-xs text-destructive mt-1'>
                    {errors.nombre.message}
                  </p>
                )}
                {isCheckingArticulo && (
                  <p className='text-xs text-muted-foreground mt-1'>
                    Buscando si el material ya existe...
                  </p>
                )}
                {articuloExistenteDetectado && (
                  <div className='mt-2 p-4 border-2 border-yellow-500 bg-yellow-100 rounded-md text-sm shadow flex items-start gap-3'>
                    <span className='mt-1 text-yellow-600'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-6 w-6'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z'
                        />
                      </svg>
                    </span>
                    <div>
                      <p className='font-semibold text-yellow-800 text-base mb-1'>
                        ¡Atención! Este material ya existe en el inventario.
                      </p>
                      <ul className='list-disc list-inside text-yellow-700 mt-1'>
                        <li>
                          <b>ID:</b> {articuloExistenteDetectado.id}
                        </li>
                        <li>
                          <b>Nombre:</b> {articuloExistenteDetectado.nombre}
                        </li>
                        <li>
                          <b>Stock actual:</b>{' '}
                          {articuloExistenteDetectado.cantidad || 0}{' '}
                          {articuloExistenteDetectado.unidad || ''}
                        </li>
                        <li>
                          <b>Costo unitario actual:</b>{' '}
                          {articuloExistenteDetectado.costo !== undefined
                            ? articuloExistenteDetectado.costo
                            : 'N/A'}
                        </li>
                      </ul>
                      <p className='text-yellow-700 mt-2'>
                        Al guardar, se{' '}
                        <span className='font-bold'>sumará la cantidad</span>{' '}
                        que ingrese al stock existente y se{' '}
                        <span className='font-bold'>
                          actualizarán los demás datos
                        </span>{' '}
                        (costo, descripción, etc.) con los nuevos valores del
                        formulario.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className='w-full flex flex-col gap-2 md:flex-row md:gap-4'>
                <div className='flex-1 flex flex-col'>
                  <Label htmlFor='cantidad' className='mb-1'>
                    Cantidad a{' '}
                    {articuloExistenteDetectado ? 'Agregar' : 'Registrar'}{' '}
                    <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    id='cantidad'
                    type='number'
                    min={articuloExistenteDetectado ? 0 : 1}
                    max={9999}
                    step='1'
                    inputMode='numeric'
                    className={`h-10 text-center ${errors.cantidad ? 'border-destructive' : ''}`}
                    placeholder='0'
                    {...register('cantidad', {
                      required: 'La cantidad es obligatoria.',
                      valueAsNumber: true,
                      min: {
                        value: articuloExistenteDetectado ? 0 : 1,
                        message: articuloExistenteDetectado
                          ? 'No puede ser negativo.'
                          : 'Debe ser al menos 1.',
                      },
                    })}
                  />
                  {errors.cantidad && (
                    <p className='text-xs text-destructive mt-1'>
                      {errors.cantidad.message}
                    </p>
                  )}
                </div>
                <div className='flex-1 flex flex-col'>
                  <Label htmlFor='cantidad_minima' className='mb-1'>
                    Cantidad Mínima (Stock de alerta)
                  </Label>
                  <Input
                    id='cantidad_minima'
                    type='number'
                    min={0}
                    step={1}
                    inputMode='numeric'
                    placeholder='Ej: 5'
                    {...register('cantidad_minima', {
                      valueAsNumber: true,
                      min: { value: 0, message: 'No puede ser negativo.' },
                    })}
                    disabled={isLoading}
                  />
                  {errors.cantidad_minima && (
                    <p className='text-xs text-destructive mt-1'>
                      {errors.cantidad_minima.message}
                    </p>
                  )}
                </div>
                <div className='flex-1 flex flex-col'>
                  <Label htmlFor='unidad' className='mb-1'>
                    Unidad de Medida <span className='text-destructive'>*</span>
                  </Label>
                  <Controller
                    control={control}
                    name='unidad'
                    rules={{ required: 'La unidad es obligatoria.' }}
                    render={({ field }) => (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Select
                                onValueChange={field.onChange}
                                value={
                                  field.value ||
                                  articuloExistenteDetectado?.unidad ||
                                  Unidad.UNIDAD
                                }
                                disabled={!!articuloExistenteDetectado}
                              >
                                <SelectTrigger
                                  id='unidad'
                                  className={`h-10 w-full ${errors.unidad ? 'border-destructive' : ''} ${articuloExistenteDetectado ? 'bg-muted/60 cursor-not-allowed' : ''}`}
                                >
                                  <SelectValue placeholder='-- Seleccionar unidad --' />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.values(Unidad).map((u) => (
                                    <SelectItem key={u} value={u}>
                                      {u.charAt(0).toUpperCase() +
                                        u.slice(1).toLowerCase()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </TooltipTrigger>
                          {!!articuloExistenteDetectado && (
                            <TooltipContent>
                              No se puede cambiar la unidad de medida de un
                              material existente.
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  />
                  {errors.unidad && (
                    <p className='text-xs text-destructive mt-1'>
                      {errors.unidad.message}
                    </p>
                  )}
                </div>
                <div className='flex-1 flex flex-col'>
                  <Label htmlFor='costo' className='mb-1'>
                    Costo Unitario <span className='text-destructive'>*</span>
                  </Label>
                  <div className='relative'>
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium pointer-events-none'>
                      RD$
                    </span>
                    <Input
                      id='costo'
                      type='number'
                      min='0'
                      step='0.01'
                      inputMode='decimal'
                      placeholder='0.00'
                      className={`pl-12 h-10 ${errors.costo ? 'border-destructive' : ''}`}
                      {...register('costo', {
                        required: 'El costo es obligatorio.',
                        valueAsNumber: true,
                        min: { value: 0, message: 'No puede ser negativo.' },
                      })}
                    />
                  </div>
                  {errors.costo && (
                    <p className='text-xs text-destructive mt-1'>
                      {errors.costo.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className='space-y-5 pt-4 border-t mt-4'>
              <div className='space-y-1.5'>
                <Label htmlFor='descripcion'>Descripción Adicional</Label>
                <Textarea
                  id='descripcion'
                  placeholder='Cualquier detalle relevante: color, proveedor, notas especiales, etc.'
                  {...register('descripcion')}
                  rows={3}
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='ubicacion'>Ubicación en Almacén</Label>
                <div className='flex gap-2'>
                  <Controller
                    name='ubicacion'
                    control={control}
                    render={({ field }) => (
                      <Popover
                        open={openUbicacionCombobox}
                        onOpenChange={setOpenUbicacionCombobox}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant='outline'
                            role='combobox'
                            aria-expanded={openUbicacionCombobox}
                            className='w-full justify-between'
                            disabled={isLoading}
                          >
                            {field.value
                              ? ubicaciones.find((u) => u.id === field.value)
                                  ?.nombre || field.value
                              : '-- Seleccionar ubicación --'}
                            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-[--radix-popover-trigger-width] p-0'>
                          <Command>
                            <CommandInput
                              placeholder='Buscar ubicación...'
                              value={searchValueUbicacion}
                              onValueChange={setSearchValueUbicacion}
                            />
                            <CommandList>
                              <CommandEmpty>
                                {searchValueUbicacion === ''
                                  ? 'Escriba para buscar o cree una nueva.'
                                  : `No se encontró la ubicación "${searchValueUbicacion}".`}
                              </CommandEmpty>
                              <CommandGroup>
                                {ubicaciones
                                  .filter((u) =>
                                    u.nombre
                                      .toLowerCase()
                                      .includes(
                                        searchValueUbicacion.toLowerCase()
                                      )
                                  )
                                  .sort((a, b) =>
                                    a.nombre.localeCompare(b.nombre)
                                  )
                                  .map((u) => (
                                    <CommandItem
                                      key={u.id}
                                      value={u.id}
                                      onSelect={(currentValue) => {
                                        field.onChange(
                                          currentValue === field.value
                                            ? ''
                                            : currentValue
                                        )
                                        setOpenUbicacionCombobox(false)
                                        setSearchValueUbicacion('')
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          field.value === u.id
                                            ? 'opacity-100'
                                            : 'opacity-0'
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
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setShowNuevaUbicacionForm(true)}
                    disabled={isLoading}
                  >
                    Nueva Ubicación
                  </Button>
                </div>
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label>Imagen del Material (Opcional)</Label>
              <div className='border-2 border-dashed rounded-lg p-6 text-center space-y-3 hover:border-primary transition-colors'>
                {imagePreview ? (
                  <div className='relative group inline-block'>
                    <img
                      src={imagePreview}
                      alt='Vista previa'
                      className='max-h-48 mx-auto rounded-md shadow-md object-contain'
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type='button'
                            variant='destructive'
                            size='icon'
                            className='absolute -top-2 -right-2 opacity-80 group-hover:opacity-100 transition-opacity rounded-full h-7 w-7'
                            onClick={removeImage}
                          >
                            <X className='h-4 w-4' />
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
                    className='flex flex-col items-center justify-center space-y-2 cursor-pointer'
                    onClick={() =>
                      document.getElementById('imagenFile')?.click()
                    }
                  >
                    <Upload className='h-10 w-10 text-muted-foreground' />
                    <p className='text-sm text-muted-foreground'>
                      Arrastra una imagen o{' '}
                      <span className='text-primary font-medium'>
                        haz clic aquí
                      </span>{' '}
                      para seleccionar.
                    </p>
                    <Input
                      id='imagenFile'
                      type='file'
                      accept='image/*'
                      className='hidden'
                      onChange={handleImageChange}
                    />
                  </div>
                )}
              </div>
              {errors.imagenUrl && (
                <p className='text-xs text-destructive mt-1'>
                  {errors.imagenUrl.message}
                </p>
              )}
            </div>
          </div>
        )
      case STEPS.DETALLES_EQUIPO_MARCA_MODELO:
        return (
          <div className='space-y-6'>
            <div className='space-y-1.5'>
              <Label htmlFor='marca'>
                1. Seleccione la Marca del Equipo{' '}
                <span className='text-destructive'>*</span>
              </Label>
              <div className='flex items-center gap-2'>
                <Controller
                  name='marca'
                  control={control}
                  rules={{ required: 'La marca es obligatoria.' }}
                  render={({ field }) => (
                    <Popover
                      open={openMarcaCombobox}
                      onOpenChange={setOpenMarcaCombobox}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          role='combobox'
                          aria-expanded={openMarcaCombobox}
                          className={`w-full justify-between ${errors.marca ? 'border-destructive' : ''}`}
                          disabled={isLoading}
                        >
                          {field.value
                            ? marcas.find((m) => m.id === field.value)?.nombre
                            : '-- Seleccionar marca --'}
                          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-[--radix-popover-trigger-width] p-0'>
                        <Command>
                          <CommandInput
                            placeholder='Buscar marca...'
                            value={searchValueMarca}
                            onValueChange={setSearchValueMarca}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {searchValueMarca === ''
                                ? 'Escriba para buscar o cree una nueva.'
                                : `No se encontró la marca "${searchValueMarca}".`}
                            </CommandEmpty>
                            <CommandGroup>
                              {marcas
                                .filter((m) =>
                                  m.nombre
                                    .toLowerCase()
                                    .includes(searchValueMarca.toLowerCase())
                                )
                                .sort((a, b) =>
                                  a.nombre.localeCompare(b.nombre)
                                )
                                .map((m) => {
                                  if (
                                    !m ||
                                    typeof m.id !== 'string' ||
                                    m.id === ''
                                  )
                                    return null
                                  return (
                                    <CommandItem
                                      key={m.id}
                                      value={m.id}
                                      onSelect={(currentValue) => {
                                        field.onChange(
                                          currentValue === field.value
                                            ? ''
                                            : currentValue
                                        )
                                        setFiltroTablaArticulos('')
                                        setSelectedArticuloBaseId(null)
                                        setValue('modelo', '')
                                        setValue('nombre', '')
                                        setOpenMarcaCombobox(false)
                                        setSearchValueMarca('')
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          field.value === m.id
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                        )}
                                      />
                                      {m.nombre}
                                    </CommandItem>
                                  )
                                })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                />
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setShowNuevaMarcaForm(true)}
                  disabled={isLoading}
                >
                  Nueva Marca
                </Button>
              </div>
              {errors.marca && (
                <p className='text-xs text-destructive mt-1'>
                  {errors.marca.message}
                </p>
              )}
            </div>

            {marcaSeleccionadaId && (
              <div className='space-y-4'>
                <Label>
                  2. Seleccione una Definición de Equipo Existente (Nombre y
                  Modelo)
                </Label>
                <div className='flex items-center gap-2 mb-2'>
                  <div className='relative w-full'>
                    <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input
                      type='search'
                      placeholder='Filtrar por nombre o modelo...'
                      value={filtroTablaArticulos}
                      onChange={(e) => setFiltroTablaArticulos(e.target.value)}
                      className='pl-8 w-full'
                      disabled={isLoading || mostrandoFormNuevoArticuloBase}
                    />
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={(e) => {
                      e.preventDefault()
                      setMostrandoFormNuevoArticuloBase(
                        !mostrandoFormNuevoArticuloBase
                      )
                    }}
                    disabled={isLoading}
                    type='button'
                  >
                    {mostrandoFormNuevoArticuloBase ? (
                      <>
                        <X className='mr-2 h-4 w-4' /> Cancelar Nuevo
                      </>
                    ) : (
                      <>
                        <PlusCircle className='mr-2 h-4 w-4' /> Definir Nuevo
                      </>
                    )}
                  </Button>
                </div>

                {mostrandoFormNuevoArticuloBase ? (
                  <div className='my-4 p-4 border rounded-md bg-muted/10'>
                    <h3 className='text-lg font-semibold mb-3'>
                      Definir Nuevo Tipo de Equipo
                    </h3>
                    <form
                      className='space-y-4'
                      onSubmit={(e) => e.preventDefault()}
                    >
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label htmlFor='nuevoNombreArticulo'>
                            Nombre del Equipo{' '}
                            <span className='text-destructive'>*</span>
                          </Label>
                          <Input
                            id='nuevoNombreArticulo'
                            placeholder='Ej: Router Wifi, ONT, Switch 24 puertos'
                            value={getValues('nombre')}
                            onChange={(e) =>
                              setValue('nombre', e.target.value, {
                                shouldValidate: true,
                              })
                            }
                            className={
                              errors.nombre ? 'border-destructive' : ''
                            }
                          />
                          {errors.nombre && (
                            <p className='text-xs text-destructive'>
                              {errors.nombre.message}
                            </p>
                          )}
                          <p className='text-xs text-muted-foreground'>
                            Nombre genérico del tipo de equipo
                          </p>
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='nuevoModeloArticulo'>
                            Modelo <span className='text-destructive'>*</span>
                          </Label>
                          <Input
                            id='nuevoModeloArticulo'
                            placeholder='Ej: WR-841N, HG8145V5, SG350-28'
                            value={getValues('modelo')}
                            onChange={(e) =>
                              setValue('modelo', e.target.value, {
                                shouldValidate: true,
                              })
                            }
                            className={
                              errors.modelo ? 'border-destructive' : ''
                            }
                          />
                          {errors.modelo && (
                            <p className='text-xs text-destructive'>
                              {errors.modelo.message}
                            </p>
                          )}
                          <p className='text-xs text-muted-foreground'>
                            Modelo específico del fabricante
                          </p>
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='nuevoCostoArticulo'>
                          Costo Unitario (Moneda Local)
                        </Label>
                        <Input
                          id='nuevoCostoArticulo'
                          type='number'
                          min='0'
                          step='0.01'
                          placeholder='Ej: 25.50'
                          value={getValues('costo')}
                          onChange={(e) => {
                            const value =
                              e.target.value === ''
                                ? 0
                                : parseFloat(e.target.value)
                            setValue('costo', value)
                          }}
                        />
                        <p className='text-xs text-muted-foreground'>
                          Precio de compra por unidad
                        </p>
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='nuevaDescripcionArticulo'>
                          Descripción (Opcional)
                        </Label>
                        <Textarea
                          id='nuevaDescripcionArticulo'
                          placeholder='Especificaciones técnicas, características, etc.'
                          value={getValues('descripcion') || ''}
                          onChange={(e) =>
                            setValue('descripcion', e.target.value)
                          }
                          rows={3}
                        />
                      </div>

                      <div className='flex justify-end space-x-2 pt-2'>
                        <Button
                          type='button'
                          variant='outline'
                          onClick={() =>
                            setMostrandoFormNuevoArticuloBase(false)
                          }
                        >
                          Cancelar
                        </Button>
                        <Button
                          type='button'
                          onClick={() => {
                            if (!getValues('nombre') || !getValues('modelo')) {
                              toast.error('Nombre y modelo son obligatorios')
                              return
                            }

                            toast.success(
                              `Tipo de equipo "${getValues('nombre')} ${getValues('modelo')}" definido`
                            )
                            setMostrandoFormNuevoArticuloBase(false)
                            nextStep()
                          }}
                        >
                          Guardar y Continuar
                        </Button>
                      </div>
                    </form>
                  </div>
                ) : articulosDeMarcaFiltrados.length > 0 ? (
                  <div className='rounded-md border max-h-[300px] overflow-y-auto'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre del Artículo</TableHead>
                          <TableHead>Modelo</TableHead>
                          <TableHead className='text-right'>Acción</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {articulosDeMarcaFiltrados.map((articulo) => (
                          <TableRow key={articulo.id}>
                            <TableCell className='font-medium'>
                              {articulo.nombre}
                            </TableCell>
                            <TableCell>{articulo.modelo || 'N/A'}</TableCell>
                            <TableCell className='text-right'>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => {
                                  setValue('nombre', articulo.nombre, {
                                    shouldTouch: true,
                                    shouldValidate: true,
                                  })
                                  setValue('modelo', articulo.modelo || '', {
                                    shouldTouch: true,
                                    shouldValidate: true,
                                  })
                                  setValue('costo', articulo.costo || 0, {
                                    shouldTouch: true,
                                    shouldValidate: true,
                                  })
                                  setValue(
                                    'descripcion',
                                    articulo.descripcion || '',
                                    { shouldTouch: true, shouldValidate: true }
                                  )
                                  setSelectedArticuloBaseId(articulo.id)
                                  toast.success(
                                    `"${articulo.nombre}" seleccionado.`
                                  )
                                  nextStep()
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
                  <p className='text-sm text-muted-foreground text-center py-4'>
                    {filtroTablaArticulos
                      ? `No se encontraron definiciones de equipo para "${filtroTablaArticulos}".`
                      : 'No hay definiciones de equipo para esta marca. Puede crear una con "Definir Nuevo"'}
                  </p>
                )}
              </div>
            )}

            <NuevaMarcaForm
              open={showNuevaMarcaForm}
              onOpenChange={setShowNuevaMarcaForm}
              onMarcaCreada={(nuevaMarca: Marca) => {
                setValue('marca', nuevaMarca.id)
                toast.success(`Marca "${nuevaMarca.nombre}" seleccionada`)
              }}
            />
          </div>
        )
      case STEPS.DETALLES_EQUIPO_ESPECIFICOS:
        return (
          <div className='space-y-6'>
            <div className='mb-4 p-4 border rounded-md bg-muted/50'>
              <h4 className='font-medium text-lg mb-1'>
                Resumen del Equipo Base:
              </h4>
              <p className='text-sm text-muted-foreground'>
                <strong>Nombre:</strong> {getValues('nombre') || 'N/A'}
                <br />
                <strong>Marca:</strong>{' '}
                {marcas.find((m) => m.id === getValues('marca'))?.nombre ||
                  'N/A'}{' '}
                <br />
                <strong>Modelo:</strong> {getValues('modelo') || 'N/A'}
              </p>
              {selectedArticuloBaseId && (
                <p className='text-xs text-green-600 mt-1'>
                  Se están utilizando los datos (costo, descripción general) de
                  esta definición de equipo.
                </p>
              )}
            </div>

            <div className='flex justify-between items-center my-4'>
              <h3 className='text-lg font-medium'>Datos del Equipo</h3>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsMultipleMode(!isMultipleMode)}
                className='flex items-center space-x-1'
              >
                {isMultipleMode ? (
                  <>Modo Individual</>
                ) : (
                  <>Modo Múltiple (Escáner)</>
                )}
              </Button>
            </div>

            {isMultipleMode ? (
              <div className='p-4 bg-primary/5 rounded border border-primary/20'>
                <p className='text-sm mb-3'>
                  Utilice este modo para agregar múltiples equipos del mismo
                  tipo en una sola operación. Ideal para escanear varios números
                  de serie con un lector de códigos de barras.
                </p>
                <Button
                  type='button'
                  onClick={() =>
                    setCurrentStep(STEPS.DETALLES_EQUIPOS_MULTIPLES)
                  }
                  className='w-full'
                >
                  Ir a Modo Múltiple
                </Button>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5'>
                <div className='space-y-1.5'>
                  <Label htmlFor='serial'>
                    Número de Serie (S/N){' '}
                    <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    id='serial'
                    placeholder='Ingrese o escanee S/N'
                    {...register('serial', {
                      required: 'El S/N es obligatorio para equipos.',
                      minLength: {
                        value: 3,
                        message: 'S/N debe tener al menos 3 caracteres',
                      },
                    })}
                    className={errors.serial ? 'border-destructive' : ''}
                    disabled={isLoading}
                  />
                  {errors.serial && (
                    <p className='text-xs text-destructive mt-1'>
                      {errors.serial.message}
                    </p>
                  )}
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='mac'>
                    Dirección MAC <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    id='mac'
                    placeholder='AA:BB:CC:DD:EE:FF'
                    {...register('mac', {
                      required: 'La MAC es obligatoria para equipos.',
                      pattern: {
                        value:
                          /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^([0-9A-Fa-f]{12})$/,
                        message:
                          'Formato MAC inválido (ej: AA:BB:CC:DD:EE:FF o AABBCCDDEEFF)',
                      },
                    })}
                    className={errors.mac ? 'border-destructive' : ''}
                    disabled={isLoading}
                  />
                  {errors.mac && (
                    <p className='text-xs text-destructive mt-1'>
                      {errors.mac.message}
                    </p>
                  )}
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='wirelessKey'>
                    Clave Inalámbrica (Wireless Key)
                  </Label>
                  <Input
                    id='wirelessKey'
                    placeholder='Clave de Wi-Fi si aplica'
                    {...register('wirelessKey')}
                    disabled={isLoading}
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='garantia'>Garantía (en meses)</Label>
                  <Input
                    id='garantia'
                    type='number'
                    min='0'
                    placeholder='Ej: 12'
                    {...register('garantia', {
                      valueAsNumber: true,
                      min: { value: 0, message: 'No puede ser negativo.' },
                    })}
                    className={errors.garantia ? 'border-destructive' : ''}
                    disabled={isLoading}
                  />
                  {errors.garantia && (
                    <p className='text-xs text-destructive mt-1'>
                      {errors.garantia.message}
                    </p>
                  )}
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='ubicacion'>
                    Ubicación de esta Unidad (Opcional)
                  </Label>
                  <div className='flex gap-2'>
                    <Controller
                      name='ubicacion'
                      control={control}
                      render={({ field }) => (
                        <Popover
                          open={openUbicacionCombobox}
                          onOpenChange={setOpenUbicacionCombobox}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant='outline'
                              role='combobox'
                              aria-expanded={openUbicacionCombobox}
                              className='w-full justify-between'
                              disabled={isLoading}
                            >
                              {field.value
                                ? ubicaciones.find((u) => u.id === field.value)
                                    ?.nombre || field.value
                                : '-- Seleccionar ubicación --'}
                              <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className='w-[--radix-popover-trigger-width] p-0'>
                            <Command>
                              <CommandInput
                                placeholder='Buscar ubicación...'
                                value={searchValueUbicacion}
                                onValueChange={setSearchValueUbicacion}
                              />
                              <CommandList>
                                <CommandEmpty>
                                  {searchValueUbicacion === ''
                                    ? 'Escriba para buscar o cree una nueva.'
                                    : `No se encontró la ubicación "${searchValueUbicacion}".`}
                                </CommandEmpty>
                                <CommandGroup>
                                  {ubicaciones
                                    .filter((u) =>
                                      u.nombre
                                        .toLowerCase()
                                        .includes(
                                          searchValueUbicacion.toLowerCase()
                                        )
                                    )
                                    .sort((a, b) =>
                                      a.nombre.localeCompare(b.nombre)
                                    )
                                    .map((u) => (
                                      <CommandItem
                                        key={u.id}
                                        value={u.id}
                                        onSelect={(currentValue) => {
                                          field.onChange(
                                            currentValue === field.value
                                              ? ''
                                              : currentValue
                                          )
                                          setOpenUbicacionCombobox(false)
                                          setSearchValueUbicacion('')
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            'mr-2 h-4 w-4',
                                            field.value === u.id
                                              ? 'opacity-100'
                                              : 'opacity-0'
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
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => setShowNuevaUbicacionForm(true)}
                      disabled={isLoading}
                    >
                      Nueva Ubicación
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className='space-y-1.5'>
              <Label htmlFor='descripcionUnidad'>
                Descripción Específica de esta Unidad
              </Label>
              <Textarea
                id='descripcionUnidad'
                placeholder='Notas sobre esta unidad en particular (ej: Rayón en carcasa, Configuración especial)'
                {...register('descripcion')}
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div className='space-y-1.5'>
              <Label>Imagen de esta Unidad (Opcional)</Label>
              <div className='border-2 border-dashed rounded-lg p-6 text-center space-y-3 hover:border-primary transition-colors'>
                {imagePreview ? (
                  <div className='relative group inline-block'>
                    <img
                      src={imagePreview}
                      alt='Vista previa de unidad'
                      className='max-h-48 mx-auto rounded-md shadow-md object-contain'
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type='button'
                            variant='destructive'
                            size='icon'
                            className='absolute -top-2 -right-2 opacity-80 group-hover:opacity-100 transition-opacity rounded-full h-7 w-7'
                            onClick={removeImage}
                          >
                            <X className='h-4 w-4' />
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
                    className='flex flex-col items-center justify-center space-y-2 cursor-pointer'
                    onClick={() =>
                      document.getElementById('imagenFileEquipo')?.click()
                    }
                  >
                    <Upload className='h-10 w-10 text-muted-foreground' />
                    <p className='text-sm text-muted-foreground'>
                      Arrastra una imagen o{' '}
                      <span className='text-primary font-medium'>
                        haz clic aquí
                      </span>{' '}
                      para seleccionar.
                    </p>
                    <Input
                      id='imagenFileEquipo'
                      type='file'
                      accept='image/*'
                      className='hidden'
                      onChange={handleImageChange}
                    />
                  </div>
                )}
              </div>
              {errors.imagenUrl && (
                <p className='text-xs text-destructive mt-1'>
                  {errors.imagenUrl.message}
                </p>
              )}
            </div>
          </div>
        )
      case STEPS.DETALLES_EQUIPOS_MULTIPLES:
        return (
          <div className='space-y-6'>
            <div className='mb-4 p-4 border rounded-md bg-muted/50'>
              <h4 className='font-medium text-lg mb-1'>
                Resumen del Equipo Base:
              </h4>
              <p className='text-sm text-muted-foreground'>
                <strong>Nombre:</strong> {getValues('nombre') || 'N/A'}
                <br />
                <strong>Marca:</strong>{' '}
                {marcas.find((m) => m.id === getValues('marca'))?.nombre ||
                  'N/A'}{' '}
                <br />
                <strong>Modelo:</strong> {getValues('modelo') || 'N/A'}
              </p>
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between items-center'>
                <Label htmlFor='multipleSNList' className='text-lg font-medium'>
                  Lista de Números de Serie (S/N)
                </Label>
                <span className='text-sm text-muted-foreground'>
                  {seriales.length} equipos detectados
                </span>
              </div>
              <div className='text-sm text-muted-foreground mb-2'>
                Escanee múltiples códigos o ingrese manualmente. Cada número de
                serie debe estar en una línea separada.
                <br />
                <strong>Tip:</strong> Configure su escáner para agregar un salto
                de línea después de cada código.
              </div>
              <Textarea
                id='multipleSNList'
                placeholder='Escanee o pegue múltiples números de serie, uno por línea
Ejemplo:
SN123456
SN789012
SN345678'
                value={multipleSNList}
                onChange={(e) => setMultipleSNList(e.target.value)}
                rows={10}
                className='font-mono text-sm'
                autoFocus
              />
            </div>

            {seriales.length > 0 && (
              <div className='p-4 border rounded-md bg-muted/10'>
                <div className='flex justify-between items-center mb-2'>
                  <h4 className='font-medium'>Vista previa:</h4>
                  <span className='text-sm text-primary font-medium'>
                    {seriales.length} equipos
                  </span>
                </div>
                <div className='mt-2 max-h-40 overflow-y-auto text-sm'>
                  <ul className='list-disc list-inside space-y-1'>
                    {seriales.map((serial, idx) => (
                      <li
                        key={idx}
                        className='flex justify-between items-center'
                      >
                        <span className='font-mono'>{serial}</span>
                        <span className='text-xs text-muted-foreground'>
                          S/N #{idx + 1}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className='space-y-1.5'>
              <Label htmlFor='ubicacion'>Ubicación Común</Label>
              <div className='flex gap-2'>
                <Controller
                  name='ubicacion'
                  control={control}
                  render={({ field }) => (
                    <Popover
                      open={openUbicacionCombobox}
                      onOpenChange={setOpenUbicacionCombobox}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          role='combobox'
                          aria-expanded={openUbicacionCombobox}
                          className='w-full justify-between'
                          disabled={isLoading}
                        >
                          {field.value
                            ? ubicaciones.find((u) => u.id === field.value)
                                ?.nombre || field.value
                            : '-- Seleccionar ubicación --'}
                          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-[--radix-popover-trigger-width] p-0'>
                        <Command>
                          <CommandInput
                            placeholder='Buscar ubicación...'
                            value={searchValueUbicacion}
                            onValueChange={setSearchValueUbicacion}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {searchValueUbicacion === ''
                                ? 'Escriba para buscar o cree una nueva.'
                                : `No se encontró la ubicación "${searchValueUbicacion}".`}
                            </CommandEmpty>
                            <CommandGroup>
                              {ubicaciones
                                .filter((u) =>
                                  u.nombre
                                    .toLowerCase()
                                    .includes(
                                      searchValueUbicacion.toLowerCase()
                                    )
                                )
                                .sort((a, b) =>
                                  a.nombre.localeCompare(b.nombre)
                                )
                                .map((u) => (
                                  <CommandItem
                                    key={u.id}
                                    value={u.id}
                                    onSelect={(currentValue) => {
                                      field.onChange(
                                        currentValue === field.value
                                          ? ''
                                          : currentValue
                                      )
                                      setOpenUbicacionCombobox(false)
                                      setSearchValueUbicacion('')
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        field.value === u.id
                                          ? 'opacity-100'
                                          : 'opacity-0'
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
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setShowNuevaUbicacionForm(true)}
                  disabled={isLoading}
                >
                  Nueva Ubicación
                </Button>
              </div>
            </div>

            <div className='p-4 bg-amber-50 border border-amber-200 rounded-md'>
              <h4 className='font-medium text-amber-800 flex items-center'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 mr-2'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                    clipRule='evenodd'
                  />
                </svg>
                Información Importante
              </h4>
              <ul className='mt-2 text-sm text-amber-700 list-disc list-inside space-y-1'>
                <li>
                  Se creará un registro individual en el inventario para cada
                  número de serie.
                </li>
                <li>
                  Todos compartirán la misma marca, modelo y datos generales.
                </li>
                <li>
                  Las MACs se generarán automáticamente si no se especifican.
                </li>
                <li>
                  Este proceso puede tardar unos segundos dependiendo de la
                  cantidad de equipos.
                </li>
              </ul>
            </div>
          </div>
        )
      default:
        return <div>Paso desconocido</div>
    }
  }

  useHotkeys('esc', () => onOpenChange(false), [onOpenChange])
  useHotkeys('ctrl+s, command+s', (e) => {
    e.preventDefault()
    handleSubmit(onSubmitHandler)()
  }, [handleSubmit, onSubmitHandler])

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className='sm:max-w-[700px] md:max-w-[800px] lg:max-w-[900px] max-h-[95vh] overflow-y-auto p-6'>
        <DialogHeader className='mb-4'>
          <DialogTitle className='text-2xl'>
            {currentStep === STEPS.SELECCION_TIPO && 'Agregar Nuevo Artículo'}
            {currentStep === STEPS.DETALLES_MATERIAL &&
              `Agregar Material: ${getValues('nombre') || '...'}`}
            {currentStep === STEPS.DETALLES_EQUIPO_MARCA_MODELO &&
              'Agregar Equipo: Marca y Modelo'}
            {currentStep === STEPS.DETALLES_EQUIPO_ESPECIFICOS &&
              'Agregar Equipo: Detalles Específicos'}
            {currentStep === STEPS.DETALLES_EQUIPOS_MULTIPLES &&
              'Agregar Equipos Múltiples'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitHandler)} className='space-y-6'>
          {renderStepContent()}

          <DialogFooter className='pt-8 flex justify-between w-full'>
            <div>
              {currentStep !== STEPS.SELECCION_TIPO && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={prevStep}
                  disabled={isLoading}
                >
                  Anterior
                </Button>
              )}
            </div>
            <div>
              <Button
                type='button'
                variant='ghost'
                onClick={handleCloseDialog}
                disabled={isLoading}
                className='mr-2'
              >
                Cancelar
              </Button>
              {currentStep === STEPS.DETALLES_MATERIAL ||
              currentStep === STEPS.DETALLES_EQUIPO_ESPECIFICOS ? (
                <Button
                  type='submit'
                  disabled={
                    isLoading ||
                    !isValid ||
                    (tipoSeleccionado === TipoArticulo.MATERIAL &&
                      articuloExistenteDetectado &&
                      touchedFields.cantidad === undefined &&
                      getValues('cantidad') <= 0) ||
                    (tipoSeleccionado === TipoArticulo.MATERIAL &&
                      !articuloExistenteDetectado &&
                      (!getValues('nombre') ||
                        getValues('cantidad') <= 0 ||
                        getValues('costo') < 0 ||
                        !getValues('unidad'))) ||
                    (tipoSeleccionado === TipoArticulo.EQUIPO &&
                      currentStep === STEPS.DETALLES_EQUIPO_ESPECIFICOS &&
                      (!getValues('serial') ||
                        !getValues('mac') ||
                        !!errors.serial ||
                        !!errors.mac))
                  }
                  variant={
                    articuloExistenteDetectado &&
                    tipoSeleccionado === TipoArticulo.MATERIAL
                      ? 'destructive'
                      : 'default'
                  }
                >
                  {isLoading ? (
                    <>
                      <span className='animate-spin mr-2'> yükleniyor...</span>{' '}
                      Guardando...
                    </>
                  ) : articuloExistenteDetectado &&
                    tipoSeleccionado === TipoArticulo.MATERIAL ? (
                    'Actualizar Material'
                  ) : (
                    'Guardar Artículo'
                  )}
                </Button>
              ) : (
                <Button
                  type='button'
                  onClick={nextStep}
                  disabled={
                    isLoading ||
                    (currentStep === STEPS.SELECCION_TIPO && !tipoSeleccionado)
                  }
                >
                  Siguiente
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>

      <NuevaMarcaForm
        open={showNuevaMarcaForm}
        onOpenChange={setShowNuevaMarcaForm}
        onMarcaCreada={(nuevaMarca: Marca) => {
          setValue('marca', nuevaMarca.id)
          toast.success(`Marca "${nuevaMarca.nombre}" seleccionada`)
        }}
      />

      <NuevaUbicacionForm
        open={showNuevaUbicacionForm}
        onOpenChange={setShowNuevaUbicacionForm}
        onUbicacionCreada={handleUbicacionCreada}
      />
    </Dialog>
  )
}
