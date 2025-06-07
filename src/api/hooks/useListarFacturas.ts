import { useState, useCallback } from 'react'
import type { FacturaMikrowisp } from '../../types/interfaces/facturacion/factura'
import { apiClient } from '../client'
import { API_TOKEN, ENDPOINTS } from '../config'

interface ListarFacturasParams {
  limit?: number
  estado?: number
  idcliente?: string
}

// Estructura de respuesta del API de Mikrowisp
interface ListarFacturasResponse {
  estado?: string // 'exito' o 'error'
  status?: boolean
  facturas?: FacturaMikrowisp[]
  message?: string
  error?: string
}

/**
 * Hook para listar facturas desde Mikrowisp
 * 0 = Pagadas, 1 = No pagadas, 2 = Anuladas, vacio = Cualquier estado
 */
export const useListarFacturas = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [facturas, setFacturas] = useState<FacturaMikrowisp[] | null>(null)

  const listarFacturas = useCallback(
    async (params: ListarFacturasParams = {}) => {
      setLoading(true)
      setError(null)
      setFacturas(null) // Indicate loading has started / state is indeterminate

      try {
        const requestBody = {
          token: API_TOKEN,
          limit: params.limit || 10,
          estado: params.estado !== undefined ? params.estado : 1,
          idcliente: params.idcliente || '',
        }

        // console.log('Enviando solicitud a:', `${API_TOKEN}${ENDPOINTS.FACTURAS}`);
        // console.log('Datos de solicitud:', JSON.stringify(requestBody));

        const response = await apiClient.post<ListarFacturasResponse>(
          ENDPOINTS.FACTURAS,
          requestBody
        )

        // console.log('Respuesta completa recibida:', response);

        const isSuccess =
          response.estado === 'exito' || response.status === true

        if (
          isSuccess &&
          response.facturas &&
          Array.isArray(response.facturas)
        ) {
          // console.log('Facturas encontradas:', response.facturas.length);
          // Log the estado of the first invoice to check its exact string value
          if (response.facturas.length > 0) {
            console.log(
              'API returned invoice status (first invoice):',
              response.facturas[0].estado
            )
          }
          setFacturas(response.facturas)
          return {
            status: true,
            facturas: response.facturas,
          }
        } else {
          if (isSuccess) {
            // console.log('Respuesta exitosa pero sin facturas');
            setFacturas([]) // Loaded, but empty
            return {
              status: true,
              facturas: [],
            }
          } else {
            const errorMsg =
              response.error ||
              response.message ||
              'No se encontraron facturas API'
            // console.error('Error en respuesta API:', errorMsg);
            setError(errorMsg)
            setFacturas([]) // Load attempt failed, result is empty list
            return {
              status: false,
              message: errorMsg,
              facturas: [],
            }
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error desconocido'
        // console.error('Error en solicitud API:', err);
        setError(`Error de conexión: ${errorMessage}`)
        setFacturas([]) // Connection error, result is empty list
        return {
          status: false,
          message: errorMessage,
          facturas: [],
        }
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    listarFacturas,
    facturas,
    loading,
    error,
    setFacturas,
  }
}
