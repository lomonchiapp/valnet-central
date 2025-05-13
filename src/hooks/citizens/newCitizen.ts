import { addDoc, collection, updateDoc } from "firebase/firestore"
import {database} from "@/firebase"
import { Citizen } from "@/types/interfaces/valnet/cliente"
import { generateCitizenCode } from "@/lib/utils"

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

export const newCitizen = async (citizen: Partial<Citizen>, isPartialForm = false) => {
    try {
        const citizenRef = collection(database, "citizens")
        
        // Convertir las fechas a timestamp
        const citizenData = {
            firstName: citizen.firstName || "",
            lastName: citizen.lastName || "",
            cedula: citizen.cedula || "",
            email: citizen.email || "",
            phone: citizen.phone || "",
            address: citizen.address || "",
            city: citizen.city || "",
            photoUrl: citizen.photoUrl || "",
            lat: Number(citizen.lat) || 0,
            lng: Number(citizen.lng) || 0,
            pendingInfo: isPartialForm || !isCompleteInfo(citizen),
            isDebtor: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
        
        const docRef = await addDoc(citizenRef, citizenData)
        await updateDoc(docRef, { id: docRef.id, citizenCode: generateCitizenCode(new Date(), docRef.id).toUpperCase() })
        return docRef.id
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error al crear ciudadano:", error)
        throw error
    }
}