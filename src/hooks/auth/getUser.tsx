import { doc, getDoc } from 'firebase/firestore'
import { database } from '@/firebase'
import { User } from '@/types'

export const getUser = async (uid: string): Promise<User | null> => {
  try {
    const userRef = doc(database, 'users', uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      return null
    }

    const userData = userSnap.data()
    return {
      id: userSnap.id,
      name: userData.name,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      permissions: userData.permissions || []
    } as User
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching user:', error)
    return null
  }
}
