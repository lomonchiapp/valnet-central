import { useState } from 'react'
import { database } from '@/firebase'
import { doc, updateDoc, serverTimestamp, getDoc, addDoc, collection } from 'firebase/firestore'
import { Articulo } from 'shared-types'
import { getAuthState } from '@/stores/authStore'
import { TipoMovimiento } from '@/types/interfaces/almacen/movimiento'
import { validateUpdateArticle } from '../utils/inventarioValidations'

interface ActualizarArticuloParams {
  id: string
  nombre?: string
  cantidad?: number
  serial?: string
  descripcion?: string
  ubicacion?: string
  costo?: number
  mac?: string
  wirelessKey?: string
  garantia?: number
  codigoBarras?: string
  marca?: string
  modelo?: string
  codigo?: string // SKU
}

export function useActualizarArticulo() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const actualizarArticulo = async (
    data: ActualizarArticuloParams
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const { id, ...updateData } = data
      const articuloRef = doc(database, 'articulos', id)

      // Get current article data BEFORE update for audit trail
      const articuloSnapshotBefore = await getDoc(articuloRef)
      const articuloDataBefore = articuloSnapshotBefore.data() as Articulo

      if (!articuloDataBefore) {
        setError(new Error('El artículo no existe'))
        return false
      }

      // Validar actualización antes de proceder
      const articuloCompleto = { ...articuloDataBefore, ...updateData, id: data.id }
      const validation = await validateUpdateArticle(articuloCompleto, articuloDataBefore.idinventario)
      
      if (!validation.isValid) {
        setError(new Error(validation.error || 'Error de validación'))
        return false
      }

      // Get current user ID from auth store
      const { user } = getAuthState()
      const userId = user?.id || 'unknown'

      // Update the article document
      await updateDoc(articuloRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      })

      // Get the full article data AFTER update
      const articuloSnapshotAfter = await getDoc(articuloRef)
      const articuloDataAfter = articuloSnapshotAfter.data() as Articulo

      // Create movement record for the edit with before/after values
      const cantidadMovimiento = updateData.cantidad !== undefined 
        ? Math.abs(updateData.cantidad - (articuloDataBefore.cantidad || 0))
        : 1
      
      const movimientoData = {
        idinventario_origen: articuloDataBefore.idinventario,
        idinventario_destino: articuloDataBefore.idinventario,
        idarticulo: id,
        idusuario: userId,
        cantidad: cantidadMovimiento,
        tipo: TipoMovimiento.TRANSFERENCIA, // Using TRANSFERENCIA type for edits
        fecha: new Date(),
        descripcion: generateMovementDescription(updateData, articuloDataBefore, articuloDataAfter),
        valoresAnteriores: getChangedValues(articuloDataBefore, updateData),
        valoresNuevos: getChangedValues(articuloDataAfter, updateData),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const movimientoRef = await addDoc(
        collection(database, 'movimientos'),
        movimientoData
      )

      // Update the newly created document to include its own ID
      await updateDoc(movimientoRef, {
        id: movimientoRef.id,
      })

      return true
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Error desconocido al actualizar el artículo')
      )
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to get changed values for audit
  const getChangedValues = (
    articuloData: Articulo,
    updateData: Omit<ActualizarArticuloParams, 'id'>
  ): Record<string, any> => {
    const values: Record<string, any> = {}
    
    if (updateData.nombre !== undefined) values.nombre = articuloData.nombre
    if (updateData.descripcion !== undefined) values.descripcion = articuloData.descripcion
    if (updateData.cantidad !== undefined) values.cantidad = articuloData.cantidad
    if (updateData.costo !== undefined) values.costo = articuloData.costo
    if (updateData.ubicacion !== undefined) values.ubicacion = articuloData.ubicacion
    if (updateData.serial !== undefined) values.serial = (articuloData as any).serial
    if (updateData.mac !== undefined) values.mac = (articuloData as any).mac
    if (updateData.wirelessKey !== undefined) values.wirelessKey = (articuloData as any).wirelessKey
    if (updateData.garantia !== undefined) values.garantia = (articuloData as any).garantia
    if (updateData.codigoBarras !== undefined) values.codigoBarras = (articuloData as any).codigoBarras
    if (updateData.marca !== undefined) values.marca = articuloData.marca
    if (updateData.modelo !== undefined) values.modelo = articuloData.modelo
    if (updateData.codigo !== undefined) values.codigo = (articuloData as any).codigo
    
    return values
  }

  // Helper function to generate a descriptive message for the movement
  const generateMovementDescription = (
    updateData: Omit<ActualizarArticuloParams, 'id'>,
    articuloDataBefore: Articulo,
    articuloDataAfter: Articulo
  ): string => {
    const changes: string[] = []

    if (updateData.cantidad !== undefined && articuloDataBefore.cantidad !== articuloDataAfter.cantidad) {
      changes.push(`cantidad: ${articuloDataBefore.cantidad || 0} → ${articuloDataAfter.cantidad}`)
    }

    if (updateData.ubicacion && articuloDataBefore.ubicacion !== articuloDataAfter.ubicacion) {
      changes.push(`ubicación: "${articuloDataBefore.ubicacion || 'Sin ubicación'}" → "${articuloDataAfter.ubicacion}"`)
    }

    if (updateData.costo !== undefined && articuloDataBefore.costo !== articuloDataAfter.costo) {
      changes.push(`costo: ${articuloDataBefore.costo} → ${articuloDataAfter.costo}`)
    }

    if (updateData.serial && (articuloDataBefore as any).serial !== (articuloDataAfter as any).serial) {
      changes.push(`serial: "${(articuloDataBefore as any).serial || 'Sin serial'}" → "${(articuloDataAfter as any).serial}"`)
    }

    if (updateData.mac && (articuloDataBefore as any).mac !== (articuloDataAfter as any).mac) {
      changes.push(`MAC: "${(articuloDataBefore as any).mac || 'Sin MAC'}" → "${(articuloDataAfter as any).mac}"`)
    }

    if (updateData.wirelessKey && (articuloDataBefore as any).wirelessKey !== (articuloDataAfter as any).wirelessKey) {
      changes.push(`clave wireless actualizada`)
    }

    if (updateData.garantia !== undefined && (articuloDataBefore as any).garantia !== (articuloDataAfter as any).garantia) {
      changes.push(`garantía: ${(articuloDataBefore as any).garantia || 0} → ${(articuloDataAfter as any).garantia} meses`)
    }

    if (updateData.nombre && articuloDataBefore.nombre !== articuloDataAfter.nombre) {
      changes.push(`nombre: "${articuloDataBefore.nombre}" → "${articuloDataAfter.nombre}"`)
    }

    if (updateData.descripcion && articuloDataBefore.descripcion !== articuloDataAfter.descripcion) {
      changes.push(`descripción: "${articuloDataBefore.descripcion || 'Sin descripción'}" → "${articuloDataAfter.descripcion || 'Sin descripción'}"`)
    }

    if (updateData.codigoBarras && (articuloDataBefore as any).codigoBarras !== (articuloDataAfter as any).codigoBarras) {
      changes.push(`código de barras actualizado`)
    }

    if (updateData.marca && articuloDataBefore.marca !== articuloDataAfter.marca) {
      changes.push(`marca actualizada`)
    }

    if (updateData.modelo && articuloDataBefore.modelo !== articuloDataAfter.modelo) {
      changes.push(`modelo: "${articuloDataBefore.modelo || 'Sin modelo'}" → "${articuloDataAfter.modelo || 'Sin modelo'}"`)
    }

    if (updateData.codigo && (articuloDataBefore as any).codigo !== (articuloDataAfter as any).codigo) {
      changes.push(`código/SKU: "${(articuloDataBefore as any).codigo || 'Sin código'}" → "${(articuloDataAfter as any).codigo}"`)
    }

    if (changes.length === 0) {
      return `Edición de ${articuloDataBefore.nombre}`
    }

    return `Edición de ${articuloDataBefore.nombre}: ${changes.join(', ')}`
  }

  return { actualizarArticulo, isLoading, error }
}
