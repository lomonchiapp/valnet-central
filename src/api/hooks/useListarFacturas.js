import { useState, useCallback } from 'react';
import { apiClient } from '../client';
import { API_TOKEN, ENDPOINTS } from '../config';
/**
 * Hook para listar facturas desde Mikrowisp
 */
export const useListarFacturas = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [facturas, setFacturas] = useState(null);
    const listarFacturas = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        setFacturas(null); // Indicate loading has started / state is indeterminate
        try {
            const requestBody = {
                token: API_TOKEN,
                limit: params.limit || 10,
                estado: params.estado !== undefined ? params.estado : 1,
                idcliente: params.idcliente || '',
            };
            // console.log('Enviando solicitud a:', `${API_TOKEN}${ENDPOINTS.FACTURAS}`);
            // console.log('Datos de solicitud:', JSON.stringify(requestBody));
            const response = await apiClient.post(ENDPOINTS.FACTURAS, requestBody);
            // console.log('Respuesta completa recibida:', response);
            const isSuccess = response.estado === 'exito' || response.status === true;
            if (isSuccess &&
                response.facturas &&
                Array.isArray(response.facturas)) {
                // console.log('Facturas encontradas:', response.facturas.length);
                // Log the estado of the first invoice to check its exact string value
                if (response.facturas.length > 0) {
                    console.log('API returned invoice status (first invoice):', response.facturas[0].estado);
                }
                setFacturas(response.facturas);
                return {
                    status: true,
                    facturas: response.facturas,
                };
            }
            else {
                if (isSuccess) {
                    // console.log('Respuesta exitosa pero sin facturas');
                    setFacturas([]); // Loaded, but empty
                    return {
                        status: true,
                        facturas: [],
                    };
                }
                else {
                    const errorMsg = response.error ||
                        response.message ||
                        'No se encontraron facturas API';
                    // console.error('Error en respuesta API:', errorMsg);
                    setError(errorMsg);
                    setFacturas([]); // Load attempt failed, result is empty list
                    return {
                        status: false,
                        message: errorMsg,
                        facturas: [],
                    };
                }
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            // console.error('Error en solicitud API:', err);
            setError(`Error de conexión: ${errorMessage}`);
            setFacturas([]); // Connection error, result is empty list
            return {
                status: false,
                message: errorMessage,
                facturas: [],
            };
        }
        finally {
            setLoading(false);
        }
    }, []);
    return {
        listarFacturas,
        facturas,
        loading,
        error,
        setFacturas,
    };
};
