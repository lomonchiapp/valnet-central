import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { storage } from '@/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { Loader2, X, Upload, ImagePlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePreRegistro } from '@/api/hooks/usePreRegistro'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const useToast = () => {
  return {
    toast: ({
      title,
      description,
      variant,
    }: {
      title: string
      description: string
      variant?: string
    }) => {
      if (variant === 'destructive') {
        alert(`${title}: ${description}`)
      } else {
        alert(`${title}: ${description}`)
      }
    },
  }
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]

const formSchema = z.object({
  cliente: z.string().min(2, { message: 'El nombre del cliente es requerido' }),
  cedula: z
    .string()
    .min(5, { message: 'La cédula debe tener al menos 5 caracteres' }),
  direccion: z.string().min(5, { message: 'La dirección es requerida' }),
  telefono: z
    .string()
    .min(8, { message: 'El teléfono debe tener al menos 8 dígitos' }),
  movil: z
    .string()
    .min(8, { message: 'El móvil debe tener al menos 8 dígitos' }),
  email: z.string().email({ message: 'Correo electrónico inválido' }),
  notas: z.string().optional(),
  fecha_instalacion: z
    .string()
    .min(1, { message: 'La fecha de instalación es requerida' }),
  clienteReferencia: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function NuevoPreRegistro() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const { crearPreRegistro, loading } = usePreRegistro()
  const [fotoCedula, setFotoCedula] = useState<File[]>([])
  const [fotoContrato, setFotoContrato] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cliente: '',
      cedula: '',
      direccion: '',
      telefono: '',
      movil: '',
      email: '',
      notas: '',
      fecha_instalacion: new Date().toISOString().split('T')[0],
      clienteReferencia: '',
    },
  })

  const handleImageUpload = async (files: File[], folder: string) => {
    const uploadPromises = Array.from(files).map(async (file) => {
      const fileId = uuidv4()
      const fileRef = ref(
        storage,
        `preregistros/${folder}/${fileId}-${file.name}`
      )
      await uploadBytes(fileRef, file)
      return getDownloadURL(fileRef)
    })

    return Promise.all(uploadPromises)
  }

  const onSubmit = async (values: FormValues) => {
    try {
      setUploading(true)

      // Upload images to Firebase Storage (only if files exist)
      let cedulaUrls: string[] = []
      let contratoUrls: string[] = []

      if (fotoCedula.length > 0) {
        cedulaUrls = await handleImageUpload(fotoCedula, 'cedulas')
      }

      if (fotoContrato.length > 0) {
        contratoUrls = await handleImageUpload(fotoContrato, 'contratos')
      }

      // Create pre-registro with image URLs (if available)
      const result = await crearPreRegistro({
        ...values,
        token: '',
        clienteReferencia: values.clienteReferencia || '',
        fotoCedula: cedulaUrls.length > 0 ? cedulaUrls[0] : '', // First image as main or empty string
        fotoContrato: contratoUrls, // All contract images or empty array
      })

      if (result.mikrowispSuccess) {
        toast({
          title: 'Pre-registro creado',
          description: 'El pre-registro ha sido creado exitosamente.',
        })
        navigate('/ventas/pre-registros')
      } else {
        toast({
          title: 'Error',
          description: 'Hubo un problema al crear el pre-registro.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'Hubo un problema al procesar el pre-registro.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFiles: React.Dispatch<React.SetStateAction<File[]>>,
    maxFiles: number
  ) => {
    const fileList = event.target.files
    if (!fileList) return

    const filesArray = Array.from(fileList)
    const validFiles = filesArray.filter((file) => {
      const isValidType = ACCEPTED_IMAGE_TYPES.includes(file.type)
      const isValidSize = file.size <= MAX_FILE_SIZE

      if (!isValidType) {
        toast({
          title: 'Error',
          description: `Tipo de archivo no soportado: ${file.name}`,
          variant: 'destructive',
        })
      }
      if (!isValidSize) {
        toast({
          title: 'Error',
          description: `Archivo demasiado grande: ${file.name}`,
          variant: 'destructive',
        })
      }

      return isValidType && isValidSize
    })

    setFiles((prev) => {
      const newFiles = [...prev, ...validFiles]
      return newFiles.slice(0, maxFiles) // Limit to max files
    })
  }

  const removeFile = (
    index: number,
    files: File[],
    setFiles: React.Dispatch<React.SetStateAction<File[]>>
  ) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  return (
    <Card className='w-full max-w-3xl mx-auto'>
      <CardHeader>
        <CardTitle>Nuevo Pre-Registro</CardTitle>
        <CardDescription>
          Registra un nuevo cliente potencial. Las fotos de la cédula y contrato
          son opcionales.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='cliente'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Cliente</FormLabel>
                    <FormControl>
                      <Input placeholder='Juan Perez' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='cedula'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cédula</FormLabel>
                    <FormControl>
                      <Input placeholder='001-1234567-8' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='direccion'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Calle Principal #123, Sector X'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='telefono'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder='809-123-4567' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='movil'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Móvil</FormLabel>
                    <FormControl>
                      <Input placeholder='829-123-4567' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input placeholder='cliente@example.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='fecha_instalacion'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Instalación</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='clienteReferencia'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente de Referencia (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='¿Quién refirió a este cliente?'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='notas'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionales</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Cualquier información adicional relevante...'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='space-y-4'>
              <div>
                <FormLabel>Fotos de Cédula (opcional, 2 máximo)</FormLabel>
                <FormDescription>
                  Sube fotos claras de ambos lados de la cédula si están
                  disponibles
                </FormDescription>
                <div className='mt-2 flex flex-col gap-2'>
                  <div className='grid grid-cols-2 gap-2'>
                    {fotoCedula.map((file, index) => (
                      <div
                        key={index}
                        className='relative border rounded p-2 flex items-center'
                      >
                        <div className='truncate flex-1'>{file.name}</div>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() =>
                            removeFile(index, fotoCedula, setFotoCedula)
                          }
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {fotoCedula.length < 2 && (
                    <div className='flex items-center justify-center border border-dashed rounded-lg p-4'>
                      <label className='cursor-pointer flex flex-col items-center gap-2'>
                        <ImagePlus className='h-8 w-8 text-muted-foreground' />
                        <span className='text-sm text-muted-foreground'>
                          Haz clic para subir fotos de cédula
                        </span>
                        <Input
                          type='file'
                          accept={ACCEPTED_IMAGE_TYPES.join(',')}
                          onChange={(e) =>
                            handleFileChange(e, setFotoCedula, 2)
                          }
                          className='hidden'
                          multiple
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <FormLabel>Fotos del Contrato (opcional, 10 máximo)</FormLabel>
                <FormDescription>
                  Sube fotos claras del contrato firmado si está disponible
                </FormDescription>
                <div className='mt-2 flex flex-col gap-2'>
                  <div className='grid grid-cols-2 gap-2'>
                    {fotoContrato.map((file, index) => (
                      <div
                        key={index}
                        className='relative border rounded p-2 flex items-center'
                      >
                        <div className='truncate flex-1'>{file.name}</div>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          onClick={() =>
                            removeFile(index, fotoContrato, setFotoContrato)
                          }
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {fotoContrato.length < 10 && (
                    <div className='flex items-center justify-center border border-dashed rounded-lg p-4'>
                      <label className='cursor-pointer flex flex-col items-center gap-2'>
                        <Upload className='h-8 w-8 text-muted-foreground' />
                        <span className='text-sm text-muted-foreground'>
                          Haz clic para subir fotos del contrato
                        </span>
                        <Input
                          type='file'
                          accept={ACCEPTED_IMAGE_TYPES.join(',')}
                          onChange={(e) =>
                            handleFileChange(e, setFotoContrato, 10)
                          }
                          className='hidden'
                          multiple
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <CardFooter className='flex justify-end px-0 pt-4'>
              <Button
                type='button'
                variant='outline'
                className='mr-2'
                onClick={() => navigate('/ventas/pre-registros')}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={loading || uploading}>
                {(loading || uploading) && (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                )}
                Crear Pre-Registro
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
