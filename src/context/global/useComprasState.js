import { database } from '@/firebase';
import { onSnapshot, collection } from 'firebase/firestore';
import { create } from 'zustand';
export const useComprasState = create()((set) => ({
    pagosUnicos: [],
    pagosRecurrentes: [],
    ordenes: [],
    gastosMenores: [],
    proveedores: [],
    setPagosUnicos: (pagosUnicos) => set({ pagosUnicos }),
    setPagosRecurrentes: (pagos) => set({ pagosRecurrentes: pagos }),
    setOrdenes: (ordenes) => set({ ordenes }),
    setGastosMenores: (gastos) => set({ gastosMenores: gastos }),
    setProveedores: (proveedores) => set({ proveedores }),
    subscribeToPagosUnicos: () => {
        const unsubscribe = onSnapshot(collection(database, 'pagosUnicos'), (snapshot) => {
            set({
                pagosUnicos: snapshot.docs.map((doc) => doc.data()),
            });
        });
        return unsubscribe;
    },
    subscribeToPagosRecurrentes: () => {
        const unsubscribe = onSnapshot(collection(database, 'pagosRecurrentes'), (snapshot) => {
            set({
                pagosRecurrentes: snapshot.docs.map((doc) => doc.data()),
            });
        });
        return unsubscribe;
    },
    subscribeToOrdenes: () => {
        const unsubscribe = onSnapshot(collection(database, 'ordenes'), (snapshot) => {
            set({ ordenes: snapshot.docs.map((doc) => doc.data()) });
        });
        return unsubscribe;
    },
    subscribeToGastosMenores: () => {
        const unsubscribe = onSnapshot(collection(database, 'gastosMenores'), (snapshot) => {
            set({
                gastosMenores: snapshot.docs.map((doc) => doc.data()),
            });
        });
        return unsubscribe;
    },
    subscribeToProveedores: () => {
        const unsubscribe = onSnapshot(collection(database, 'proveedores'), (snapshot) => {
            set({
                proveedores: snapshot.docs.map((doc) => doc.data()),
            });
        });
        return unsubscribe;
    },
}));
