import { database } from '@/firebase'
import { AsientoContable } from '@/types/interfaces/contabilidad/asientoContable'
import { Cuenta } from '@/types/interfaces/contabilidad/cuenta'
import { Ingreso } from '@/types/interfaces/contabilidad/ingreso'
import {
  MovimientoCuenta,
  TipoMovimiento,
  OrigenMovimiento,
} from '@/types/interfaces/contabilidad/movimientoCuenta'
import { PagoRecurrente } from '@/types/interfaces/contabilidad/pagoRecurrente'
import { PagoUnico } from '@/types/interfaces/contabilidad/pagoUnico'
import {
  onSnapshot,
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore'
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
  ingresos: Ingreso[]
  movimientosCuenta: MovimientoCuenta[]

  setCuentas: (cuentas: Cuenta[]) => void
  setAsientos: (asientos: AsientoContable[]) => void
  setDiarioGeneral: (diario: AsientoContable[]) => void
  setLibroDiario: (libro: AsientoContable[]) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setReportes: (reportes: any[]) => void
  setPagosUnicos: (pagos: PagoUnico[]) => void
  setPagosRecurrentes: (pagos: PagoRecurrente[]) => void
  setIngresos: (ingresos: Ingreso[]) => void
  setMovimientosCuenta: (movimientos: MovimientoCuenta[]) => void
  subscribeToCuentas: () => () => void
  subscribeToAsientos: () => () => void
  subscribeToDiarioGeneral: () => () => void
  subscribeToLibroDiario: () => () => void
  subscribeToReportes: () => () => void
  subscribeToPagosUnicos: () => () => void
  subscribeToPagosRecurrentes: () => () => void
  subscribeToIngresos: () => () => void
  subscribeToMovimientosCuenta: () => () => void

  // Funciones para pagos únicos con contabilidad
  addPagoUnicoConMovimiento: (
    pago: Omit<PagoUnico, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<string>
  updatePagoUnico: (id: string, pago: Partial<PagoUnico>) => Promise<void>
  deletePagoUnico: (id: string) => Promise<void>

  // Funciones para ingresos con contabilidad
  addIngresoConMovimiento: (
    ingreso: Omit<Ingreso, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<string>
  updateIngreso: (id: string, ingreso: Partial<Ingreso>) => Promise<void>
  deleteIngreso: (id: string) => Promise<void>

  // Funciones para movimientos de cuenta
  createMovimientoCuenta: (
    movimiento: Omit<MovimientoCuenta, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<string>
}

export const useContabilidadState = create<ContabilidadState>()((set, get) => ({
  cuentas: [],
  asientos: [],
  diarioGeneral: [],
  libroDiario: [],
  reportes: [],
  pagosUnicos: [],
  pagosRecurrentes: [],
  ingresos: [],
  movimientosCuenta: [],
  setCuentas: (cuentas) => set({ cuentas }),
  setAsientos: (asientos) => set({ asientos }),
  setDiarioGeneral: (diario) => set({ diarioGeneral: diario }),
  setLibroDiario: (libro) => set({ libroDiario: libro }),
  setReportes: (reportes) => set({ reportes }),
  setPagosUnicos: (pagos) => set({ pagosUnicos: pagos }),
  setPagosRecurrentes: (pagos) => set({ pagosRecurrentes: pagos }),
  setIngresos: (ingresos) => set({ ingresos }),
  setMovimientosCuenta: (movimientos) =>
    set({ movimientosCuenta: movimientos }),
  subscribeToCuentas: () => {
    const unsubscribe = onSnapshot(
      collection(database, 'cuentas'),
      (snapshot) => {
        const cuentasData = snapshot.docs.map((doc) => doc.data() as Cuenta)
        set({ cuentas: cuentasData })
      },
      (error) => {
        console.error('Error al obtener cuentas:', error)
      }
    )
    return unsubscribe
  },
  subscribeToAsientos: () => {
    const unsubscribe = onSnapshot(
      collection(database, 'asientos'),
      (snapshot) => {
        set({
          asientos: snapshot.docs.map((doc) => doc.data() as AsientoContable),
        })
      }
    )
    return unsubscribe
  },
  subscribeToDiarioGeneral: () => {
    const unsubscribe = onSnapshot(
      collection(database, 'diarioGeneral'),
      (snapshot) => {
        set({
          diarioGeneral: snapshot.docs.map(
            (doc) => doc.data() as AsientoContable
          ),
        })
      }
    )
    return unsubscribe
  },
  subscribeToLibroDiario: () => {
    const unsubscribe = onSnapshot(
      collection(database, 'libroDiario'),
      (snapshot) => {
        set({
          libroDiario: snapshot.docs.map(
            (doc) => doc.data() as AsientoContable
          ),
        })
      }
    )
    return unsubscribe
  },
  subscribeToReportes: () => {
    const unsubscribe = onSnapshot(
      collection(database, 'reportes'),
      (snapshot) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set({ reportes: snapshot.docs.map((doc) => doc.data() as any) })
      }
    )
    return unsubscribe
  },
  subscribeToPagosUnicos: () => {
    const unsubscribe = onSnapshot(
      collection(database, 'pagosUnicos'),
      (snapshot) => {
        const pagosUnicosData = snapshot.docs.map(
          (doc) =>
            ({
              ...doc.data(),
              id: doc.id,
            }) as PagoUnico
        )
        set({ pagosUnicos: pagosUnicosData })
      },
      (error) => {
        console.error('Error al obtener pagos únicos:', error)
      }
    )
    return unsubscribe
  },
  subscribeToPagosRecurrentes: () => {
    const unsubscribe = onSnapshot(
      collection(database, 'pagosRecurrentes'),
      (snapshot) => {
        const pagosRecurrentesData = snapshot.docs.map(
          (doc) =>
            ({
              ...doc.data(),
              id: doc.id,
            }) as PagoRecurrente
        )
        set({ pagosRecurrentes: pagosRecurrentesData })
      },
      (error) => {
        console.error('Error al obtener pagos recurrentes:', error)
      }
    )
    return unsubscribe
  },
  subscribeToIngresos: () => {
    const unsubscribe = onSnapshot(
      collection(database, 'ingresos'),
      (snapshot) => {
        const ingresosData = snapshot.docs.map(
          (doc) =>
            ({
              ...doc.data(),
              id: doc.id,
            }) as Ingreso
        )
        set({ ingresos: ingresosData })
      },
      (error) => {
        console.error('Error al obtener ingresos:', error)
      }
    )
    return unsubscribe
  },
  subscribeToMovimientosCuenta: () => {
    const unsubscribe = onSnapshot(
      collection(database, 'movimientosCuenta'),
      (snapshot) => {
        const movimientosData = snapshot.docs.map(
          (doc) =>
            ({
              ...doc.data(),
              id: doc.id,
            }) as MovimientoCuenta
        )
        set({ movimientosCuenta: movimientosData })
      },
      (error) => {
        console.error('Error al obtener movimientos de cuenta:', error)
      }
    )
    return unsubscribe
  },

  // Función para crear pago único con movimiento contable
  addPagoUnicoConMovimiento: async (pagoData) => {
    try {
      const result = await runTransaction(database, async (transaction) => {
        const cuentas = get().cuentas
        const cuentaSeleccionada = cuentas.find(
          (c) => c.id === pagoData.idcuenta
        )

        if (!cuentaSeleccionada) {
          throw new Error('Cuenta no encontrada')
        }

        // 1. Crear el pago único
        const pagoRef = doc(collection(database, 'pagosUnicos'))
        const pagoCompleto = {
          ...pagoData,
          id: pagoRef.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
        transaction.set(pagoRef, pagoCompleto)

        // 2. Calcular nuevo balance (débito = resta del balance)
        const balanceAnterior = cuentaSeleccionada.balance
        const balanceNuevo = balanceAnterior - pagoData.monto

        // 3. Actualizar balance de la cuenta
        const cuentaRef = doc(database, 'cuentas', pagoData.idcuenta)
        transaction.update(cuentaRef, {
          balance: balanceNuevo,
          updatedAt: serverTimestamp(),
        })

        // 4. Crear movimiento de cuenta
        const movimientoRef = doc(collection(database, 'movimientosCuenta'))
        const movimientoData = {
          id: movimientoRef.id,
          idcuenta: pagoData.idcuenta,
          tipo: TipoMovimiento.DEBITO,
          monto: pagoData.monto,
          fecha: pagoData.fecha,
          descripcion: `Pago/Gasto: ${pagoData.descripcion}`,
          origen: OrigenMovimiento.PAGO_UNICO,
          idOrigen: pagoRef.id,
          balanceAnterior,
          balanceNuevo,
          notas: `Pago registrado por ${pagoData.monto}`,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
        transaction.set(movimientoRef, movimientoData)

        return pagoRef.id
      })

      return result
    } catch (error) {
      console.error('Error al crear pago único con movimiento:', error)
      throw error
    }
  },

  updatePagoUnico: async (id, pagoData) => {
    try {
      await updateDoc(doc(database, 'pagosUnicos', id), {
        ...pagoData,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error('Error al actualizar pago único:', error)
      throw error
    }
  },

  deletePagoUnico: async (id) => {
    try {
      await runTransaction(database, async (transaction) => {
        const movimientosCuenta = get().movimientosCuenta
        const cuentas = get().cuentas

        // Buscar el movimiento asociado al pago
        const movimientoAsociado = movimientosCuenta.find(
          (m) => m.origen === OrigenMovimiento.PAGO_UNICO && m.idOrigen === id
        )

        if (movimientoAsociado) {
          // Buscar la cuenta afectada
          const cuentaAfectada = cuentas.find(
            (c) => c.id === movimientoAsociado.idcuenta
          )

          if (cuentaAfectada) {
            // Revertir el movimiento: si fue débito, agregamos el monto de vuelta al balance
            const balanceRevertido =
              cuentaAfectada.balance + movimientoAsociado.monto

            // Actualizar balance de la cuenta
            const cuentaRef = doc(
              database,
              'cuentas',
              movimientoAsociado.idcuenta
            )
            transaction.update(cuentaRef, {
              balance: balanceRevertido,
              updatedAt: serverTimestamp(),
            })

            // Crear movimiento de reversión
            const movimientoReversionRef = doc(
              collection(database, 'movimientosCuenta')
            )
            const movimientoReversion = {
              id: movimientoReversionRef.id,
              idcuenta: movimientoAsociado.idcuenta,
              tipo: TipoMovimiento.CREDITO,
              monto: movimientoAsociado.monto,
              fecha: new Date().toISOString(),
              descripcion: `Reversión de pago eliminado: ${movimientoAsociado.descripcion}`,
              origen: OrigenMovimiento.REVERSA_PAGO,
              idOrigen: id,
              balanceAnterior: cuentaAfectada.balance,
              balanceNuevo: balanceRevertido,
              notas: `Reversión automática por eliminación de pago ID: ${id}`,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }
            transaction.set(movimientoReversionRef, movimientoReversion)

            // Eliminar el movimiento original
            const movimientoOriginalRef = doc(
              database,
              'movimientosCuenta',
              movimientoAsociado.id
            )
            transaction.delete(movimientoOriginalRef)
          }
        }

        // Eliminar el pago único
        const pagoRef = doc(database, 'pagosUnicos', id)
        transaction.delete(pagoRef)
      })
    } catch (error) {
      console.error('Error al eliminar pago único:', error)
      throw error
    }
  },

  addIngresoConMovimiento: async (ingresoData) => {
    try {
      const result = await runTransaction(database, async (transaction) => {
        const cuentas = get().cuentas
        const cuentaSeleccionada = cuentas.find(
          (c) => c.id === ingresoData.idcuenta
        )

        if (!cuentaSeleccionada) {
          throw new Error('Cuenta no encontrada')
        }

        // 1. Crear el ingreso
        const ingresoRef = doc(collection(database, 'ingresos'))
        const ingresoCompleto = {
          ...ingresoData,
          id: ingresoRef.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
        transaction.set(ingresoRef, ingresoCompleto)

        // 2. Calcular nuevo balance (crédito = suma del balance)
        const balanceAnterior = cuentaSeleccionada.balance
        const balanceNuevo = balanceAnterior + ingresoData.monto

        // 3. Actualizar balance de la cuenta
        const cuentaRef = doc(database, 'cuentas', ingresoData.idcuenta)
        transaction.update(cuentaRef, {
          balance: balanceNuevo,
          updatedAt: serverTimestamp(),
        })

        // 4. Crear movimiento de cuenta
        const movimientoRef = doc(collection(database, 'movimientosCuenta'))
        const movimientoData = {
          id: movimientoRef.id,
          idcuenta: ingresoData.idcuenta,
          tipo: TipoMovimiento.CREDITO,
          monto: ingresoData.monto,
          fecha: ingresoData.fecha,
          descripcion: `Ingreso: ${ingresoData.descripcion}`,
          origen: OrigenMovimiento.INGRESO,
          idOrigen: ingresoRef.id,
          balanceAnterior,
          balanceNuevo,
          notas: `Ingreso registrado por ${ingresoData.monto}`,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
        transaction.set(movimientoRef, movimientoData)

        return ingresoRef.id
      })

      return result
    } catch (error) {
      console.error('Error al crear ingreso con movimiento:', error)
      throw error
    }
  },

  updateIngreso: async (id, ingresoData) => {
    try {
      await updateDoc(doc(database, 'ingresos', id), {
        ...ingresoData,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error('Error al actualizar ingreso:', error)
      throw error
    }
  },

  deleteIngreso: async (id) => {
    try {
      await runTransaction(database, async (transaction) => {
        const movimientosCuenta = get().movimientosCuenta
        const cuentas = get().cuentas

        // Buscar el movimiento asociado al ingreso
        const movimientoAsociado = movimientosCuenta.find(
          (m) => m.origen === OrigenMovimiento.INGRESO && m.idOrigen === id
        )

        if (movimientoAsociado) {
          // Buscar la cuenta afectada
          const cuentaAfectada = cuentas.find(
            (c) => c.id === movimientoAsociado.idcuenta
          )

          if (cuentaAfectada) {
            // Revertir el movimiento: si fue crédito, restamos el monto del balance
            const balanceRevertido =
              cuentaAfectada.balance - movimientoAsociado.monto

            // Actualizar balance de la cuenta
            const cuentaRef = doc(
              database,
              'cuentas',
              movimientoAsociado.idcuenta
            )
            transaction.update(cuentaRef, {
              balance: balanceRevertido,
              updatedAt: serverTimestamp(),
            })

            // Crear movimiento de reversión
            const movimientoReversionRef = doc(
              collection(database, 'movimientosCuenta')
            )
            const movimientoReversion = {
              id: movimientoReversionRef.id,
              idcuenta: movimientoAsociado.idcuenta,
              tipo: TipoMovimiento.DEBITO,
              monto: movimientoAsociado.monto,
              fecha: new Date().toISOString(),
              descripcion: `Reversión de ingreso eliminado: ${movimientoAsociado.descripcion}`,
              origen: OrigenMovimiento.REVERSA_PAGO,
              idOrigen: id,
              balanceAnterior: cuentaAfectada.balance,
              balanceNuevo: balanceRevertido,
              notas: `Reversión automática por eliminación de ingreso ID: ${id}`,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }
            transaction.set(movimientoReversionRef, movimientoReversion)

            // Eliminar el movimiento original
            const movimientoOriginalRef = doc(
              database,
              'movimientosCuenta',
              movimientoAsociado.id
            )
            transaction.delete(movimientoOriginalRef)
          }
        }

        // Eliminar el ingreso
        const ingresoRef = doc(database, 'ingresos', id)
        transaction.delete(ingresoRef)
      })
    } catch (error) {
      console.error('Error al eliminar ingreso:', error)
      throw error
    }
  },

  createMovimientoCuenta: async (movimientoData) => {
    try {
      const docRef = await addDoc(collection(database, 'movimientosCuenta'), {
        ...movimientoData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      await updateDoc(doc(database, 'movimientosCuenta', docRef.id), {
        id: docRef.id,
      })

      return docRef.id
    } catch (error) {
      console.error('Error al crear movimiento de cuenta:', error)
      throw error
    }
  },
}))
