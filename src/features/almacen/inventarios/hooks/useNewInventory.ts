import { useState } from 'react'
import { database } from '@/firebase'
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from 'firebase/firestore'
// Asumiendo que db se exporta desde aquí
import { Inventario, TipoArticulo, Unidad } from '@/types'

export interface NewInventoryData {
  nombre: string
  descripcion: string
  tipo: TipoArticulo
  cantidad: number
  unidad: Unidad
}

export const useNewInventory = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createInventory = async (data: Inventario): Promise<string | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const docRef = await addDoc(collection(database, 'inventarios'), {
        ...data,
        // Campos de BaseModel que se pueden añadir desde el cliente
        // Para 'id', Firestore lo genera automáticamente.
        // 'createdAt' y 'updatedAt' pueden ser manejados por serverTimestamp
        // o podrías tener reglas de seguridad/funciones de backend que los establezcan.
        // Si necesitas compatibilidad total con BaseModel desde el cliente:
        // uid: '', // Deberías obtener el uid del usuario si es relevante
        // createdBy: '', // ID del usuario creador
        // updatedBy: '', // ID del usuario que actualiza
        // isDeleted: false,
        // deletedAt: null,
        // deletedBy: null,
        createdAt: serverTimestamp(), // Para que Firestore ponga la fecha del servidor
        updatedAt: serverTimestamp(), // Para que Firestore ponga la fecha del servidor
      })
      setIsLoading(false)
      //Actualizar documento con su id
      await updateDoc(doc(database, 'inventarios', docRef.id), {
        id: docRef.id,
      })
      return docRef.id // Retorna el ID del nuevo documento
    } catch (e) {
      setError(e as Error)
      setIsLoading(false)
      //eslint-disable-next-line no-console
      console.error('Error adding document: ', e)
      return null
    }
  }

  return { createInventory, isLoading, error }
}
