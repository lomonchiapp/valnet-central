import { database } from '@/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { Sector } from '@/types/interfaces/sector'

export const updateSector = async (sector: Sector) => {
  try {
    const sectorRef = doc(database, 'sectors', sector.id)
    
    const sectorData = {
      name: sector.name,
      updatedAt: new Date().toISOString()
    }

    await updateDoc(sectorRef, sectorData)
    return { success: true }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error al actualizar el sector:", error)
    return { success: false, error }
  }
}