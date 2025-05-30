import { useEffect } from 'react'
import { FIREBASE_AUTH } from '@/firebase'
import { RoleUsuario, StatusUsuario } from '@/types'
import { onAuthStateChanged } from 'firebase/auth'
import { useAuthStore } from '@/stores/authStore'
import { getUser } from '@/hooks/auth/getUser'
import { LoadingScreen } from '../loading-screen'

interface Props {
  children: React.ReactNode
}

export function AuthProvider({ children }: Props) {
  const { isLoading, setUser, setIsLoading } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      FIREBASE_AUTH,
      async (firebaseUser) => {
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
                avatar: '',
                email: firebaseUser.email || '',
                nombres: firebaseUser.displayName?.split(' ')[0] || '',
                apellidos: firebaseUser.displayName?.split(' ')[1] || '',
                telefono: firebaseUser.phoneNumber || '',
                role: RoleUsuario.TECNICO, // Rol por defecto
                cedula: '',
                createdAt: new Date(),
                updatedAt: new Date(),
                direccion: '',
                fechaNacimiento: '',
                status: StatusUsuario.ONLINE,
              })
            }
          } else {
            setUser(null)
          }
        } catch (error) {
          console.error('Error setting user:', error)
          setUser(null)
        } finally {
          setIsLoading(false)
        }
      }
    )

    return () => unsubscribe()
  }, [setUser, setIsLoading])

  if (isLoading) {
    return <LoadingScreen />
  }

  return children
}
