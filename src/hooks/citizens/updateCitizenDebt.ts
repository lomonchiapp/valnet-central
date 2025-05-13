import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { database } from '@/firebase'

export const updateCitizenDebt = async (citizenId: string, additionalDebt: number) => {
  try {
    const citizenRef = doc(database, 'citizens', citizenId)
    const citizenSnap = await getDoc(citizenRef)

    if (citizenSnap.exists()) {
      const currentDebt = citizenSnap.data().debt || 0
      const newDebt = currentDebt + additionalDebt

      await updateDoc(citizenRef, {
        debt: newDebt,
        isDebtor: newDebt > 0,
        updatedAt: new Date().toISOString()
      })
    }
  } catch (error) {
    throw new Error(`Error al actualizar deuda: ${error instanceof Error ? error.message : 'Error desconocido'}`)
  }
} 