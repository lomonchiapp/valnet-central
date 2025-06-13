import { useState } from 'react'
import { database } from '@/firebase'
import { doc, deleteDoc } from 'firebase/firestore'

export function useEliminarArticulo() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const eliminarArticulo = async (articuloId: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await deleteDoc(doc(database, 'articulos', articuloId))
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Error al eliminar el artículo')
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { eliminarArticulo, isLoading, error }
} 