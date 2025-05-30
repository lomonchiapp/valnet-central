import { useState, useEffect } from 'react'
import { database as db } from '@/firebase'
import { PreRegistro } from '@/types/interfaces/ventas/preRegistro'
import { collection, getDocs } from 'firebase/firestore'
import { Loader2, List, LayoutGrid, MapPin, Navigation } from 'lucide-react'
import { usePreRegistro } from '@/api/hooks/usePreRegistro'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import ImageModal from '@/features/ventas/components/ImageModal'

// Tipo más específico para los datos de fecha
type DateValue = string | Date | { toDate: () => Date } | null | undefined

export default function PreRegistros() {
  const { loading, error: apiError } = usePreRegistro()
  const [preRegistros, setPreRegistros] = useState<PreRegistro[]>([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [view, setView] = useState<'list' | 'thumbnails'>('list')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const cargarPreRegistros = async () => {
      try {
        // Obtener todos los pre-registros de Firestore
        const snapshot = await getDocs(collection(db, 'preRegistros'))
        const data: PreRegistro[] = []
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as PreRegistro)
        })
        if (isMounted) {
          setPreRegistros(data)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Error desconocido'))
        }
      } finally {
        if (isMounted) {
          setFetching(false)
        }
      }
    }
    cargarPreRegistros()
    return () => {
      isMounted = false
    }
  }, [])

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return (
          <Badge
            variant='outline'
            className='bg-yellow-50 text-yellow-700 border-yellow-300'
          >
            Pendiente
          </Badge>
        )
      case 'aprobado':
        return (
          <Badge
            variant='outline'
            className='bg-green-50 text-green-700 border-green-300'
          >
            Aprobado
          </Badge>
        )
      case 'rechazado':
        return (
          <Badge
            variant='outline'
            className='bg-red-50 text-red-700 border-red-300'
          >
            Rechazado
          </Badge>
        )
      case 'instalado':
        return (
          <Badge
            variant='outline'
            className='bg-blue-50 text-blue-700 border-blue-300'
          >
            Instalado
          </Badge>
        )
      default:
        return <Badge variant='outline'>Desconocido</Badge>
    }
  }

  const formatDate = (dateValue: DateValue) => {
    if (!dateValue) return 'N/A'
    try {
      if (dateValue && typeof dateValue === 'object' && 'toDate' in dateValue) {
        return new Intl.DateTimeFormat('es-DO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(dateValue.toDate())
      }
      if (typeof dateValue === 'string') {
        return new Intl.DateTimeFormat('es-DO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(new Date(dateValue))
      }
      if (dateValue instanceof Date) {
        return new Intl.DateTimeFormat('es-DO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(dateValue)
      }
      return 'N/A'
    } catch {
      return 'N/A'
    }
  }

  if (fetching || loading) {
    return (
      <div className='flex justify-center items-center h-60'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    )
  }

  if (error || apiError) {
    return (
      <div className='text-center p-6 text-destructive'>
        <p>Error al cargar los pre-registros. Por favor, intenta de nuevo.</p>
      </div>
    )
  }

  if (preRegistros.length === 0) {
    return (
      <div className='text-center p-10'>
        <h3 className='text-lg font-semibold mb-2'>No hay pre-registros</h3>
        <p className='text-muted-foreground mb-6'>
          No se han encontrado pre-registros en la base de datos.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className='flex justify-end mb-4 gap-2'>
        <Button
          variant={view === 'list' ? 'default' : 'outline'}
          onClick={() => setView('list')}
          size='icon'
          title='Vista de lista'
        >
          <List className='h-5 w-5' />
        </Button>
        <Button
          variant={view === 'thumbnails' ? 'default' : 'outline'}
          onClick={() => setView('thumbnails')}
          size='icon'
          title='Vista de thumbnails'
        >
          <LayoutGrid className='h-5 w-5' />
        </Button>
      </div>
      {view === 'list' ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Cédula</TableHead>
              <TableHead>Fecha Creación</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fotos Contrato</TableHead>
              <TableHead>Ubicación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preRegistros.map((preRegistro) => (
              <TableRow key={preRegistro.id}>
                <TableCell className='font-medium'>
                  {preRegistro.cliente}
                </TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='link'
                        className='p-0 h-auto min-w-0 text-blue-700 underline'
                      >
                        {preRegistro.cedula}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto max-w-xs'>
                      <div className='flex flex-col items-center gap-2'>
                        {preRegistro.fotosCedula &&
                        preRegistro.fotosCedula.length > 0 ? (
                          preRegistro.fotosCedula.map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt={`Cédula ${idx === 0 ? 'frontal' : 'trasera'}`}
                              className='h-32 w-auto object-contain rounded border'
                            />
                          ))
                        ) : (
                          <span className='text-xs text-muted-foreground'>
                            Sin imágenes de cédula
                          </span>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>{formatDate(preRegistro.createdAt)}</TableCell>
                <TableCell>
                  {getEstadoBadge(preRegistro.estado || 'pendiente')}
                </TableCell>
                <TableCell>
                  <div className='flex gap-2 items-center'>
                    {preRegistro.fotoContrato?.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Contrato ${idx + 1}`}
                        className='h-12 w-12 object-cover rounded cursor-pointer border'
                        onClick={() => setSelectedImage(url)}
                      />
                    ))}
                    <input
                      type='file'
                      accept='image/*'
                      multiple
                      style={{ display: 'none' }}
                      id={`upload-contrato-${preRegistro.id}`}
                      onChange={async (e) => {
                        const files = e.target.files
                        if (!files || files.length === 0) return
                        // Subir imágenes a storage y actualizar el preRegistro
                        // Aquí deberías implementar la lógica de subida y obtener las URLs
                        // Por ahora, solo simulo la actualización con un array vacío
                        // await updatePreRegistro(preRegistro.id, { fotoContrato: nuevasUrls });
                      }}
                    />
                    <label
                      htmlFor={`upload-contrato-${preRegistro.id}`}
                      className='cursor-pointer px-2 py-1 bg-gray-100 rounded border text-xs hover:bg-gray-200'
                    >
                      + Agregar
                    </label>
                  </div>
                </TableCell>
                <TableCell>
                  {preRegistro.ubicacion &&
                  preRegistro.ubicacion.lat &&
                  preRegistro.ubicacion.lng ? (
                    <div className='flex gap-2'>
                      <Button
                        variant='ghost'
                        size='icon'
                        asChild
                        title='Ver en Google Maps'
                      >
                        <a
                          href={`https://www.google.com/maps?q=${preRegistro.ubicacion.lat},${preRegistro.ubicacion.lng}`}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          <MapPin className='h-5 w-5 text-blue-600' />
                        </a>
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        asChild
                        title='Cómo llegar'
                      >
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${preRegistro.ubicacion.lat},${preRegistro.ubicacion.lng}`}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          <Navigation className='h-5 w-5 text-green-600' />
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <span className='text-xs text-muted-foreground'>
                      Sin ubicación
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {preRegistros.map((preRegistro) => (
            <div
              key={preRegistro.id}
              className='bg-white rounded shadow p-4 flex flex-col gap-2'
            >
              <div className='font-semibold text-base mb-1'>
                {preRegistro.cliente}
              </div>
              <div className='text-xs text-muted-foreground mb-1'>
                Cédula: {preRegistro.cedula}
              </div>
              <div className='text-xs mb-1'>
                Estado: {getEstadoBadge(preRegistro.estado || 'pendiente')}
              </div>
              <div className='flex gap-2 mb-2'>
                {preRegistro.fotoContrato?.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Contrato ${idx + 1}`}
                    className='h-16 w-16 object-cover rounded cursor-pointer border'
                    onClick={() => setSelectedImage(url)}
                  />
                ))}
              </div>
              <div className='text-xs text-muted-foreground'>
                Creado: {formatDate(preRegistro.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}
      <ImageModal
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
      <div className='text-sm text-muted-foreground mt-4'>
        Mostrando {preRegistros.length} pre-registros
      </div>
    </div>
  )
}
