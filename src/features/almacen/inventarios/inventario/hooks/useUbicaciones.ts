import { useState } from 'react'
import { database } from '@/firebase'
import { Ubicacion } from '@/types/interfaces/almacen/ubicacion'
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  FieldValue,
} from 'firebase/firestore'

interface NuevaUbicacionData {
  nombre: string
  idInventario?: string
}

interface ActualizarUbicacionData {
  id: string
  nombre: string
  idInventario?: string
}

export function useUbicaciones() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([])

  /**
   * Carga todas las ubicaciones disponibles
   */
  const cargarUbicaciones = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const ubicacionesRef = collection(database, 'ubicaciones')
      const snapshot = await getDocs(ubicacionesRef)
      const ubicacionesList = snapshot.docs.map(
        (doc) => doc.data() as Ubicacion
      )
      setUbicaciones(ubicacionesList)
      return ubicacionesList
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Crea una nueva ubicación
   */
  const crearUbicacion = async (
    data: NuevaUbicacionData
  ): Promise<Ubicacion | null> => {
    setIsLoading(true)
    setError(null)

    try {
      // Verificar si ya existe una ubicación con el mismo nombre
      const ubicacionesRef = collection(database, 'ubicaciones')
      const q = query(ubicacionesRef, where('nombre', '==', data.nombre.trim()))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        setError(`Ya existe una ubicación con el nombre "${data.nombre}"`)
        return null
      }

      // Crear la nueva ubicación
      const nuevaUbicacionData = {
        nombre: data.nombre.trim(),
        idInventario: data.idInventario || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(
        collection(database, 'ubicaciones'),
        nuevaUbicacionData
      )

      // Actualizar el documento recién creado para incluir su propio ID
      await updateDoc(doc(database, 'ubicaciones', docRef.id), {
        id: docRef.id,
      })

      const nuevaUbicacion: Ubicacion = {
        id: docRef.id,
        nombre: data.nombre.trim(),
        idInventario: data.idInventario || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Actualizar la lista local de ubicaciones
      setUbicaciones((prev) => [...prev, nuevaUbicacion])

      return nuevaUbicacion
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Actualiza una ubicación existente
   */
  const actualizarUbicacion = async (
    data: ActualizarUbicacionData
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      // Verificar si ya existe otra ubicación con el mismo nombre
      const ubicacionesRef = collection(database, 'ubicaciones')
      const q = query(
        ubicacionesRef,
        where('nombre', '==', data.nombre.trim()),
        where('id', '!=', data.id)
      )
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        setError(`Ya existe otra ubicación con el nombre "${data.nombre}"`)
        return false
      }

      // Actualizar la ubicación
      const ubicacionRef = doc(database, 'ubicaciones', data.id)
      const updateData: {
        nombre: string
        updatedAt: FieldValue
        idInventario?: string
      } = {
        nombre: data.nombre.trim(),
        updatedAt: serverTimestamp(),
      }

      // Solo incluir idInventario si se proporcionó
      if (data.idInventario !== undefined) {
        updateData.idInventario = data.idInventario
      }

      await updateDoc(ubicacionRef, updateData)

      // Actualizar la lista local de ubicaciones
      setUbicaciones((prev) =>
        prev.map((ub) => {
          if (ub.id === data.id) {
            const updated = {
              ...ub,
              nombre: data.nombre.trim(),
              updatedAt: new Date(),
            }

            // Solo actualizar idInventario si se proporcionó
            if (data.idInventario !== undefined) {
              updated.idInventario = data.idInventario
            }

            return updated
          }
          return ub
        })
      )

      return true
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Configura una suscripción a las ubicaciones
   */
  const subscribeToUbicaciones = () => {
    const ubicacionesRef = collection(database, 'ubicaciones')
    const unsubscribe = onSnapshot(
      ubicacionesRef,
      (snapshot) => {
        const ubicacionesList = snapshot.docs.map(
          (doc) => doc.data() as Ubicacion
        )
        setUbicaciones(ubicacionesList)
      },
      (error) => {
        setError(error.message)
      }
    )

    return unsubscribe
  }

  return {
    ubicaciones,
    cargarUbicaciones,
    crearUbicacion,
    actualizarUbicacion,
    subscribeToUbicaciones,
    isLoading,
    error,
  }
}
