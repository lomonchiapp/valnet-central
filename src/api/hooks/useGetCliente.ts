import { useState } from 'react'
import { apiClient } from '../client'
import { API_TOKEN, ENDPOINTS } from '../config'

// Interfaces para los datos del cliente
interface Servicio {
  id: number
  idperfil: number
  nodo: number
  costo: string
  ipap: string
  mac: string
  ip: string
  instalado: string
  pppuser: string
  ppppass: string
  tiposervicio: string
  status_user: string
  coordenadas: string
  direccion: string
  snmp_comunidad: string
  perfil: string
}

interface Facturacion {
  facturas_nopagadas: number
  total_facturas: string
}

export interface ClienteDetalle {
  id: number
  nombre: string
  estado: string
  correo: string
  telefono: string
  movil: string
  cedula: string
  pasarela: string
  codigo: string
  direccion_principal: string
  servicios: Servicio[]
  facturacion: Facturacion
}

interface GetClienteResponse {
  estado: string
  datos: ClienteDetalle[]
}

/**
 * Hook para obtener detalles del cliente por cédula
 */
export const useGetCliente = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientes, setClientes] = useState<ClienteDetalle[]>([])
  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<ClienteDetalle | null>(null)

  /**
   * Obtiene los detalles del cliente por cédula
   */
  const getClientePorCedula = async (cedula: string) => {
    setLoading(true)
    setError(null)
    setClientes([])
    setClienteSeleccionado(null)

    try {
      const requestBody = {
        token: API_TOKEN,
        cedula,
      }

      const response = await apiClient.post<GetClienteResponse>(
        ENDPOINTS.CLIENTE_DETALLES,
        requestBody
      )

      if (
        response.estado === 'exito' &&
        response.datos &&
        Array.isArray(response.datos)
      ) {
        setClientes(response.datos)

        // Si solo hay un cliente, lo seleccionamos automáticamente
        if (response.datos.length === 1) {
          setClienteSeleccionado(response.datos[0])
        }

        return {
          success: true,
          clientes: response.datos,
          mensaje: `Se encontraron ${response.datos.length} cliente(s)`,
        }
      } else {
        const errorMsg = 'No se encontraron clientes con esa cédula'
        setError(errorMsg)

        return {
          success: false,
          mensaje: errorMsg,
          clientes: [],
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido'
      setError(`Error de conexión: ${errorMessage}`)

      return {
        success: false,
        mensaje: errorMessage,
        clientes: [],
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Selecciona un cliente de la lista de resultados
   */
  const seleccionarCliente = (cliente: ClienteDetalle) => {
    setClienteSeleccionado(cliente)
  }

  return {
    getClientePorCedula,
    seleccionarCliente,
    clientes,
    clienteSeleccionado,
    loading,
    error,
    setClientes,
    setClienteSeleccionado,
  }
}
