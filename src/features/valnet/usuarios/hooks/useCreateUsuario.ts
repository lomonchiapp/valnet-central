import { useState } from 'react'
import { UsuarioFormState } from '../components/UsuarioForm'

// Cambia esta URL por la de tu función en producción o local
const NEW_VALNET_USER_ENDPOINT =
  'https://us-central1-valnet-86e94.cloudfunctions.net/newValnetUser'

export function useCreateUsuario() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createUsuario = async (usuario: UsuarioFormState) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(NEW_VALNET_USER_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usuario),
      })
      const data = await res.json()
      setLoading(false)
      if (!res.ok) {
        setError(data.error || 'Error desconocido')
        return { success: false, error: data.error || 'Error desconocido' }
      }
      return { success: true, uid: data.uid }
    } catch (err: unknown) {
      let message = 'Error desconocido'
      if (err instanceof Error) message = err.message
      setError(message)
      setLoading(false)
      return { success: false, error: message }
    }
  }

  return { createUsuario, loading, error }
}
