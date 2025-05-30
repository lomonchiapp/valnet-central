import { database } from '@/firebase'
import { Cuenta } from '@/types/interfaces/contabilidad/cuenta'
import { AsientoContable } from '@/types/interfaces/contabilidad/asientoContable'
import { PagoUnico } from '@/types/interfaces/contabilidad/pagoUnico'
import { PagoRecurrente } from '@/types/interfaces/contabilidad/pagoRecurrente'
import { onSnapshot, collection } from 'firebase/firestore'
import { create } from 'zustand'
// Este es el estado global de la aplicación
// En este vamos a almacenar todos los datos
interface ContabilidadState {
  cuentas: Cuenta[]
  asientos: AsientoContable[]
  diarioGeneral: AsientoContable[]
  libroDiario: AsientoContable[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reportes: any[]
  pagosUnicos: PagoUnico[]
  pagosRecurrentes: PagoRecurrente[]

  setCuentas: (cuentas: Cuenta[]) => void
  setAsientos: (asientos: AsientoContable[]) => void
  setDiarioGeneral: (diario: AsientoContable[]) => void
  setLibroDiario: (libro: AsientoContable[]) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setReportes: (reportes: any[]) => void
  setPagosUnicos: (pagos: PagoUnico[]) => void
  setPagosRecurrentes: (pagos: PagoRecurrente[]) => void
  subscribeToCuentas: () => () => void
  subscribeToAsientos: () => () => void
  subscribeToDiarioGeneral: () => () => void
  subscribeToLibroDiario: () => () => void
  subscribeToReportes: () => () => void
}

export const useContabilidadState = create<ContabilidadState>()((set) => ({
  cuentas: [],
  asientos: [],
  diarioGeneral: [],
  libroDiario: [],
  reportes: [],
  pagosUnicos: [],
  pagosRecurrentes: [],
  setCuentas: (cuentas) => set({ cuentas }),
  setAsientos: (asientos) => set({ asientos }),
  setDiarioGeneral: (diario) => set({ diarioGeneral: diario }),
  setLibroDiario: (libro) => set({ libroDiario: libro }),
  setReportes: (reportes) => set({ reportes }),
  setPagosUnicos: (pagos) => set({ pagosUnicos: pagos }),
  setPagosRecurrentes: (pagos) => set({ pagosRecurrentes: pagos }),
  subscribeToCuentas: () => { 
    const unsubscribe = onSnapshot(
      collection(database, 'cuentas'),
      (snapshot) => { set({ cuentas: snapshot.docs.map((doc) => doc.data() as Cuenta) }) }
    )
    return unsubscribe
   },
  subscribeToAsientos: () => { 
    const unsubscribe = onSnapshot(
      collection(database, 'asientos'),
      (snapshot) => { set({ asientos: snapshot.docs.map((doc) => doc.data() as AsientoContable) }) }
    )
    return unsubscribe
   },
  subscribeToDiarioGeneral: () => { 
    const unsubscribe = onSnapshot(
      collection(database, 'diarioGeneral'),
      (snapshot) => { set({ diarioGeneral: snapshot.docs.map((doc) => doc.data() as AsientoContable) }) }
    )
    return unsubscribe
   },
  subscribeToLibroDiario: () => { 
    const unsubscribe = onSnapshot(
      collection(database, 'libroDiario'),
      (snapshot) => { set({ libroDiario: snapshot.docs.map((doc) => doc.data() as AsientoContable) }) }
    )
    return unsubscribe
   },
  subscribeToReportes: () => { 
    const unsubscribe = onSnapshot(
      collection(database, 'reportes'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (snapshot) => { set({ reportes: snapshot.docs.map((doc) => doc.data() as any) }) }
    )
    return unsubscribe
   }
}))
