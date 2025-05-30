import { useState, useEffect } from 'react'
import { database } from '@/firebase'
import type { Usuario } from '@/types/interfaces/valnet/usuario'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

export function useAuth() {
  const [user, setUser] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Obtener datos adicionales del usuario desde Firestore
          const userDoc = await getDoc(
            doc(database, 'usuarios', firebaseUser.uid)
          )
          if (userDoc.exists()) {
            setUser({
              id: firebaseUser.uid,
              ...userDoc.data(),
            } as Usuario)
          } else {
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } catch (err) {
        setError(err as Error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  return { user, loading, error }
}
