import { useState } from 'react'
import { database } from '@/firebase'
import { addDoc, collection, serverTimestamp, updateDoc, doc } from 'firebase/firestore'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function useCrearMarca() {
  const [isLoading, setIsLoading] = useState(false)

  const crearMarca = async (nombre: string): Promise<string | null> => {
    setIsLoading(true)
    try {
      const nombreNormalizado = nombre.trim()
      if (!nombreNormalizado || nombreNormalizado.length < 2) {
        toast.error('El nombre de la marca debe tener al menos 2 caracteres')
        return null
      }

      const docRef = await addDoc(collection(database, 'marcas'), {
        nombre: nombreNormalizado,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      await updateDoc(doc(database, 'marcas', docRef.id), {
        id: docRef.id,
      })

      toast.success(`Marca "${nombreNormalizado}" creada`)
      return docRef.id
    } catch (error) {
      console.error(error)
      toast.error('Error al crear la marca')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { crearMarca, isLoading }
}
