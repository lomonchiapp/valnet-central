import { database } from '@/firebase'
import { onSnapshot, collection } from 'firebase/firestore'
import type { PreRegistro } from 'shared-types'
import { create } from 'zustand'

// Este es el estado global de la aplicación
// En este vamos a almacenar todos los datos
interface VentasState {
  preRegistros: PreRegistro[]
  setPreRegistros: (preRegistros: PreRegistro[]) => void
  subscribeToPreRegistros: () => () => void
}

export const useVentasState = create<VentasState>()((set) => ({
  preRegistros: [],
  setPreRegistros: (preRegistros: PreRegistro[]) => set({ preRegistros }),
  subscribeToPreRegistros: () => {
    const unsubscribe = onSnapshot(
      collection(database, 'preRegistros'),
      (snapshot) => {
        set({
          preRegistros: snapshot.docs.map((doc) => doc.data() as PreRegistro),
        })
      }
    )
    return unsubscribe
  },
}))
