import React from 'react'
import { useForm, Controller, SubmitHandler } from 'react-hook-form'
import { Inventario, TipoInventario } from 'shared-types'
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
import { useActualizarInventario } from '../hooks/useActualizarInventario'

interface EditInventoryFormProps {
  inventario: Inventario
  onClose: () => void
  onSuccess?: () => void
}

interface EditInventoryData {
  nombre: string
  descripcion: string
  tipo: TipoInventario
}

export const EditInventoryForm: React.FC<EditInventoryFormProps> = ({
  inventario,
  onClose,
  onSuccess,
}) => {
  const { actualizarInventario, isLoading } = useActualizarInventario()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditInventoryData>({
    defaultValues: {
      nombre: inventario.nombre || '',
      descripcion: inventario.descripcion || '',
      tipo: inventario.tipo || TipoInventario.LOCAL,
    },
  })

  const onSubmit: SubmitHandler<EditInventoryData> = async (data) => {
    const success = await actualizarInventario({
      id: inventario.id!,
      nombre: data.nombre,
      descripcion: data.descripcion,
      tipo: data.tipo,
    })

    if (success) {
      if (onSuccess) {
        onSuccess()
      }
      onClose()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <DialogHeader>
        <DialogTitle>Editar Inventario</DialogTitle>
        <DialogDescription>
          Modifica los detalles del inventario.
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
            }}
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
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </DialogFooter>
    </form>
  )
}

