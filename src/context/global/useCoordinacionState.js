import { database } from '@/firebase';
import { collection } from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import { create } from 'zustand';
export const useCoordinacionState = create()((set) => ({
    brigadas: [],
    tickets: [],
    controlCombustible: [],
    setBrigadas: (brigadas) => set({ brigadas }),
    setTickets: (tickets) => set({ tickets }),
    setControlCombustible: (controlCombustible) => set({ controlCombustible }),
    subscribeToBrigadas: () => {
        const unsubscribe = onSnapshot(collection(database, 'brigadas'), (snapshot) => {
            set({ brigadas: snapshot.docs.map((doc) => doc.data()) });
        });
        return unsubscribe;
    },
    subscribeToControlCombustible: () => {
        const unsubscribe = onSnapshot(collection(database, 'control_combustible'), (snapshot) => {
            set({
                controlCombustible: snapshot.docs.map((doc) => doc.data()),
            });
        });
        return unsubscribe;
    },
    subscribeToTickets: () => {
        const unsubscribe = onSnapshot(collection(database, 'tickets'), (snapshot) => {
            set({ tickets: snapshot.docs.map((doc) => doc.data()) });
        });
        return unsubscribe;
    },
}));
