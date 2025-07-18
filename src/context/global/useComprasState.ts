import { database } from '@/firebase'
import { GastoMenor } from '@/types/interfaces/compras/gastoMenor'
import { OrdenCompra } from '@/types/interfaces/compras/ordenCompra'
import { Proveedor } from '@/types/interfaces/compras/proveedor'
import { PagoRecurrente } from '@/types/interfaces/contabilidad/pagoRecurrente'
import { PagoUnico } from '@/types/interfaces/contabilidad/pagoUnico'
import { onSnapshot, collection } from 'firebase/firestore'
import { create } from 'zustand'

interface ComprasState {
  pagosUnicos: PagoUnico[]
  pagosRecurrentes: PagoRecurrente[]
  ordenes: OrdenCompra[]
  gastosMenores: GastoMenor[]
  proveedores: Proveedor[]

  setPagosUnicos: (pagosUnicos: PagoUnico[]) => void
  setPagosRecurrentes: (pagosRecurrentes: PagoRecurrente[]) => void
  setOrdenes: (ordenes: OrdenCompra[]) => void
  setGastosMenores: (gastos: GastoMenor[]) => void
  setProveedores: (proveedores: Proveedor[]) => void

  subscribeToPagosUnicos: () => () => void
  subscribeToPagosRecurrentes: () => () => void
  subscribeToOrdenes: () => () => void
  subscribeToGastosMenores: () => () => void
  subscribeToProveedores: () => () => void
}

export const useComprasState = create<ComprasState>()((set) => ({
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
    const unsubscribe = onSnapshot(
      collection(database, 'pagosUnicos'),
      (snapshot) => {
        set({
          pagosUnicos: snapshot.docs.map((doc) => doc.data() as PagoUnico),
        })
      }
    )
    return unsubscribe
  },
  subscribeToPagosRecurrentes: () => {
    const unsubscribe = onSnapshot(
      collection(database, 'pagosRecurrentes'),
      (snapshot) => {
        set({
          pagosRecurrentes: snapshot.docs.map(
            (doc) => doc.data() as PagoRecurrente
          ),
        })
      }
    )
    return unsubscribe
  },
  subscribeToOrdenes: () => {
    const unsubscribe = onSnapshot(
      collection(database, 'ordenes'),
      (snapshot) => {
        set({ ordenes: snapshot.docs.map((doc) => doc.data() as OrdenCompra) })
      }
    )
    return unsubscribe
  },
  subscribeToGastosMenores: () => {
    const unsubscribe = onSnapshot(
      collection(database, 'gastosMenores'),
      (snapshot) => {
        set({
          gastosMenores: snapshot.docs.map((doc) => doc.data() as GastoMenor),
        })
      }
    )
    return unsubscribe
  },
  subscribeToProveedores: () => {
    const unsubscribe = onSnapshot(
      collection(database, 'proveedores'),
      (snapshot) => {
        set({
          proveedores: snapshot.docs.map((doc) => doc.data() as Proveedor),
        })
      }
    )
    return unsubscribe
  },
}))
