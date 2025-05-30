import { database } from '@/firebase';
import { onSnapshot, collection } from 'firebase/firestore';
import { create } from 'zustand';
export const useValnetState = create()((set) => ({
    clientes: [],
    users: [],
    instalaciones: [],
    setInstalaciones: (instalaciones) => set({ instalaciones }),
    setClientes: (clientes) => set({ clientes }),
    setUsers: (users) => set({ users }),
    subscribeToClientes: () => {
        const unsubscribe = onSnapshot(collection(database, 'clientes'), (snapshot) => {
            set({ clientes: snapshot.docs.map((doc) => doc.data()) });
        });
        return unsubscribe;
    },
    subscribeToUsers: () => {
        const unsubscribe = onSnapshot(collection(database, 'usuarios'), (snapshot) => {
            set({ users: snapshot.docs.map((doc) => doc.data()) });
        });
        return unsubscribe;
    },
    subscribeToInstalaciones: () => {
        // Usar la API en vez de Firestore
        ;
        (async () => {
            // Importar dinámicamente el hook para evitar problemas de contexto React
            const { useListarInstalaciones } = await import('@/api/hooks/useListarInstalaciones');
            // Crear una instancia temporal del hook para llamar la función listarInstalaciones
            const { listarInstalaciones } = useListarInstalaciones();
            const result = await listarInstalaciones();
            if (result && result.instalaciones) {
                set({ instalaciones: result.instalaciones });
            }
        })();
        // Retornar función de unsubscribe vacía
        return () => { };
    },
}));
