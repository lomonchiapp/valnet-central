import { useState, useEffect } from 'react'
import { database } from '@/firebase'
import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore'
import { useAlmacenState } from '@/context/global/useAlmacenState'

const MARCA_GENERICA_NOMBRE = 'GENERICA'

export function useMarcaGenerica() {
  const { marcas, subscribeToMarcas } = useAlmacenState()
  const [marcaGenericaId, setMarcaGenericaId] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeToMarcas()
    return unsubscribe
  }, [subscribeToMarcas])

  useEffect(() => {
    const ensureMarcaGenerica = async () => {
      setIsInitializing(true)
      
      // Buscar en las marcas cargadas
      const marcaGenerica = marcas.find(
        (m) => m.nombre.toUpperCase() === MARCA_GENERICA_NOMBRE.toUpperCase()
      )

      if (marcaGenerica) {
        setMarcaGenericaId(marcaGenerica.id)
        setIsInitializing(false)
        return
      }

      // Si no existe, buscarla en la base de datos
      try {
        const marcasRef = collection(database, 'marcas')
        const q = query(marcasRef, where('nombre', '==', MARCA_GENERICA_NOMBRE))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          const marcaDoc = querySnapshot.docs[0]
          setMarcaGenericaId(marcaDoc.id)
          setIsInitializing(false)
          return
        }

        // Si no existe, crearla
        const docRef = await addDoc(collection(database, 'marcas'), {
          nombre: MARCA_GENERICA_NOMBRE,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })

        await updateDoc(doc(database, 'marcas', docRef.id), {
          id: docRef.id,
        })

        setMarcaGenericaId(docRef.id)
      } catch (error) {
        console.error('Error al asegurar marca GENERICA:', error)
      } finally {
        setIsInitializing(false)
      }
    }

    ensureMarcaGenerica()
  }, [marcas])

  return { marcaGenericaId, isInitializing }
}

