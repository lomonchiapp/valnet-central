import { database } from '@/firebase'
import { MovimientoCuenta, OrigenMovimiento } from '@/types/interfaces/contabilidad/movimientoCuenta'
import { doc, collection, setDoc, query, where, orderBy, getDocs } from 'firebase/firestore'
import { toast } from 'sonner'

type MovimientoCuentaInput = Omit<MovimientoCuenta, 'id' | 'createdAt' | 'updatedAt'>

export const useCrearMovimientoCuenta = () => {
  const crearMovimientoCuenta = async (movimiento: MovimientoCuentaInput) => {
    try {
      const docRef = doc(collection(database, 'movimientosCuenta'))
      const movimientoData = {
        ...movimiento,
        id: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      // Filter out undefined values
      const cleanMovimientoData = Object.fromEntries(
        Object.entries(movimientoData).filter(([, value]) => value !== undefined)
      )
      
      await setDoc(docRef, cleanMovimientoData)
      return docRef.id
    } catch (error) {
      console.error('Error al crear el movimiento:', error)
      toast.error('Error al crear el movimiento')
      throw error
    }
  }

  return { crearMovimientoCuenta }
}

export const useObtenerMovimientosCuenta = () => {
  const obtenerMovimientosCuenta = async (idcuenta: string) => {
    try {
      const q = query(
        collection(database, 'movimientosCuenta'),
        where('idcuenta', '==', idcuenta),
        orderBy('fecha', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => doc.data() as MovimientoCuenta)
    } catch (error) {
      console.error('Error al obtener los movimientos:', error)
      toast.error('Error al obtener los movimientos')
      throw error
    }
  }

  return { obtenerMovimientosCuenta }
}

export const useObtenerMovimientosPorOrigen = () => {
  const obtenerMovimientosPorOrigen = async (origen: OrigenMovimiento, idOrigen: string) => {
    try {
      const q = query(
        collection(database, 'movimientosCuenta'),
        where('origen', '==', origen),
        where('idOrigen', '==', idOrigen)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => doc.data() as MovimientoCuenta)
    } catch (error) {
      console.error('Error al obtener los movimientos:', error)
      toast.error('Error al obtener los movimientos')
      throw error
    }
  }

  return { obtenerMovimientosPorOrigen }
} 