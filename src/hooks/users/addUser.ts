import { createUserWithEmailAndPassword } from 'firebase/auth'
import { FIREBASE_AUTH } from '@/firebase'
import { addDoc, collection } from 'firebase/firestore'
import { database } from '@/firebase'
import { User } from '@/types/interfaces/valnet/usuario'

export const addUser = async (email: string, password: string, userData: Omit<User, 'id'>) => {
  const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password)
  const user = {
    ...userData,
    email: userCredential.user.email,
    id: userCredential.user.uid,
  }
  const docRef = await addDoc(collection(database, 'users'), user)
  return docRef
}
