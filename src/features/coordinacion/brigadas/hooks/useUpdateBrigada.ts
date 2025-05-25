import { updateDoc, doc } from "firebase/firestore"
import { database } from "@/firebase"
import { toast } from "sonner"
import { NuevaBrigadaFormValues } from "../components/NuevaBrigadaForm"

export function useUpdateBrigada() {
  return async (id: string, values: NuevaBrigadaFormValues) => {
    try {
      await updateDoc(doc(database, "brigadas", id), {
        ...values,
        updatedAt: new Date(),
      })
    } catch (error) {
      //eslint-disable-next-line no-console
      console.error(error)
      toast.error("Error al actualizar la brigada")
    }
  }
} 