import { database } from '@/firebase'
import { addDoc, collection, updateDoc } from 'firebase/firestore'
import { toast } from 'sonner'
import { NuevaBrigadaFormValues } from '../components/NuevaBrigadaForm'

export function useCrearBrigada() {
  return async (values: NuevaBrigadaFormValues) => {
    try {
      const newBrigada = {
        ...values,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const docRef = await addDoc(collection(database, 'brigadas'), newBrigada)
      await updateDoc(docRef, { id: docRef.id })
      return { ...newBrigada, id: docRef.id }
    } catch (error) {
       
      console.error(error)
      toast.error('Error al crear la brigada')
      return null
    }
  }
}
