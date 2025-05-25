import { create } from "zustand";
import { Brigada, Ticket, Prioridad } from "@/types";
import type { TicketMikrowisp } from "@/types/interfaces/coordinacion/ticket";
import { collection } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { database } from "@/firebase";
import { ControlCombustible } from "@/types/interfaces/coordinacion/controlCombustible";

// Este es el estado global de la aplicación
// En este vamos a almacenar todos los datos
interface CoordinacionState {
    brigadas: Brigada[]
    tickets: Ticket[]
    controlCombustible: ControlCombustible[]
    setBrigadas: (brigadas: Brigada[]) => void
    setTickets: (tickets: Ticket[]) => void
    setControlCombustible: (controlCombustible: ControlCombustible[]) => void
    subscribeToBrigadas: () => () => void
    subscribeToControlCombustible: () => () => void
    fetchTicketsFromApi: (idClientes: (number | string)[]) => Promise<void>
}

const BRIGADA_DEFAULT: Brigada = {
    id: '',
    nombre: '',
    matricula: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    // inventarioId: '', // opcional
    // coordenadas: { lat: 0, ln g: 0 }, // opcional
};

export const useCoordinacionState = create<CoordinacionState>()((set) => ({
    brigadas: [],
    tickets: [],
    controlCombustible: [],
    setBrigadas: (brigadas: Brigada[]) => set({ brigadas }),
    setTickets: (tickets: Ticket[]) => set({ tickets }),
    setControlCombustible: (controlCombustible: ControlCombustible[]) => set({ controlCombustible }),
    subscribeToBrigadas: () => {
        const unsubscribe = onSnapshot(collection(database, 'brigadas'), (snapshot) => {
            set({ brigadas: snapshot.docs.map((doc) => doc.data() as Brigada) })
        })
        return unsubscribe
    },
    subscribeToControlCombustible: () => {
        const unsubscribe = onSnapshot(collection(database, 'control_combustible'), (snapshot) => {
            set({ controlCombustible: snapshot.docs.map((doc) => doc.data() as ControlCombustible) })
        })
        return unsubscribe
    },
    fetchTicketsFromApi: async (idClientes: (number | string)[]) => {
        const { listarTicketsService } = await import('@/api/lib/ticketService');
        const result = await listarTicketsService({ idClientes });
        if (result && result.tickets) {
            // Mapear los tickets para cumplir con la interfaz Ticket
            const mappedTickets: Ticket[] = result.tickets.map((t: TicketMikrowisp) => ({
                ...t,
                brigada: BRIGADA_DEFAULT,
                prioridad: Prioridad.MEDIA,
                createdAt: new Date(),
                updatedAt: new Date(),
            }));
            set({ tickets: mappedTickets });
        }
    }
}))

