import { createUserWithEmailAndPassword } from 'firebase/auth'
import { FIREBASE_AUTH } from '@/firebase'
import {addDoc, collection} from 'firebase/firestore'
import { database } from '@/firebase'
import { UserRole } from '@/types/enums'

export const addUser = async (email: string, password: string, userData: {
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
}) => {
  const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password)
  const user = {
    email: userCredential.user.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    phone: userData.phone,
    role: userData.role,
    id: userCredential.user.uid,
  }
  const docRef = await addDoc(collection(database, 'users'), user)
  return docRef
}
