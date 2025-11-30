import { useState } from 'react'
import { database } from '@/firebase'
import { TipoMovimiento } from '@/types/interfaces/almacen/movimiento'
import { doc, getDoc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore'
import { Articulo } from 'shared-types'
import { getAuthState } from '@/stores/authStore'
import { toast } from 'sonner'

export function useAjustarCantidad() {
  const [isLoading, setIsLoading] = useState(false)

  const ajustarCantidad = async (
    articuloId: string,
    cantidadAnterior: number,
    cantidadNueva: number,
    tipoAjuste: 'incremento' | 'decremento' | 'directo',
    descripcionPersonalizada?: string
  ): Promise<boolean> => {
    setIsLoading(true)

    try {
      const articuloRef = doc(database, 'articulos', articuloId)
      const articuloSnapshot = await getDoc(articuloRef)
      
      if (!articuloSnapshot.exists()) {
        toast.error('Artículo no encontrado')
        return false
      }

      const articuloData = articuloSnapshot.data() as Articulo
      const cantidadActual = articuloData.cantidad || 0
      
      // Usar la cantidad actual del artículo, no la pasada como parámetro
      const cantidadAnteriorReal = cantidadActual
      const diferencia = cantidadNueva - cantidadAnteriorReal

      // Si no hay cambio, no hacer nada
      if (diferencia === 0) {
        return true
      }

      const { user } = getAuthState()
      const userId = user?.id || 'unknown'

      const tipoMovimiento = diferencia > 0 ? TipoMovimiento.ENTRADA : TipoMovimiento.SALIDA
      const cantidadMovimiento = Math.abs(diferencia)

      // Actualizar cantidad
      await updateDoc(articuloRef, {
        cantidad: cantidadNueva,
        updatedAt: serverTimestamp(),
      })

      // Crear movimiento solo si hay diferencia
      const descripcionBase = tipoAjuste === 'incremento'
        ? `Entrada de ${cantidadMovimiento} ${articuloData.unidad} de ${articuloData.nombre}`
        : tipoAjuste === 'decremento'
        ? `Salida de ${cantidadMovimiento} ${articuloData.unidad} de ${articuloData.nombre}`
        : `Ajuste de cantidad: ${cantidadAnteriorReal} → ${cantidadNueva} ${articuloData.unidad} de ${articuloData.nombre}`
      
      const descripcionFinal = descripcionPersonalizada 
        ? `${descripcionBase}. ${descripcionPersonalizada}`
        : descripcionBase

      const movimientoData = {
        idinventario_origen: tipoMovimiento === TipoMovimiento.SALIDA ? articuloData.idinventario : null,
        idinventario_destino: tipoMovimiento === TipoMovimiento.ENTRADA ? articuloData.idinventario : null,
        idarticulo: articuloId,
        idusuario: userId,
        cantidad: cantidadMovimiento,
        tipo: tipoMovimiento,
        fecha: new Date(),
        descripcion: descripcionFinal,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const movimientoRef = await addDoc(collection(database, 'movimientos'), movimientoData)
      await updateDoc(movimientoRef, { id: movimientoRef.id })

      toast.success(
        tipoAjuste === 'incremento'
          ? `Se agregaron ${cantidadMovimiento} ${articuloData.unidad}`
          : tipoAjuste === 'decremento'
          ? `Se sustrajeron ${cantidadMovimiento} ${articuloData.unidad}`
          : 'Cantidad actualizada'
      )

      return true
    } catch (error) {
      console.error(error)
      toast.error('Error al ajustar cantidad')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return { ajustarCantidad, isLoading }
}

