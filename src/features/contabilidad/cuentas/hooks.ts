import { database } from '@/firebase'
import { Cuenta } from '@/types/interfaces/contabilidad/cuenta'
import { doc, updateDoc, deleteDoc, collection, setDoc } from 'firebase/firestore'
import { toast } from 'sonner'

interface CuentaInput extends Omit<Cuenta, 'id'> {
  parentId?: string
}

export const useCrearCuenta = () => {
  const crearCuenta = async (cuenta: CuentaInput) => {
    try {
      const { parentId, ...cuentaData } = cuenta
      const docRef = doc(collection(database, 'cuentas'))
      await setDoc(docRef, {
        ...cuentaData,
        id: docRef.id,
        parentId: parentId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      toast.success('Cuenta creada exitosamente')
      return docRef.id
    } catch (error) {
      console.error('Error al crear la cuenta:', error)
      toast.error('Error al crear la cuenta')
      throw error
    }
  }

  return { crearCuenta }
}

export const useActualizarCuenta = () => {
  const actualizarCuenta = async (id: string, cuenta: Partial<CuentaInput>) => {
    try {
      const { parentId, ...cuentaData } = cuenta
      const cuentaRef = doc(database, 'cuentas', id)
      await updateDoc(cuentaRef, {
        ...cuentaData,
        parentId: parentId || null,
        updatedAt: new Date(),
      })
      toast.success('Cuenta actualizada exitosamente')
    } catch (error) {
      console.error('Error al actualizar la cuenta:', error)
      toast.error('Error al actualizar la cuenta')
      throw error
    }
  }

  const actualizarBalance = async (id: string, nuevoBalance: number) => {
    try {
      const cuentaRef = doc(database, 'cuentas', id)
      await updateDoc(cuentaRef, { 
        balance: nuevoBalance,
        updatedAt: new Date(),
      })
      toast.success('Balance actualizado exitosamente')
    } catch (error) {
      console.error('Error al actualizar el balance:', error)
      toast.error('Error al actualizar el balance')
      throw error
    }
  }

  return { actualizarCuenta, actualizarBalance }
}

export const useBorrarCuenta = () => {
  const borrarCuenta = async (id: string) => {
    try {
      const cuentaRef = doc(database, 'cuentas', id)
      await deleteDoc(cuentaRef)
      toast.success('Cuenta eliminada exitosamente')
    } catch (error) {
      console.error('Error al eliminar la cuenta:', error)
      toast.error('Error al eliminar la cuenta')
      throw error
    }
  }

  return { borrarCuenta }
} 