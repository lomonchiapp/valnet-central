import { database } from '@/firebase';
import { onSnapshot, collection } from 'firebase/firestore';
import { create } from 'zustand';
export const useAlmacenState = create()((set) => ({
    inventarios: [],
    articulos: [],
    movimientos: [],
    marcas: [],
    ubicaciones: [],
    proveedores: [],
    setArticulos: (articulos) => set({ articulos }),
    setInventarios: (inventarios) => set({ inventarios }),
    setMovimientos: (movimientos) => set({ movimientos }),
    setUbicaciones: (ubicaciones) => set({ ubicaciones }),
    subscribeToArticulos: () => {
        const unsubscribe = onSnapshot(collection(database, 'articulos'), (snapshot) => {
            set({ articulos: snapshot.docs.map((doc) => doc.data()) });
        });
        return unsubscribe;
    },
    subscribeToInventarios: () => {
        const unsubscribe = onSnapshot(collection(database, 'inventarios'), (snapshot) => {
            set({
                inventarios: snapshot.docs.map((doc) => doc.data()),
            });
        });
        return unsubscribe;
    },
    subscribeToMarcas: () => {
        const unsubscribe = onSnapshot(collection(database, 'marcas'), (snapshot) => {
            set({ marcas: snapshot.docs.map((doc) => doc.data()) });
        });
        return unsubscribe;
    },
    subscribeToUbicaciones: () => {
        const unsubscribe = onSnapshot(collection(database, 'ubicaciones'), (snapshot) => {
            set({
                ubicaciones: snapshot.docs.map((doc) => doc.data()),
            });
        });
        return unsubscribe;
    },
    subscribeToMovimientos: () => {
        const unsubscribe = onSnapshot(collection(database, 'movimientos'), (snapshot) => {
            set({
                movimientos: snapshot.docs.map((doc) => doc.data()),
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
