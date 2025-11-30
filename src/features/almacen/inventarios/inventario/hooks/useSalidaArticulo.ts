import { useState } from 'react'
import { database } from '@/firebase'
import { TipoArticulo } from '@/types/interfaces/almacen/articulo'
import { TipoMovimiento } from '@/types/interfaces/almacen/movimiento'
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  getDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import { Articulo } from 'shared-types'
import { validateSalida, validateTransfer, findDuplicateArticle } from '../utils/inventarioValidations'

interface SalidaArticuloParams {
  articuloId: string
  inventarioOrigenId: string
  inventarioDestinoId?: string // Optional for transfers
  cantidad: number
  descripcion: string
  ubicacionDestino?: string // Optional for transfers
  usuarioId: string
}

interface SalidaArticuloResult {
  success: boolean
  message: string
  movimientoId?: string
}

export function useSalidaArticulo() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Realiza una salida de artículo del inventario
   */
  const realizarSalida = async (
    params: SalidaArticuloParams
  ): Promise<SalidaArticuloResult> => {
    setIsLoading(true)
    setError(null)

    try {
      // Verificar que el artículo existe y tiene suficiente cantidad
      const articuloRef = doc(database, 'articulos', params.articuloId)
      const articuloSnap = await getDoc(articuloRef)

      if (!articuloSnap.exists()) {
        const errorMsg = 'El artículo no existe'
        setError(errorMsg)
        return { success: false, message: errorMsg }
      }

      const articulo = articuloSnap.data() as Articulo

      // Validar salida/transferencia
      const salidaValidation = validateSalida(articulo, params.cantidad)
      if (!salidaValidation.isValid) {
        setError(salidaValidation.error || 'Error de validación')
        return {
          success: false,
          message: salidaValidation.error || 'Error de validación',
        }
      }

      // Si es transferencia, validar que sea posible
      if (params.inventarioDestinoId) {
        const transferValidation = await validateTransfer(articulo, params.inventarioDestinoId)
        if (!transferValidation.isValid) {
          setError(transferValidation.error || 'Error de validación de transferencia')
          return {
            success: false,
            message: transferValidation.error || 'Error de validación de transferencia',
          }
        }
      }

      // Determinar el tipo de movimiento
      const tipoMovimiento = params.inventarioDestinoId
        ? TipoMovimiento.TRANSFERENCIA
        : TipoMovimiento.SALIDA

      // Validar que si es transferencia, el inventario destino existe
      if (tipoMovimiento === TipoMovimiento.TRANSFERENCIA && !params.inventarioDestinoId) {
        const errorMsg = 'Se requiere un inventario destino para realizar una transferencia'
        setError(errorMsg)
        return { success: false, message: errorMsg }
      }

      let movimientoRef: { id: string } | null = null

      // Si es una transferencia, manejar diferente según el tipo de artículo ANTES de crear el movimiento
      if (
        tipoMovimiento === TipoMovimiento.TRANSFERENCIA &&
        params.inventarioDestinoId
      ) {
        if (articulo.tipo === TipoArticulo.MATERIAL) {
          // MATERIAL: Actualizar cantidad en origen primero
          await updateDoc(articuloRef, {
            cantidad: articulo.cantidad - params.cantidad,
            updatedAt: serverTimestamp(),
          })

          // Buscar material en destino usando la clave completa (nombre + unidad + marca + modelo)
          const materialDestino = await findDuplicateArticle(articulo, params.inventarioDestinoId)

          if (materialDestino) {
            // Si existe material con la misma clave, actualizar cantidad
            const cantidadActual = materialDestino.cantidad || 0
            const nuevaCantidad = cantidadActual + params.cantidad
            
            await updateDoc(doc(database, 'articulos', materialDestino.id!), {
              cantidad: nuevaCantidad,
              updatedAt: serverTimestamp(),
              ubicacion: params.ubicacionDestino || materialDestino.ubicacion || articulo.ubicacion || 'Almacén principal',
            })
          } else {
            // Si no existe, crear nuevo material en destino
            const nuevoMaterialData: Partial<Articulo> = {
              nombre: articulo.nombre,
              descripcion: articulo.descripcion || '',
              tipo: TipoArticulo.MATERIAL,
              idinventario: params.inventarioDestinoId,
              cantidad: params.cantidad,
              costo: articulo.costo || 0,
              unidad: articulo.unidad,
              marca: articulo.marca || '',
              modelo: articulo.modelo || '',
              serial: '', // Materiales no tienen serial
              ubicacion: params.ubicacionDestino || articulo.ubicacion || 'Almacén principal',
              cantidad_minima: articulo.cantidad_minima,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }

            const nuevoMaterialRef = await addDoc(
              collection(database, 'articulos'),
              nuevoMaterialData
            )

            // Actualizar el documento con su ID
            await updateDoc(doc(database, 'articulos', nuevoMaterialRef.id), {
              id: nuevoMaterialRef.id,
            })
          }
        } else if (articulo.tipo === TipoArticulo.EQUIPO) {
          // EQUIPO: Transferir equipo completo (cambiar inventario)
          // Para equipos, simplemente cambiamos el ID del inventario
          await updateDoc(articuloRef, {
            idinventario: params.inventarioDestinoId,
            ubicacion: params.ubicacionDestino || articulo.ubicacion,
            updatedAt: serverTimestamp(),
          })
        }

        // Crear el registro de movimiento DESPUÉS de procesar la transferencia
        const movimientoData = {
          idinventario_origen: params.inventarioOrigenId,
          idinventario_destino: params.inventarioDestinoId || null,
          idarticulo: params.articuloId,
          idusuario: params.usuarioId,
          cantidad: params.cantidad,
          tipo: tipoMovimiento,
          fecha: new Date(),
          descripcion: params.descripcion,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }

        movimientoRef = await addDoc(
          collection(database, 'movimientos'),
          movimientoData
        )

        // Actualizar el documento recién creado para incluir su propio ID
        await updateDoc(doc(database, 'movimientos', movimientoRef.id), {
          id: movimientoRef.id,
        })
      } else {
        // Si es solo salida (no transferencia), actualizar cantidad
        const nuevaCantidad = articulo.cantidad - params.cantidad
        await updateDoc(articuloRef, {
          cantidad: nuevaCantidad,
          updatedAt: serverTimestamp(),
        })

        // Crear el registro de movimiento para la salida
        const movimientoData = {
          idinventario_origen: params.inventarioOrigenId,
          idinventario_destino: null,
          idarticulo: params.articuloId,
          idusuario: params.usuarioId,
          cantidad: params.cantidad,
          tipo: TipoMovimiento.SALIDA,
          fecha: new Date(),
          descripcion: params.descripcion,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }

        movimientoRef = await addDoc(
          collection(database, 'movimientos'),
          movimientoData
        )

        // Actualizar el documento recién creado para incluir su propio ID
        await updateDoc(doc(database, 'movimientos', movimientoRef.id), {
          id: movimientoRef.id,
        })
      }

      return {
        success: true,
        message:
          tipoMovimiento === TipoMovimiento.TRANSFERENCIA
            ? 'Transferencia realizada correctamente'
            : 'Salida realizada correctamente',
        movimientoId: movimientoRef.id,
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Realiza una transferencia de artículo entre inventarios
   */
  const realizarTransferencia = async (
    params: SalidaArticuloParams
  ): Promise<SalidaArticuloResult> => {
    if (!params.inventarioDestinoId) {
      const errorMsg =
        'Se requiere un inventario destino para realizar una transferencia'
      setError(errorMsg)
      return {
        success: false,
        message: errorMsg,
      }
    }

    return realizarSalida(params)
  }

  return {
    realizarSalida,
    realizarTransferencia,
    isLoading,
    error,
  }
}
