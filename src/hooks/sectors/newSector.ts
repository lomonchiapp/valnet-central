import { addDoc, collection, updateDoc } from "firebase/firestore"
import {database} from "@/firebase"
import { Sector } from "@/types/interfaces/sector"

export const newSector = async (sector: Sector) => {
    try {
        const sectorRef = collection(database, "sectors")
        const docRef = await addDoc(sectorRef, sector)
        await updateDoc(docRef, { id: docRef.id })
        return docRef.id
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error al crear servicio:", error)
        throw error
    }
}

