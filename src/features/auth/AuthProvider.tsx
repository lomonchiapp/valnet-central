import { useEffect } from 'react'
import { Usuario } from '@/types'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { useAuthStore } from '@/stores/authStore'
import { auth } from '@/lib/firebase'
import { db } from '@/lib/firebase'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setIsLoading } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data() as Usuario
            setUser({
              ...userData,
              id: user.uid,
            })
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [setUser, setIsLoading])

  return children
}
