import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { FIREBASE_AUTH } from '@/firebase'
import { useAuthStore } from '@/stores/authStore'
import { getUser } from '@/hooks/auth/getUser'
import { LoadingScreen } from '../loading-screen'
import { redirect } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, setUser } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userData = await getUser(firebaseUser.uid)
          if (userData) {
            setUser(userData)
          } else {
            throw redirect('/sign-in')
          }
        } else {
          setUser(null)
          throw redirect('/sign-in')
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error checking auth state:', error)
        throw redirect('/sign-in')
      }
    })

    return () => unsubscribe()
  }, [setUser])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!user) {
    throw redirect('/sign-in')
  }

  return <>{children}</>
} 