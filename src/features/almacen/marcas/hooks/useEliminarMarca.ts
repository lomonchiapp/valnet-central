import { useState } from 'react'
import { database } from '@/firebase'
import { deleteDoc, doc } from 'firebase/firestore'

export function useEliminarMarca() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const eliminarMarca = async (marcaId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await deleteDoc(doc(database, 'marcas', marcaId))
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido al eliminar la marca'))
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { eliminarMarca, isLoading, error }
} 