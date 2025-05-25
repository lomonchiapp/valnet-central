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
            //eslint-disable-next-line no-console
      console.log('realizarSalida called with params:', params)
      // Verificar que el artículo existe y tiene suficiente cantidad
      const articuloRef = doc(database, 'articulos', params.articuloId)
      const articuloSnap = await getDoc(articuloRef)

      if (!articuloSnap.exists()) {
        const errorMsg = 'El artículo no existe'
        // eslint-disable-next-line no-console
        console.error(errorMsg)
        setError(errorMsg)
        return { success: false, message: errorMsg }
      }

      const articulo = articuloSnap.data() as Articulo
      // eslint-disable-next-line no-console
      console.log('Articulo encontrado:', articulo)

      // Para materiales verificar cantidad, para equipos verificar que el serial exista
      if (
        articulo.tipo === TipoArticulo.MATERIAL &&
        articulo.cantidad < params.cantidad
      ) {
        const errorMsg = `No hay suficiente cantidad disponible. Disponible: ${articulo.cantidad}`
        // eslint-disable-next-line no-console
        console.error(errorMsg)
        setError(errorMsg)
        return {
          success: false,
          message: errorMsg,
        }
      }

      // Para equipos, solo permitir transferencia de unidades completas (cantidad = 1)
      if (articulo.tipo === TipoArticulo.EQUIPO && params.cantidad !== 1) {
        // eslint-disable-next-line no-console
        console.error('Los equipos deben transferirse de uno en uno')
        setError('Los equipos deben transferirse de uno en uno')
        return {
          success: false,
          message: 'Los equipos deben transferirse de uno en uno',
        }
      }

      // Determinar el tipo de movimiento
      const tipoMovimiento = params.inventarioDestinoId
        ? TipoMovimiento.TRANSFERENCIA
        : TipoMovimiento.SALIDA

      // Crear el registro de movimiento
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

      const movimientoRef = await addDoc(
        collection(database, 'movimientos'),
        movimientoData
      )

      // Actualizar el documento recién creado para incluir su propio ID
      await updateDoc(doc(database, 'movimientos', movimientoRef.id), {
        id: movimientoRef.id,
      })

      // Si es una transferencia, manejar diferente según el tipo de artículo
      if (
        tipoMovimiento === TipoMovimiento.TRANSFERENCIA &&
        params.inventarioDestinoId
      ) {
        if (articulo.tipo === TipoArticulo.MATERIAL) {
          // MATERIAL: Actualizar cantidad en origen
          await updateDoc(articuloRef, {
            cantidad: articulo.cantidad - params.cantidad,
            updatedAt: serverTimestamp(),
          })

          // Buscar material similar en destino por nombre, marca, modelo
          const articulosRef = collection(database, 'articulos')
          const q = query(
            articulosRef,
            where('idinventario', '==', params.inventarioDestinoId),
            where('nombre', '==', articulo.nombre),
            where('tipo', '==', TipoArticulo.MATERIAL),
            where('marca', '==', articulo.marca),
            where('modelo', '==', articulo.modelo)
          )

          const materialesDestino = await getDocs(q)

          if (!materialesDestino.empty) {
            // Si existe material similar, actualizar cantidad
            const materialDestino = materialesDestino.docs[0].data() as Articulo
            await updateDoc(doc(database, 'articulos', materialDestino.id), {
              cantidad: materialDestino.cantidad + params.cantidad,
              updatedAt: serverTimestamp(),
              ubicacion: params.ubicacionDestino || materialDestino.ubicacion,
            })
          } else {
            // Si no existe, crear nuevo material en destino
            const nuevoMaterialData = {
              nombre: articulo.nombre,
              descripcion: articulo.descripcion,
              tipo: TipoArticulo.MATERIAL,
              idinventario: params.inventarioDestinoId,
              cantidad: params.cantidad,
              costo: articulo.costo,
              unidad: articulo.unidad,
              marca: articulo.marca,
              modelo: articulo.modelo,
              serial: '', // Materiales no tienen serial
              ubicacion: params.ubicacionDestino || 'Almacén principal',
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
      } else {
        // Si es solo salida (no transferencia), actualizar cantidad
        const nuevaCantidad = articulo.cantidad - params.cantidad
        await updateDoc(articuloRef, {
          cantidad: nuevaCantidad,
          updatedAt: serverTimestamp(),
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
              //eslint-disable-next-line no-console
      console.error('Error in realizarSalida:', errorMessage)
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
    //eslint-disable-next-line no-console
    console.log('realizarTransferencia called with params:', params)
    if (!params.inventarioDestinoId) {
      const errorMsg =
        'Se requiere un inventario destino para realizar una transferencia'
      //eslint-disable-next-line no-console
      console.error(errorMsg)
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
