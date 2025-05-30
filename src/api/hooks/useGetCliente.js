import { useState } from 'react';
import { apiClient } from '../client';
import { API_TOKEN, ENDPOINTS } from '../config';
/**
 * Hook para obtener detalles del cliente por cédula
 */
export const useGetCliente = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    /**
     * Obtiene los detalles del cliente por cédula
     */
    const getClientePorCedula = async (cedula) => {
        setLoading(true);
        setError(null);
        setClientes([]);
        setClienteSeleccionado(null);
        try {
            const requestBody = {
                token: API_TOKEN,
                cedula,
            };
            const response = await apiClient.post(ENDPOINTS.CLIENTE_DETALLES, requestBody);
            if (response.estado === 'exito' &&
                response.datos &&
                Array.isArray(response.datos)) {
                setClientes(response.datos);
                // Si solo hay un cliente, lo seleccionamos automáticamente
                if (response.datos.length === 1) {
                    setClienteSeleccionado(response.datos[0]);
                }
                return {
                    success: true,
                    clientes: response.datos,
                    mensaje: `Se encontraron ${response.datos.length} cliente(s)`,
                };
            }
            else {
                const errorMsg = 'No se encontraron clientes con esa cédula';
                setError(errorMsg);
                return {
                    success: false,
                    mensaje: errorMsg,
                    clientes: [],
                };
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            setError(`Error de conexión: ${errorMessage}`);
            return {
                success: false,
                mensaje: errorMessage,
                clientes: [],
            };
        }
        finally {
            setLoading(false);
        }
    };
    /**
     * Selecciona un cliente de la lista de resultados
     */
    const seleccionarCliente = (cliente) => {
        setClienteSeleccionado(cliente);
    };
    return {
        getClientePorCedula,
        seleccionarCliente,
        clientes,
        clienteSeleccionado,
        loading,
        error,
        setClientes,
        setClienteSeleccionado,
    };
};
