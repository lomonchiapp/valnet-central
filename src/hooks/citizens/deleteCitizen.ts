import { deleteDoc, doc } from "firebase/firestore"
import {database} from "@/firebase"
import { Citizen } from "@/types/interfaces/valnet/cliente"

export const deleteCitizen = async (citizen: Citizen) => {
    const citizenRef = doc(database, "citizens", citizen.id)
    await deleteDoc(citizenRef)
}