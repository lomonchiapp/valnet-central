import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { database } from '@/firebase'
import { UsuarioFormState } from '../components/UsuarioForm'

export function useUpdateUsuario() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateUsuario = async (uid: string, usuario: Partial<UsuarioFormState>) => {
    setLoading(true)
    setError(null)
    try {
      const usuarioData = {
        ...usuario,
        updatedAt: new Date(),
      }
      await updateDoc(doc(database, 'usuarios', uid), usuarioData)
      setLoading(false)
      return { success: true }
    } catch (err: unknown) {
      let message = 'Error desconocido'
      if (err instanceof Error) message = err.message
      setError(message)
      setLoading(false)
      return { success: false, error: message }
    }
  }

  return { updateUsuario, loading, error }
} 