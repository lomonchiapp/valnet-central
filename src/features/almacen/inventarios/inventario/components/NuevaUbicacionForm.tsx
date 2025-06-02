import { useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { Ubicacion } from '@/types/interfaces/almacen/ubicacion'
import { Loader2, Warehouse } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAlmacenState } from '@/context/global/useAlmacenState'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
import { useUbicaciones } from '../hooks/useUbicaciones'

interface NuevaUbicacionFormValues {
  nombre: string
  idInventario: string
}

interface NuevaUbicacionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUbicacionCreada?: (ubicacionId: string, ubicacionNombre: string) => void
  ubicacionToEdit?: Ubicacion
}

export function NuevaUbicacionForm({
  open,
  onOpenChange,
  onUbicacionCreada,
  ubicacionToEdit,
}: NuevaUbicacionFormProps) {
  const { crearUbicacion, actualizarUbicacion, isLoading, error } =
    useUbicaciones()
  const { inventarios } = useAlmacenState()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<NuevaUbicacionFormValues>({
    defaultValues: {
      nombre: '',
      idInventario: '',
    },
  })

  const selectedInventario = watch('idInventario')

  // Set form values when editing an existing location
  useEffect(() => {
    if (ubicacionToEdit && open) {
      setValue('nombre', ubicacionToEdit.nombre)
      setValue('idInventario', ubicacionToEdit.idInventario)
    } else if (!ubicacionToEdit && open) {
      reset()
    }
  }, [ubicacionToEdit, open, setValue, reset])

  const onSubmit: SubmitHandler<NuevaUbicacionFormValues> = async (data) => {
    if (!data.idInventario) {
      toast.error('Debes seleccionar un inventario')
      return
    }

    // If we're editing an existing location
    if (ubicacionToEdit) {
      const success = await actualizarUbicacion({
        id: ubicacionToEdit.id,
        nombre: data.nombre,
        idInventario: data.idInventario,
      })

      if (success) {
        toast.success(`Ubicación "${data.nombre}" actualizada correctamente`)
        reset()
        onOpenChange(false)

        if (onUbicacionCreada) {
          onUbicacionCreada(ubicacionToEdit.id, data.nombre)
        }
      } else if (error) {
        toast.error(error)
      }
    } else {
      // Creating a new location
      const ubicacion = await crearUbicacion({
        nombre: data.nombre,
        idInventario: data.idInventario,
      })

      if (ubicacion) {
        toast.success(`Ubicación "${data.nombre}" creada correctamente`)
        reset()
        onOpenChange(false)

        if (onUbicacionCreada) {
          onUbicacionCreada(ubicacion.id, ubicacion.nombre)
        }
      } else if (error) {
        toast.error(error)
      }
    }
  }

  const handleDialogClose = () => {
    if (!isLoading) {
      reset()
      onOpenChange(false)
    }
  }

  const isEditMode = !!ubicacionToEdit

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Editar Ubicación' : 'Nueva Ubicación'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Modifica los detalles de la ubicación seleccionada.'
              : 'Crea una nueva ubicación para los artículos en el inventario.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='grid gap-6 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='nombre' className='text-right'>
                Nombre
              </Label>
              <Input
                id='nombre'
                className='col-span-3'
                {...register('nombre', {
                  required: 'El nombre es obligatorio',
                  minLength: {
                    value: 2,
                    message: 'El nombre debe tener al menos 2 caracteres',
                  },
                })}
              />
              {errors.nombre && (
                <p className='text-destructive text-sm col-start-2 col-span-3'>
                  {errors.nombre.message}
                </p>
              )}
            </div>

            <div className='space-y-4'>
              <Label className='text-right'>Seleccionar Inventario</Label>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {inventarios.map((inventario) => (
                  <Card
                    key={inventario.id}
                    className={cn(
                      'p-4 cursor-pointer transition-colors hover:bg-accent',
                      selectedInventario === inventario.id &&
                        'border-primary bg-accent'
                    )}
                    onClick={() => setValue('idInventario', inventario.id)}
                  >
                    <div className='flex items-center space-x-3'>
                      <Warehouse className='h-5 w-5 text-muted-foreground' />
                      <div>
                        <h4 className='font-medium'>{inventario.nombre}</h4>
                        <p className='text-sm text-muted-foreground'>
                          {inventario.descripcion}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              {errors.idInventario && (
                <p className='text-destructive text-sm'>
                  {errors.idInventario.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={handleDialogClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {isEditMode ? 'Actualizar Ubicación' : 'Crear Ubicación'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
