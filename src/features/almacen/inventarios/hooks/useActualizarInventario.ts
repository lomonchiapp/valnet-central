import { useState } from 'react'
import { database } from '@/firebase'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { Inventario } from 'shared-types'
import { toast } from 'sonner'

interface ActualizarInventarioParams {
  id: string
  nombre?: string
  descripcion?: string
  tipo?: string
}

export function useActualizarInventario() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const actualizarInventario = async (
    data: ActualizarInventarioParams
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const { id, ...updateData } = data
      const inventarioRef = doc(database, 'inventarios', id)

      await updateDoc(inventarioRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      })

      toast.success('Inventario actualizado exitosamente')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Error desconocido al actualizar el inventario')
      setError(errorMessage)
      toast.error('Error al actualizar el inventario')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { actualizarInventario, isLoading, error }
}

