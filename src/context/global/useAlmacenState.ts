import { database } from '@/firebase'
import { Articulo, Inventario, Marca } from '@/types'
import { Movimiento } from '@/types/interfaces/almacen/movimiento'
import { Ubicacion } from '@/types/interfaces/almacen/ubicacion'
import { onSnapshot, collection } from 'firebase/firestore'
import { create } from 'zustand'

// Este es el estado global de la aplicación
// En este vamos a almacenar todos los datos
interface AlmacenState {
  inventarios: Inventario[]
  movimientos: Movimiento[]
  articulos: Articulo[]
  marcas: Marca[]
  ubicaciones: Ubicacion[]
  setArticulos: (articulos: Articulo[]) => void
  setInventarios: (inventarios: Inventario[]) => void
  setMovimientos: (movimientos: Movimiento[]) => void
  setUbicaciones: (ubicaciones: Ubicacion[]) => void
  subscribeToArticulos: () => () => void
  subscribeToInventarios: () => () => void
  subscribeToMarcas: () => () => void
  subscribeToUbicaciones: () => () => void
  subscribeToMovimientos: () => () => void
}

export const useAlmacenState = create<AlmacenState>()((set) => ({
  inventarios: [],
  articulos: [],
  movimientos: [],
  marcas: [],
  ubicaciones: [],
  proveedores: [],
  setArticulos: (articulos: Articulo[]) => set({ articulos }),
  setInventarios: (inventarios: Inventario[]) => set({ inventarios }),
  setMovimientos: (movimientos: Movimiento[]) => set({ movimientos }),
  setUbicaciones: (ubicaciones: Ubicacion[]) => set({ ubicaciones }),
  subscribeToArticulos: () => {
    const unsubscribe = onSnapshot(
      collection(database, 'articulos'),
      (snapshot) => {
        set({ articulos: snapshot.docs.map((doc) => doc.data() as Articulo) })
      }
    )
    return unsubscribe
  },
  subscribeToInventarios: () => {
    const unsubscribe = onSnapshot(
      collection(database, 'inventarios'),
      (snapshot) => {
        set({
          inventarios: snapshot.docs.map((doc) => doc.data() as Inventario),
        })
      }
    )
    return unsubscribe
  },
  subscribeToMarcas: () => {
    const unsubscribe = onSnapshot(
      collection(database, 'marcas'),
      (snapshot) => {
        set({ marcas: snapshot.docs.map((doc) => doc.data() as Marca) })
      }
    )
    return unsubscribe
  },
  subscribeToUbicaciones: () => {
    const unsubscribe = onSnapshot(
      collection(database, 'ubicaciones'),
      (snapshot) => {
        set({
          ubicaciones: snapshot.docs.map((doc) => doc.data() as Ubicacion),
        })
      }
    )
    return unsubscribe
  },
  subscribeToMovimientos: () => {
    const unsubscribe = onSnapshot(
      collection(database, 'movimientos'),
      (snapshot) => {
        set({
          movimientos: snapshot.docs.map((doc) => doc.data() as Movimiento),
        })
      }
    )
    return unsubscribe
  },
}))
