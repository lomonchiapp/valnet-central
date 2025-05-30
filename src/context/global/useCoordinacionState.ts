import { database } from '@/firebase'
import { Brigada, Ticket } from '@/types'
import { ControlCombustible } from '@/types/interfaces/coordinacion/controlCombustible'
import { collection } from 'firebase/firestore'
import { onSnapshot } from 'firebase/firestore'
import { create } from 'zustand'

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
  subscribeToTickets: () => () => void
}

export const useCoordinacionState = create<CoordinacionState>()((set) => ({
  brigadas: [],
  tickets: [],
  controlCombustible: [],
  setBrigadas: (brigadas: Brigada[]) => set({ brigadas }),
  setTickets: (tickets: Ticket[]) => set({ tickets }),
  setControlCombustible: (controlCombustible: ControlCombustible[]) =>
    set({ controlCombustible }),
  subscribeToBrigadas: () => {
    const unsubscribe = onSnapshot(
      collection(database, 'brigadas'),
      (snapshot) => {
        set({ brigadas: snapshot.docs.map((doc) => doc.data() as Brigada) })
      }
    )
    return unsubscribe
  },
  subscribeToControlCombustible: () => {
    const unsubscribe = onSnapshot(
      collection(database, 'control_combustible'),
      (snapshot) => {
        set({
          controlCombustible: snapshot.docs.map(
            (doc) => doc.data() as ControlCombustible
          ),
        })
      }
    )
    return unsubscribe
  },
  subscribeToTickets: () => {
    const unsubscribe = onSnapshot(
      collection(database, 'tickets'),
      (snapshot) => {
        set({ tickets: snapshot.docs.map((doc) => doc.data() as Ticket) })
      }
    )
    return unsubscribe
  },
}))
