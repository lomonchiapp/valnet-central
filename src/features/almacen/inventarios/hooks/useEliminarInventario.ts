import { useState } from 'react'
import { database } from '@/firebase'
import { doc, deleteDoc } from 'firebase/firestore'
import { toast } from 'sonner'

export function useEliminarInventario() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const eliminarInventario = async (inventarioId: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      await deleteDoc(doc(database, 'inventarios', inventarioId))
      toast.success('Inventario eliminado exitosamente')
      return true
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al eliminar el inventario'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { eliminarInventario, isLoading, error }
}

