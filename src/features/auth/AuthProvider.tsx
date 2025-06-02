import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuthStore } from '@/stores/authStore'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Usuario } from '@/types'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore()

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
      setLoading(false)
    })

    return () => unsubscribe()
  }, [setUser, setLoading])

  return children
} 