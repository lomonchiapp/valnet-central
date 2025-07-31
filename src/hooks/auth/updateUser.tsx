import { doc, updateDoc } from 'firebase/firestore'
import { database } from '@/firebase'

export const useUpdateUser = () => {
  const updateUserStatus = async (userId: string, status: 'Online' | 'Offline') => {
    try {
      await updateDoc(doc(database, 'usuarios', userId), { status })
    } catch (error) {
      console.error('Error al actualizar el estado del usuario:', error)
      throw error
    }
  }

  return { updateUserStatus }
} 