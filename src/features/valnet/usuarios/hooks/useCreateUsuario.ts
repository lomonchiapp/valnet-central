import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { FIREBASE_AUTH, database } from '@/firebase'
import { UsuarioFormState } from '../components/UsuarioForm'

export function useCreateUsuario() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createUsuario = async (usuario: UsuarioFormState) => {
    setLoading(true)
    setError(null)
    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        FIREBASE_AUTH,
        usuario.email,
        usuario.password || 'valnet2025' // fallback por si no hay password
      )
      const { user } = userCredential

      // 2. Guardar datos adicionales en Firestore
      const usuarioData = {
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        email: usuario.email,
        role: usuario.role,
        cedula: usuario.cedula,
        status: usuario.status,
        telefono: usuario.telefono,
        direccion: usuario.direccion,
        fechaNacimiento: usuario.fechaNacimiento,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: user.uid,
      }
      await setDoc(doc(database, 'usuarios', user.uid), usuarioData)
      setLoading(false)
      return { success: true, uid: user.uid }
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