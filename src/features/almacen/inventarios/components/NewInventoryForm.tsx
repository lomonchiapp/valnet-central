import React from 'react'
import { useForm, Controller, SubmitHandler } from 'react-hook-form'
import { Inventario, TipoArticulo, TipoInventario } from 'shared-types'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useNewInventory, NewInventoryData } from '../hooks/useNewInventory'

// Asumiendo que usas sonner para notificaciones

interface NewInventoryFormProps {
  onClose: () => void
  onSuccess?: (newInventoryId: string) => void // Callback opcional en caso de éxito
}

export const NewInventoryForm: React.FC<NewInventoryFormProps> = ({
  onClose,
  onSuccess,
}) => {
  const { createInventory, isLoading, error } = useNewInventory()
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewInventoryData>({
    defaultValues: {
      nombre: '',
      descripcion: '',
      tipo: undefined, // o TipoInventario.LOCAL si quieres un default
    },
  })

  const onSubmit: SubmitHandler<NewInventoryData> = async (data) => {
    // Asegurarse de que el tipo es uno de los valores del enum TipoInventario
    if (!Object.values(TipoArticulo).includes(data.tipo as TipoArticulo)) {
      toast.error('Tipo de inventario inválido')
      return
    }

    const newInventoryId = await createInventory(data as unknown as Inventario)
    if (newInventoryId) {
      toast.success('Inventario creado exitosamente!')
      reset() // Limpia el formulario
      if (onSuccess) {
        onSuccess(newInventoryId)
      }
      onClose() // Cierra el modal
    } else {
      toast.error('Error al crear el inventario. ' + (error?.message || ''))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <DialogHeader>
        <DialogTitle>Crear Nuevo Inventario</DialogTitle>
        <DialogDescription>
          Completa los detalles para registrar un nuevo inventario. Si es el
          primero, considera nombrarlo "Inventario Principal" y tipo "Local".
        </DialogDescription>
      </DialogHeader>

      <div className='grid gap-4 py-2'>
        {/* Nombre del Inventario */}
        <div className='grid grid-cols-4 items-center gap-4'>
          <Label htmlFor='nombre' className='text-right col-span-1'>
            Nombre
          </Label>
          <Controller
            name='nombre'
            control={control}
            rules={{ required: 'El nombre es obligatorio' }}
            render={({ field }) => (
              <Input
                id='nombre'
                {...field}
                placeholder='Ej: Inventario Principal'
                className='col-span-3'
              />
            )}
          />
        </div>
        {errors.nombre && (
          <p className='text-red-500 text-xs col-start-2 col-span-3'>
            {errors.nombre.message}
          </p>
        )}

        {/* Tipo de Inventario */}
        <div className='grid grid-cols-4 items-center gap-4'>
          <Label htmlFor='tipo' className='text-right col-span-1'>
            Tipo
          </Label>
          <Controller
            name='tipo'
            control={control}
            rules={{ required: 'El tipo es obligatorio' }}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <SelectTrigger className='col-span-3'>
                  <SelectValue placeholder='Selecciona un tipo' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TipoInventario.LOCAL}>
                    Local (Ej: Principal, Cocina, Almacén)
                  </SelectItem>
                  <SelectItem value={TipoInventario.BRIGADA}>
                    Brigada
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        {errors.tipo && (
          <p className='text-red-500 text-xs col-start-2 col-span-3'>
            {errors.tipo.message}
          </p>
        )}

        {/* Descripción del Inventario */}
        <div className='grid grid-cols-4 items-start gap-4'>
          {' '}
          {/* items-start para Textarea */}
          <Label htmlFor='descripcion' className='text-right col-span-1 pt-2'>
            Descripción
          </Label>
          <Controller
            name='descripcion'
            control={control}
            rules={{
              maxLength: {
                value: 500,
                message: 'La descripción no puede exceder los 500 caracteres',
              },
            }} // Ejemplo de otra regla
            render={({ field }) => (
              <Textarea
                id='descripcion'
                {...field}
                placeholder='Opcional: Breve descripción del propósito del inventario'
                className='col-span-3 min-h-[80px]'
              />
            )}
          />
        </div>
        {errors.descripcion && (
          <p className='text-red-500 text-xs col-start-2 col-span-3'>
            {errors.descripcion.message}
          </p>
        )}
      </div>

      <DialogFooter>
        <Button
          type='button'
          variant='outline'
          onClick={onClose}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type='submit' disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar Inventario'}
        </Button>
      </DialogFooter>
    </form>
  )
}
