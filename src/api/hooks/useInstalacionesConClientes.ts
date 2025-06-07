import { useCallback, useState } from 'react'
import { apiClient } from '../client'
import { API_TOKEN, ENDPOINTS } from '../config'
import type { InstalacionMikrowisp } from '../../types/interfaces/valnet/instalacionMikrowisp'
import type { ClienteDetalle } from './useGetCliente'
import { useInstalacionesStore } from '@/stores/instalacionesStore'

// Respuesta de ListarInstalaciones
interface ListarInstalacionesResponse {
  estado?: string
  instalaciones?: InstalacionMikrowisp[]
  mensaje?: string
  error?: string
}

// Respuesta de detalles de cliente
interface GetClienteResponse {
  estado?: string
  datos?: ClienteDetalle[]
  mensaje?: string
  error?: string
}

export interface InstalacionConCliente extends InstalacionMikrowisp {
  clienteDetalle?: ClienteDetalle | null
}

/**
 * Hook que trae todas las instalaciones y, para cada instalación con estado INSTALADO,
 * trae los detalles del cliente (incluyendo información de facturación).
 * Devuelve una lista de instalaciones con los datos embebidos.
 */
export const useInstalacionesConClientes = () => {
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Usar Zustand para instalaciones globales y persistentes
  const instalaciones = useInstalacionesStore((s) => s.instalaciones)
  const setInstalaciones = useInstalacionesStore((s) => s.setInstalaciones)

  const fetchClientePorCedula = async (cedula: string): Promise<ClienteDetalle | null> => {
    try {
      const requestBody = {
        token: API_TOKEN,
        cedula,
      }
      const response = await apiClient.post<GetClienteResponse>(
        ENDPOINTS.CLIENTE_DETALLES,
        requestBody
      )
      if (response.estado === 'exito' && response.datos && response.datos.length > 0) {
        return response.datos[0]
      }
      return null
    } catch (err) {
      console.error('Error al obtener cliente', cedula, err)
      return null
    }
  }

  const cargarInstalacionesConClientes = useCallback(async () => {
    setLoading(true)
    setLoadingMessage('Cargando instalaciones...')
    setError(null)
    try {
      console.log('[INICIO] Cargando instalaciones y clientes...')

      // 1. Obtener todas las instalaciones
      const requestBody = { token: API_TOKEN }
      const instalacionesResp = await apiClient.post<ListarInstalacionesResponse>(
        ENDPOINTS.LISTA_INSTALACIONES,
        requestBody
      )
      console.log('[API] Respuesta instalaciones:', instalacionesResp)

      if (
        instalacionesResp.estado !== 'exito' ||
        !instalacionesResp.instalaciones ||
        !Array.isArray(instalacionesResp.instalaciones)
      ) {
        throw new Error(
          instalacionesResp.error || instalacionesResp.mensaje || 'Error al listar instalaciones'
        )
      }

      const listaBase = instalacionesResp.instalaciones
      console.log('[OK] Instalaciones obtenidas:', listaBase.length)

      // 2. Obtener todas las cédulas únicas de instalaciones INSTALADO
      const cedulasUnicas = Array.from(
        new Set(
          listaBase
            .filter((inst) => inst.estate === 'INSTALADO' && inst.cedula)
            .map((inst) => inst.cedula)
        )
      )
      console.log('[OK] Cedulas únicas a consultar:', cedulasUnicas)

      // 3. Obtener detalles de todos los clientes en lotes (batch)
      const clienteMap: Record<string, ClienteDetalle | null> = {}
      const CONCURRENCY_LIMIT = 10
      let processed = 0
      for (let i = 0; i < cedulasUnicas.length; i += CONCURRENCY_LIMIT) {
        const batch = cedulasUnicas.slice(i, i + CONCURRENCY_LIMIT)
        console.log(`[BATCH] Consultando clientes ${i + 1} a ${i + batch.length} de ${cedulasUnicas.length}`)
        // Mostrar progreso en loading
        setLoadingMessage(`Cargando clientes ${i + 1} a ${i + batch.length} de ${cedulasUnicas.length}`)
        const resultados = await Promise.all(
          batch.map((cedula) => fetchClientePorCedula(cedula))
        )
        batch.forEach((cedula, idx) => {
          clienteMap[cedula] = resultados[idx]
        })
        processed += batch.length
        console.log(`[BATCH] Completados: ${processed} / ${cedulasUnicas.length}`)
      }

      // 4. Combinar datos SOLO cuando todo esté listo
      const instalacionesCompletas: InstalacionConCliente[] = listaBase.map((inst) => ({
        ...inst,
        clienteDetalle: inst.cedula ? clienteMap[inst.cedula] : undefined,
      }))
      console.log('[OK] Instalaciones completas con clientes:', instalacionesCompletas)

      // 5. Guardar en store global y localStorage
      setInstalaciones(instalacionesCompletas)
      setLoading(false)
      setLoadingMessage(null)
      return {
        status: true,
        instalaciones: instalacionesCompletas,
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setError(msg)
      setInstalaciones([])
      setLoading(false)
      setLoadingMessage(null)
      console.log('[ERROR]', msg)
      return {
        status: false,
        message: msg,
        instalaciones: [],
      }
    }
  }, [setInstalaciones])

  return {
    cargarInstalacionesConClientes,
    instalaciones,
    loading,
    loadingMessage,
    error,
    setInstalaciones, // Exponer por si se quiere manipular externamente
  }
} 