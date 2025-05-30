import { database } from '@/firebase'
import { Usuario, Cliente } from '@/types'
import { InstalacionMikrowisp } from '@/types/interfaces/valnet/instalacionMikrowisp'
import { onSnapshot, collection } from 'firebase/firestore'
import { create } from 'zustand'

// Este es el estado global de la aplicación
// En este vamos a almacenar todos los datos
interface ValnetState {
  clientes: Cliente[]
  instalaciones: InstalacionMikrowisp[]
  users: Usuario[]
  setInstalaciones: (instalaciones: InstalacionMikrowisp[]) => void
  setClientes: (clientes: Cliente[]) => void
  setUsers: (users: Usuario[]) => void
  subscribeToClientes: () => () => void
  subscribeToUsers: () => () => void
  subscribeToInstalaciones: () => () => void
}

export const useValnetState = create<ValnetState>()((set) => ({
  clientes: [],
  users: [],
  instalaciones: [],
  setInstalaciones: (instalaciones: InstalacionMikrowisp[]) =>
    set({ instalaciones }),
  setClientes: (clientes: Cliente[]) => set({ clientes }),
  setUsers: (users: Usuario[]) => set({ users }),
  subscribeToClientes: () => {
    const unsubscribe = onSnapshot(
      collection(database, 'clientes'),
      (snapshot) => {
        set({ clientes: snapshot.docs.map((doc) => doc.data() as Cliente) })
      }
    )
    return unsubscribe
  },
  subscribeToUsers: () => {
    const unsubscribe = onSnapshot(
      collection(database, 'usuarios'),
      (snapshot) => {
        set({ users: snapshot.docs.map((doc) => doc.data() as Usuario) })
      }
    )
    return unsubscribe
  },
  subscribeToInstalaciones: () => {
    // Usar la API en vez de Firestore
    ;(async () => {
      // Importar dinámicamente el hook para evitar problemas de contexto React
      const { useListarInstalaciones } = await import(
        '@/api/hooks/useListarInstalaciones'
      )
      // Crear una instancia temporal del hook para llamar la función listarInstalaciones
      const { listarInstalaciones } = useListarInstalaciones()
      const result = await listarInstalaciones()
      if (result && result.instalaciones) {
        set({ instalaciones: result.instalaciones })
      }
    })()
    // Retornar función de unsubscribe vacía
    return () => {}
  },
}))
