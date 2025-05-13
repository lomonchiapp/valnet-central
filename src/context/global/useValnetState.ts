import { create } from "zustand";
import { onSnapshot, collection } from "firebase/firestore";
import {database} from "@/firebase";
import type { Cliente, Usuario } from "shared-types"

// Este es el estado global de la aplicación
// En este vamos a almacenar todos los datos
interface ValnetState {
    clientes: Cliente[]
    usuarios: Usuario[]
    setClientes: (clientes: Cliente[]) => void
    setUsuarios: (usuarios: Usuario[]) => void
    subscribeToClientes: () => () => void
    subscribeToUsuarios: () => () => void
}



export const useValnetState = create<ValnetState>()((set) => ({
    clientes: [],
    usuarios: [],
    setClientes: (clientes: Cliente[]) => set({ clientes }),
    setUsuarios: (usuarios: Usuario[]) => set({ usuarios }),
    subscribeToClientes: () => {
        const unsubscribe = onSnapshot(collection(database, 'clientes'), (snapshot) => {
            set({ clientes: snapshot.docs.map((doc) => doc.data() as Cliente) })
        })
        return unsubscribe
    },
    subscribeToUsuarios: () => {
        const unsubscribe = onSnapshot(collection(database, 'usuarios'), (snapshot) => {
            set({ usuarios: snapshot.docs.map((doc) => doc.data() as Usuario) })
        })
        return unsubscribe
    }
}))

