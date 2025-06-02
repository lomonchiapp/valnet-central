import { addDays, subDays } from 'date-fns'
import { database } from '@/firebase'
import {
  OrigenMovimiento,
  TipoMovimiento,
} from '@/types/interfaces/contabilidad/movimientoCuenta'
import { PagoRecurrente } from '@/types/interfaces/contabilidad/pagoRecurrente'
import { EstadoPagoRecurrente } from '@/types/interfaces/contabilidad/pagoRecurrente'
import {
  TipoNotificacion,
  EstadoNotificacion,
  PrioridadNotificacion,
  TipoAccionNotificacion,
} from '@/types/interfaces/notificaciones/notificacion'
import { CategoriaNotificacion } from '@/types/interfaces/notificaciones/notificacion'
import { RoleUsuario } from '@/types/interfaces/valnet/usuario'
import {
  doc,
  updateDoc,
  deleteDoc,
  collection,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import { toast } from 'sonner'
import { useCrearMovimientoCuenta } from '@/features/contabilidad/movimientos/hooks'
import { useCrearNotificacion } from '@/features/notificaciones/hooks'

type PagoRecurrenteInput = Omit<
  PagoRecurrente,
  'id' | 'createdAt' | 'updatedAt'
>

export const useCrearPagoRecurrente = () => {
  const { crearMovimientoCuenta } = useCrearMovimientoCuenta()
  const { crearNotificacion } = useCrearNotificacion()

  const crearPagoRecurrente = async (pago: PagoRecurrenteInput) => {
    try {
      // 1. Get the current account balance
      const cuentaRef = doc(database, 'cuentas', pago.idcuenta)
      const cuentaDoc = await getDoc(cuentaRef)
      if (!cuentaDoc.exists()) {
        throw new Error('Cuenta no encontrada')
      }
      const cuenta = cuentaDoc.data()
      const balanceAnterior = cuenta.balance || 0
      const balanceNuevo = balanceAnterior - pago.monto

      // 2. Create the recurring payment
      const docRef = doc(collection(database, 'pagosRecurrentes'))
      const pagoData = {
        ...pago,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Filter out undefined values
      const cleanPagoData = Object.fromEntries(
        Object.entries(pagoData).filter(([, value]) => value !== undefined)
      )

      await setDoc(docRef, cleanPagoData)

      // 3. Create the account movement
      await crearMovimientoCuenta({
        idcuenta: pago.idcuenta,
        tipo: TipoMovimiento.DEBITO,
        monto: pago.monto,
        fecha: pago.fechaInicio,
        descripcion: pago.descripcion,
        origen: OrigenMovimiento.PAGO_RECURRENTE,
        idOrigen: docRef.id,
        balanceAnterior,
        balanceNuevo,
        ...(pago.notas && pago.notas.trim() && { notas: pago.notas.trim() }),
      })

      // 4. Update the account balance
      await updateDoc(cuentaRef, {
        balance: balanceNuevo,
        updatedAt: new Date(),
      })

      // 5. Create notifications
      const fechaProximoPago = new Date(pago.fechaProximoPago)

      // Notification for payment creation
      await crearNotificacion({
        tipo: TipoNotificacion.PAGO_RECURRENTE,
        estado: EstadoNotificacion.PENDIENTE,
        titulo: 'Nuevo Pago Recurrente Creado',
        mensaje: `Se ha creado un nuevo pago recurrente: ${pago.descripcion}`,
        roles: [RoleUsuario.ADMIN, RoleUsuario.CONTABILIDAD],
        categoria: CategoriaNotificacion.PAGOS,
        fechaNotificacion: new Date().toISOString(),
        prioridad: PrioridadNotificacion.MEDIA,
        accion: {
          tipo: TipoAccionNotificacion.MODAL,
          destino: docRef.id,
        },
      })

      // Notification for upcoming payment (3 days before)
      const fechaNotificacionProximo = subDays(fechaProximoPago, 3)
      if (fechaNotificacionProximo > new Date()) {
        await crearNotificacion({
          tipo: TipoNotificacion.PAGO_PROXIMO,
          estado: EstadoNotificacion.PENDIENTE,
          titulo: 'Pago Recurrente Próximo',
          mensaje: `El pago recurrente "${pago.descripcion}" vence en 3 días`,
          fechaNotificacion: fechaNotificacionProximo.toISOString(),
          prioridad: PrioridadNotificacion.ALTA,
          categoria: CategoriaNotificacion.PAGOS,
          roles: [RoleUsuario.ADMIN, RoleUsuario.CONTABILIDAD],
          metadatos: {
            entidadId: docRef.id,
            entidadTipo: 'pago_recurrente',
            fechaVencimiento: fechaProximoPago.toISOString(),
          },
          accion: {
            tipo: TipoAccionNotificacion.MODAL,
            destino: docRef.id,
          },
        })
      }

      // Notification for overdue payment (1 day after due date)
      const fechaNotificacionVencido = addDays(fechaProximoPago, 1)
      if (fechaNotificacionVencido > new Date()) {
        await crearNotificacion({
          tipo: TipoNotificacion.PAGO_VENCIDO,
          estado: EstadoNotificacion.PENDIENTE,
          titulo: 'Pago Recurrente Vencido',
          mensaje: `El pago recurrente "${pago.descripcion}" está vencido`,
          fechaNotificacion: fechaNotificacionVencido.toISOString(),
          prioridad: PrioridadNotificacion.ALTA,
          categoria: CategoriaNotificacion.PAGOS,
          roles: [RoleUsuario.ADMIN, RoleUsuario.CONTABILIDAD],
          metadatos: {
            entidadId: docRef.id,
            entidadTipo: 'pago_recurrente',
            fechaVencimiento: fechaProximoPago.toISOString(),
          },
          accion: {
            tipo: TipoAccionNotificacion.NAVEGACION,
            destino: `/compras/pagos-recurrentes`,
          },
        })
      }

      toast.success('Pago recurrente creado exitosamente')
      return docRef.id
    } catch (error) {
      console.error('Error al crear el pago recurrente:', error)
      toast.error('Error al crear el pago recurrente')
      throw error
    }
  }

  return { crearPagoRecurrente }
}

export const useActualizarPagoRecurrente = () => {
  const actualizarPagoRecurrente = async (
    id: string,
    pago: Partial<PagoRecurrenteInput>
  ) => {
    try {
      const pagoRef = doc(database, 'pagosRecurrentes', id)
      await updateDoc(pagoRef, {
        ...pago,
        updatedAt: new Date(),
      })
      toast.success('Pago recurrente actualizado exitosamente')
    } catch (error) {
      console.error('Error al actualizar el pago recurrente:', error)
      toast.error('Error al actualizar el pago recurrente')
      throw error
    }
  }

  const actualizarEstado = async (
    id: string,
    estado: PagoRecurrente['estado']
  ) => {
    try {
      const pagoRef = doc(database, 'pagosRecurrentes', id)
      await updateDoc(pagoRef, {
        estado,
        updatedAt: new Date(),
      })
      toast.success('Estado del pago recurrente actualizado exitosamente')
    } catch (error) {
      console.error('Error al actualizar el estado del pago recurrente:', error)
      toast.error('Error al actualizar el estado del pago recurrente')
      throw error
    }
  }

  return { actualizarPagoRecurrente, actualizarEstado }
}

export const useBorrarPagoRecurrente = () => {
  const borrarPagoRecurrente = async (id: string) => {
    try {
      console.log('Intentando borrar pago recurrente con ID:', id)

      // Verificar que el ID no esté vacío
      if (!id || id.trim() === '') {
        throw new Error('ID del pago recurrente no válido')
      }

      const pagoRef = doc(database, 'pagosRecurrentes', id)

      // Verificar que el documento existe antes de intentar borrarlo
      const pagoDoc = await getDoc(pagoRef)
      if (!pagoDoc.exists()) {
        throw new Error('El pago recurrente no existe')
      }

      console.log('Documento encontrado, procediendo a eliminarlo...')
      await deleteDoc(pagoRef)
      console.log('Pago recurrente eliminado exitosamente')

      toast.success('Pago recurrente eliminado exitosamente')
    } catch (error) {
      console.error('Error al eliminar el pago recurrente:', error)

      // Proporcionar mensajes de error más específicos
      let errorMessage = 'Error al eliminar el pago recurrente'
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          errorMessage = 'No tienes permisos para eliminar este pago recurrente'
        } else if (error.message.includes('not-found')) {
          errorMessage = 'El pago recurrente no fue encontrado'
        } else if (error.message.includes('network')) {
          errorMessage =
            'Error de conexión. Verifica tu internet y vuelve a intentar'
        } else {
          errorMessage = error.message
        }
      }

      toast.error(errorMessage)
      throw error
    }
  }

  return { borrarPagoRecurrente }
}

export const useProcesarPagoVariable = () => {
  const { crearMovimientoCuenta } = useCrearMovimientoCuenta()

  const procesarPagoVariable = async (id: string, montoReal: number) => {
    try {
      console.log('Procesando pago variable:', { id, montoReal })

      // 1. Get the recurring payment data
      const pagoRef = doc(database, 'pagosRecurrentes', id)
      const pagoDoc = await getDoc(pagoRef)

      if (!pagoDoc.exists()) {
        throw new Error('Pago recurrente no encontrado')
      }

      const pago = pagoDoc.data() as PagoRecurrente

      if (pago.tipoMonto !== 'VARIABLE') {
        throw new Error('Este pago no es de tipo variable')
      }

      // 2. Get the current account balance
      const cuentaRef = doc(database, 'cuentas', pago.idcuenta)
      const cuentaDoc = await getDoc(cuentaRef)

      if (!cuentaDoc.exists()) {
        throw new Error('Cuenta no encontrada')
      }

      const cuenta = cuentaDoc.data()
      const balanceAnterior = cuenta.balance || 0
      const balanceNuevo = balanceAnterior - montoReal

      // 3. Create the account movement with the real amount
      await crearMovimientoCuenta({
        idcuenta: pago.idcuenta,
        tipo: TipoMovimiento.DEBITO,
        monto: montoReal,
        fecha: new Date().toISOString(),
        descripcion: `${pago.descripcion} (Pago Variable)`,
        origen: OrigenMovimiento.PAGO_RECURRENTE,
        idOrigen: id,
        balanceAnterior,
        balanceNuevo,
        ...(pago.notas && pago.notas.trim() && { notas: pago.notas.trim() }),
      })

      // 4. Update the account balance
      await updateDoc(cuentaRef, {
        balance: balanceNuevo,
        updatedAt: new Date(),
      })

      // 5. Calculate next payment date based on frequency
      const fechaActual = new Date()
      const fechaProximoPago = new Date(fechaActual)

      switch (pago.frecuencia) {
        case 'DIARIO':
          fechaProximoPago.setDate(fechaProximoPago.getDate() + 1)
          break
        case 'SEMANAL':
          fechaProximoPago.setDate(fechaProximoPago.getDate() + 7)
          break
        case 'MENSUAL':
          fechaProximoPago.setMonth(fechaProximoPago.getMonth() + 1)
          break
        case 'ANUAL':
          fechaProximoPago.setFullYear(fechaProximoPago.getFullYear() + 1)
          break
        default:
          fechaProximoPago.setMonth(fechaProximoPago.getMonth() + 1)
      }

      // 6. Update the recurring payment with the new date and last amount
      const updateData = {
        fechaProximoPago: fechaProximoPago.toISOString(),
        ultimoMonto: montoReal,
        ultimaFechaPago: fechaActual.toISOString(),
        updatedAt: new Date(),
      }

      // Filter out undefined values
      const cleanUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([, value]) => value !== undefined)
      )

      await updateDoc(pagoRef, cleanUpdateData)

      toast.success(`Pago variable procesado: $${montoReal.toLocaleString()}`)
      return true
    } catch (error) {
      console.error('Error al procesar el pago variable:', error)

      let errorMessage = 'Error al procesar el pago variable'
      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast.error(errorMessage)
      throw error
    }
  }

  return { procesarPagoVariable }
}

export const useObtenerPagosVariablesPendientes = () => {
  const obtenerPagosVariablesPendientes = async (idcuenta?: string) => {
    try {
      let q = query(
        collection(database, 'pagosRecurrentes'),
        where('tipoMonto', '==', 'VARIABLE'),
        where('estado', '==', EstadoPagoRecurrente.ACTIVO)
      )

      if (idcuenta) {
        q = query(q, where('idcuenta', '==', idcuenta))
      }

      const querySnapshot = await getDocs(q)
      const pagosVariables = querySnapshot.docs.map(
        (doc) => doc.data() as PagoRecurrente
      )

      // Filtrar solo los que están próximos o vencidos
      const hoy = new Date()
      const pagosPendientes = pagosVariables.filter((pago) => {
        const fechaProximo = new Date(pago.fechaProximoPago)
        return fechaProximo <= hoy
      })

      return pagosPendientes
    } catch (error) {
      console.error('Error al obtener pagos variables pendientes:', error)
      return []
    }
  }

  return { obtenerPagosVariablesPendientes }
}
