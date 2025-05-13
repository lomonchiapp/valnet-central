import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { FIREBASE_AUTH } from '@/firebase'
import { useAuthStore } from '@/stores/authStore'
import { LoadingScreen } from '../loading-screen'
import { getUser } from '@/hooks/auth/getUser'
import { RoleUsuario } from 'shared-types'
interface Props {
  children: React.ReactNode
}

export function AuthProvider({ children }: Props) {
  const { isLoading, setUser, setIsLoading } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Obtener datos completos del usuario desde Firestore
          const userData = await getUser(firebaseUser.uid)
          if (userData) {
            setUser(userData)
          } else {
            // Si no existe el usuario en Firestore, usar datos básicos de Firebase Auth
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              firstName: firebaseUser.displayName?.split(' ')[0] || '',
              lastName: firebaseUser.displayName?.split(' ')[1] || '',
              phone: firebaseUser.phoneNumber || '',
              role: RoleUsuario.CLIENTE, // Rol por defecto
            })
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        //eslint-disable-next-line no-console
        console.error('Error setting user:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [setUser, setIsLoading])

  if (isLoading) {
    return <LoadingScreen />
  }

  return children
} 