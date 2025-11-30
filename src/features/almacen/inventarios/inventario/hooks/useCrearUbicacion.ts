import { useState } from 'react'
import { database } from '@/firebase'
import { addDoc, collection, serverTimestamp, updateDoc, doc } from 'firebase/firestore'
import { toast } from 'sonner'

export function useCrearUbicacion() {
  const [isLoading, setIsLoading] = useState(false)

  const crearUbicacion = async (nombre: string, inventarioId: string): Promise<string | null> => {
    setIsLoading(true)
    try {
      const nombreNormalizado = nombre.trim()
      if (!nombreNormalizado || nombreNormalizado.length < 2) {
        toast.error('El nombre de la ubicación debe tener al menos 2 caracteres')
        return null
      }

      const docRef = await addDoc(collection(database, 'ubicaciones'), {
        nombre: nombreNormalizado,
        idInventario: inventarioId || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      await updateDoc(doc(database, 'ubicaciones', docRef.id), {
        id: docRef.id,
      })

      toast.success(`Ubicación "${nombreNormalizado}" creada`)
      return docRef.id
    } catch (error) {
      console.error(error)
      toast.error('Error al crear la ubicación')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { crearUbicacion, isLoading }
}

