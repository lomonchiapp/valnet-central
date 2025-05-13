import { addDoc, collection, updateDoc } from "firebase/firestore"
import {database} from "@/firebase"
import { Service } from "@/types"

export const newService = async (service: Service) => {
    try {
        const serviceRef = collection(database, "services")
        
        const docRef = await addDoc(serviceRef, service)
        await updateDoc(docRef, { id: docRef.id })
        return docRef.id
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error al crear servicio:", error)
        throw error
    }
}