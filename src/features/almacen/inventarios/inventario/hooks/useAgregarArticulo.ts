import { useState } from 'react'
import { database, storage } from '@/firebase'
import { TipoMovimiento } from '@/types/interfaces/almacen/movimiento'
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { TipoArticulo, Unidad } from 'shared-types'
import { getAuthState } from '@/stores/authStore'
import { validateNewArticle, findDuplicateArticle } from '../utils/inventarioValidations'

export interface NuevoArticuloData {
  nombre: string
  descripcion: string
  tipo: TipoArticulo
  cantidad: number
  costo: number
  unidad: Unidad
  marca: string
  modelo: string
  serial: string
  ubicacion: string
  imagenUrl?: string
  garantia?: number
  mac?: string
  codigoBarras?: string
  categoriaEquipo?: string
  wirelessKey?: string
  cantidad_minima?: number
  codigo?: string // SKU
}

interface AgregarArticuloParams extends NuevoArticuloData {
  imagen?: File | null
}

export function useAgregarArticulo(inventarioId: string) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [progress, setProgress] = useState(0)

  const agregarArticulo = async (
    data: AgregarArticuloParams
  ): Promise<string | null> => {
    setIsLoading(true)
    setError(null)
    setProgress(0)

    try {
      let imagenUrl = data.imagenUrl

      // Upload image if provided
      if (data.imagen) {
        const imageRef = ref(
          storage,
          `articulos/${inventarioId}/${Date.now()}-${data.imagen.name}`
        )
        await uploadBytes(imageRef, data.imagen)
        imagenUrl = await getDownloadURL(imageRef)
        setProgress(100)
      }

      // Create article data compatible with Articulo type from shared-types
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { imagen, ...articuloDataParaGuardar } = data

      const articuloPayload = {
        ...articuloDataParaGuardar,
        imagenUrl,
        idinventario: inventarioId,
        // If it's equipment, set quantity to 1
        cantidad: data.tipo === TipoArticulo.EQUIPO ? 1 : Number(data.cantidad),
        ...(data.categoriaEquipo && { categoriaEquipo: data.categoriaEquipo }),
        ...(data.wirelessKey && { wirelessKey: data.wirelessKey }),
        ...(data.codigo && { codigo: data.codigo }), // Guardar código si existe
      }

      // Get current user ID from auth store
      const { user } = getAuthState()
      const userId = user?.id || 'unknown'

      // Validar datos antes de proceder
      const validation = await validateNewArticle(articuloPayload, inventarioId)
      if (!validation.isValid) {
        setError(validation.error ? new Error(validation.error) : new Error('Error de validación'))
        return null
      }

      // Si es MATERIAL, buscar si ya existe uno con la misma clave (SKU o nombre+unidad+marca+modelo)
      if (data.tipo === TipoArticulo.MATERIAL) {
        const duplicate = await findDuplicateArticle(articuloPayload, inventarioId)
        
        if (duplicate) {
          // Artículo material existente encontrado - agregar stock
          const cantidadActual = Number(duplicate.cantidad) || 0
          const cantidadAAgregar = Number(articuloPayload.cantidad) || 0
          const nuevaCantidad = cantidadActual + cantidadAAgregar

          // Actualizar con los datos más recientes del formulario (costo, descripción, etc.)
          const updateData = {
            ...articuloPayload,
            cantidad: nuevaCantidad,
            updatedAt: serverTimestamp(),
          }

          await updateDoc(doc(database, 'articulos', duplicate.id!), updateData)

          // Crear registro de movimiento para la entrada
          const movimientoData = {
            idinventario_origen: null,
            idinventario_destino: inventarioId,
            idarticulo: duplicate.id,
            idusuario: userId,
            cantidad: cantidadAAgregar,
            tipo: TipoMovimiento.ENTRADA,
            fecha: new Date(),
            descripcion: `Entrada de ${cantidadAAgregar} ${articuloPayload.unidad} de ${articuloPayload.nombre}`,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }

          const movimientoRef = await addDoc(
            collection(database, 'movimientos'),
            movimientoData
          )

          // Actualizar el documento recién creado para incluir su propio ID
          await updateDoc(doc(database, 'movimientos', movimientoRef.id), {
            id: movimientoRef.id,
          })

          return duplicate.id // Devolver ID del artículo actualizado
        }
      } else if (data.tipo === TipoArticulo.EQUIPO) {
        // Para equipos, verificar que no exista otro con el mismo serial
        const duplicate = await findDuplicateArticle(articuloPayload, inventarioId)
        
        if (duplicate) {
          setError(new Error(`Ya existe un equipo con el serial "${articuloPayload.serial}". El serial debe ser único.`))
          return null
        }
      }

      // Si es EQUIPO, o es MATERIAL pero no se encontró (se crea nuevo)
      const docRef = await addDoc(collection(database, 'articulos'), {
        ...articuloPayload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // Actualizar el documento recién creado para incluir su propio ID
      await updateDoc(docRef, {
        id: docRef.id,
      })

      // Crear registro de movimiento para la entrada
      const movimientoData = {
        idinventario_origen: null,
        idinventario_destino: inventarioId,
        idarticulo: docRef.id,
        idusuario: userId,
        cantidad: articuloPayload.cantidad,
        tipo: TipoMovimiento.ENTRADA,
        fecha: new Date(),
        descripcion: `Entrada inicial de ${articuloPayload.cantidad} ${articuloPayload.unidad} de ${articuloPayload.nombre}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const movimientoRef = await addDoc(
        collection(database, 'movimientos'),
        movimientoData
      )

      // Actualizar el documento recién creado para incluir su propio ID
      await updateDoc(movimientoRef, {
        id: movimientoRef.id,
      })

      return docRef.id
    } catch (err) {
      // Log error but avoid console statement in production
      setError(
        err instanceof Error
          ? err
          : new Error('Error desconocido al agregar el artículo')
      )
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { agregarArticulo, isLoading, error, progress }
}
