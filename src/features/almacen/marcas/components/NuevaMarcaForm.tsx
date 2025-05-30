import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { database } from '@/firebase'
import { Marca } from '@/types'
import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  doc,
} from 'firebase/firestore'
// Asumiendo que tienes un tipo Marca definido
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose, // Para cerrar el diálogo
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface NuevaMarcaFormValues {
  nombre: string
}

interface NuevaMarcaFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onMarcaCreada?: (marca: Marca) => void
}

export function NuevaMarcaForm({
  open,
  onOpenChange,
  onMarcaCreada,
}: NuevaMarcaFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NuevaMarcaFormValues>()

  const onSubmit: SubmitHandler<NuevaMarcaFormValues> = async (data) => {
    setIsLoading(true)
    try {
      const nombreMarcaNormalizado = data.nombre.trim()
      // Opcional: Verificar si la marca ya existe para evitar duplicados exactos (case-insensitive)
      // Esto requeriría una consulta a Firestore antes de agregar.

      const docRef = await addDoc(collection(database, 'marcas'), {
        nombre: nombreMarcaNormalizado,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Considera si necesitas más campos por defecto para una marca
        // No incluir el id aquí, se añadirá con updateDoc
      })

      // Actualizar el documento recién creado para incluir su propio ID
      await updateDoc(doc(database, 'marcas', docRef.id), {
        id: docRef.id,
      })

      const nuevaMarca: Omit<Marca, 'createdAt' | 'updatedAt'> & {
        createdAt?: unknown
        updatedAt?: unknown
        id?: string
      } = {
        id: docRef.id, // El ID ya está aquí
        nombre: nombreMarcaNormalizado,
        // createdAt y updatedAt serán establecidos por Firestore y actualizados por la suscripción global.
      }

      toast.success(`Marca "${nombreMarcaNormalizado}" creada exitosamente.`)
      if (onMarcaCreada) {
        onMarcaCreada(nuevaMarca as Marca) // Hacemos un type assertion aquí
      }
      reset()
      onOpenChange(false)
    } catch {
      toast.error('Error al crear la marca. Intente nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDialogClose = () => {
    if (!isLoading) {
      reset()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Crear Nueva Marca</DialogTitle>
          <DialogDescription>
            Ingrese el nombre de la nueva marca para agregarla al sistema.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 py-2'>
          <div>
            <Label htmlFor='nombreMarca' className='text-right'>
              Nombre de la Marca <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='nombreMarca'
              placeholder='Ej: Huawei, TP-Link, Cisco'
              {...register('nombre', {
                required: 'El nombre de la marca es obligatorio.',
                minLength: { value: 2, message: 'Mínimo 2 caracteres.' },
                pattern: {
                  value: /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ .,'&()-]+$/, // Permitir más caracteres si es necesario
                  message: 'Nombre de marca inválido.',
                },
              })}
              className={errors.nombre ? 'border-destructive' : ''}
              disabled={isLoading}
            />
            {errors.nombre && (
              <p className='text-xs text-destructive mt-1'>
                {errors.nombre.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type='button' variant='outline' disabled={isLoading}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Marca'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Ejemplo de tipo Marca (asegúrate que coincida con el de tu proyecto en @/types)
// export interface Marca {
//   id: string;
//   nombre: string;
//   createdAt?: any; // O firebase.firestore.Timestamp;
//   updatedAt?: any; // O firebase.firestore.Timestamp;
//   // otros campos que puedas tener
// }
