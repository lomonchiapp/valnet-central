import { create } from "zustand";
import { onSnapshot, collection } from "firebase/firestore";
import {database} from "@/firebase";
import { Brigada } from "shared-types/dist/interfaces/coordinacion/brigada";
import { Ticket } from "shared-types/dist/interfaces/coordinacion/ticket";

// Este es el estado global de la aplicación
// En este vamos a almacenar todos los datos
interface CoordinacionState {
    brigadas: Brigada[]
    tickets: Ticket[]
    setBrigadas: (brigadas: Brigada[]) => void
    setTickets: (tickets: Ticket[]) => void
}



export const useCoordinacionState = create<CoordinacionState>()((set) => ({
    brigadas: [],
    tickets: [],
    setBrigadas: (brigadas: Brigada[]) => set({ brigadas }),
    setTickets: (tickets: Ticket[]) => set({ tickets }),
    subscribeToBrigadas: () => {
        const unsubscribe = onSnapshot(collection(database, 'brigadas'), (snapshot) => {
            set({ brigadas: snapshot.docs.map((doc) => doc.data() as Brigada) })
        })
        return unsubscribe
    },
    subscribeToTickets: () => {
        const unsubscribe = onSnapshot(collection(database, 'tickets'), (snapshot) => {
            set({ tickets: snapshot.docs.map((doc) => doc.data() as Ticket) })
        })
        return unsubscribe
    }
}))

