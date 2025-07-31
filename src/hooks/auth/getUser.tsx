import { database } from '@/firebase'
import { Usuario } from '@/types'
import { doc, getDoc } from 'firebase/firestore'

export const getUser = async (uid: string): Promise<Usuario | null> => {
  try {
    const userRef = doc(database, 'usuarios', uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      return null
    }

    const userData = userSnap.data()
    return {
      id: userSnap.id,
      nombres: userData.nombres,
      apellidos: userData.apellidos,
      email: userData.email,
      avatar: userData.avatar || '',
      cedula: userData.cedula,
      status: userData.status,
      telefono: userData.telefono,
      direccion: userData.direccion,
      fechaNacimiento: userData.fechaNacimiento,
      role: userData.role,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      brigadaId: userData.brigadaId,
      nivelVendedor: userData.nivelVendedor,
      contratosMes: userData.contratosMes,
      bonoExtra: userData.bonoExtra,
    } as Usuario
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}
