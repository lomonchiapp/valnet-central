import { database } from '@/firebase';
import { onSnapshot, collection } from 'firebase/firestore';
import { create } from 'zustand';
export const useVentasState = create()((set) => ({
    preRegistros: [],
    setPreRegistros: (preRegistros) => set({ preRegistros }),
    subscribeToPreRegistros: () => {
        const unsubscribe = onSnapshot(collection(database, 'preRegistros'), (snapshot) => {
            set({
                preRegistros: snapshot.docs.map((doc) => doc.data()),
            });
        });
        return unsubscribe;
    },
}));
