import { Service } from '@/types'
import { database } from '@/firebase'
import { doc, updateDoc } from 'firebase/firestore'

export const updateService = async (service: Service) => {
  try {
    const serviceRef = doc(database, 'services', service.id)
    
    // Solo actualiza los campos necesarios
    const serviceData = {
      name: service.name,
      category: service.category,
      description: service.description,
      // Agrega otros campos que necesites actualizar
      updatedAt: new Date().toISOString() // Actualiza la fecha de modificación
    }

    await updateDoc(serviceRef, serviceData)
    return { success: true }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error al actualizar el servicio:", error)
    return { success: false, error }
  }
}