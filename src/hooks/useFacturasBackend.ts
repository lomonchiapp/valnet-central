import { useState, useEffect, useCallback } from 'react'
import type { FacturaMikrowisp } from '@/types/interfaces/facturacion/factura'

// Tipos del backend
interface ClienteAgrupado {
  idcliente: string
  facturas: FacturaMikrowisp[]
  totalPagado: number
  estado: 'PAGADO' | 'PENDIENTE'
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalClientes: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface Statistics {
  totalFacturas: number
  totalPagado?: number
  totalPendiente?: number
}

interface BackendResponse {
  success: boolean
  data: {
    clientes: ClienteAgrupado[]
    pagination: PaginationInfo
    statistics: Statistics
  }
  timestamp: string
}

interface SyncStatus {
  lastSync: string
  totalFacturas: number
  totalClientes: number
  duration: number
  success: boolean
  error?: string
  syncType: 'pagadas' | 'pendientes'
}

// Hook principal
export function useFacturasBackend() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<Record<string, SyncStatus | null>>({})

  const baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'

  const handleRequest = async <T>(url: string, options?: RequestInit): Promise<T> => {
    try {
      const response = await fetch(`${baseUrl}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers
        },
        ...options
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Error en el servidor')
      }

      return data as T
    } catch (err) {
      console.error('❌ Error en request:', err)
      throw err
    }
  }

  // Obtener facturas pagadas
  const getFacturasPagadas = useCallback(async (
    page: number = 1,
    limit: number = 50,
    search: string = ''
  ): Promise<BackendResponse> => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      })

      const response = await handleRequest<BackendResponse>(
        `/api/facturas/pagadas?${params}`
      )

      console.log(`✅ ${response.data.clientes.length} clientes pagados cargados desde backend`)
      
      return response
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error cargando facturas pagadas: ${errorMsg}`)
      throw err
    } finally {
      setLoading(false)
    }
  }, [baseUrl])

  // Obtener facturas pendientes
  const getFacturasPendientes = useCallback(async (
    page: number = 1,
    limit: number = 50,
    search: string = ''
  ): Promise<BackendResponse> => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      })

      const response = await handleRequest<BackendResponse>(
        `/api/facturas/pendientes?${params}`
      )

      console.log(`✅ ${response.data.clientes.length} clientes pendientes cargados desde backend`)
      
      return response
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error cargando facturas pendientes: ${errorMsg}`)
      throw err
    } finally {
      setLoading(false)
    }
  }, [baseUrl])

  // Obtener cliente específico
  const getCliente = useCallback(async (
    clienteId: string,
    tipo: 'pagadas' | 'pendientes' = 'pagadas'
  ): Promise<ClienteAgrupado> => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ tipo })
      
      const response = await handleRequest<{
        success: boolean
        data: ClienteAgrupado
        timestamp: string
      }>(`/api/facturas/cliente/${clienteId}?${params}`)

      console.log(`✅ Cliente ${clienteId} cargado desde backend`)
      
      return response.data
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error cargando cliente ${clienteId}: ${errorMsg}`)
      throw err
    } finally {
      setLoading(false)
    }
  }, [baseUrl])

  // Obtener estado de sincronización
  const getSyncStatus = useCallback(async (): Promise<Record<string, SyncStatus | null>> => {
    try {
      const response = await handleRequest<{
        success: boolean
                 data: {
           status: Record<string, SyncStatus | null>
           server: {
             uptime: number
             memory: any
             version: string
           }
         }
        timestamp: string
      }>('/api/facturas/status')

      setSyncStatus(response.data.status)
      
      return response.data.status
      
    } catch (err) {
      console.error('❌ Error obteniendo estado de sync:', err)
      return {}
    }
  }, [baseUrl])

  // Forzar sincronización
  const forceSync = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      await handleRequest<{
        success: boolean
        message: string
        timestamp: string
      }>('/api/facturas/sync', {
        method: 'POST'
      })

      console.log('✅ Sincronización iniciada en backend')
      
      // Actualizar estado después de un delay
      setTimeout(() => {
        getSyncStatus()
      }, 2000)
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error iniciando sincronización: ${errorMsg}`)
      throw err
    } finally {
      setLoading(false)
    }
  }, [baseUrl, getSyncStatus])

  // Cargar estado inicial
  useEffect(() => {
    getSyncStatus()
  }, [getSyncStatus])

  return {
    // Estados
    loading,
    error,
    syncStatus,
    
    // Métodos
    getFacturasPagadas,
    getFacturasPendientes,
    getCliente,
    getSyncStatus,
    forceSync,
    
    // Utilidades
    clearError: () => setError(null)
  }
}

// Hook específico para facturas pagadas
export function useFacturasPagadas(
  page: number = 1,
  limit: number = 50,
  search: string = ''
) {
  const [data, setData] = useState<BackendResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { getFacturasPagadas } = useFacturasBackend()

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await getFacturasPagadas(page, limit, search)
      setData(response)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [getFacturasPagadas, page, limit, search])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    data,
    loading,
    error,
    refresh: loadData,
    clearError: () => setError(null)
  }
}

// Hook específico para facturas pendientes
export function useFacturasPendientes(
  page: number = 1,
  limit: number = 50,
  search: string = ''
) {
  const [data, setData] = useState<BackendResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { getFacturasPendientes } = useFacturasBackend()

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await getFacturasPendientes(page, limit, search)
      setData(response)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [getFacturasPendientes, page, limit, search])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    data,
    loading,
    error,
    refresh: loadData,
    clearError: () => setError(null)
  }
} 