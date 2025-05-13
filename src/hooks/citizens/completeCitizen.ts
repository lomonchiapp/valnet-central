import { doc, updateDoc } from "firebase/firestore"
import { database } from "@/firebase"
import { Citizen } from "@/types/interfaces/valnet/cliente"

const isCompleteInfo = (citizen: Partial<Citizen>) => {
  return !!(
    citizen.firstName &&
    citizen.lastName &&
    citizen.cedula &&
    citizen.email &&
    citizen.phone &&
    citizen.address
  )
}

export const completeCitizen = async (citizen: Partial<Citizen>) => {
  try {
    const citizenRef = doc(database, "citizens", citizen.id!)
    const updateData = {
      ...citizen,
      pendingInfo: !isCompleteInfo(citizen),
      updatedAt: new Date().toISOString()
    }
    
    await updateDoc(citizenRef, updateData)
    return true
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error al completar ciudadano:", error)
    throw error
  }
} 