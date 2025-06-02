import { useState, useCallback } from 'react';
import { apiClient } from '../client';
import { API_TOKEN, ENDPOINTS } from '../config';
/**
 * Hook para listar instalaciones desde Mikrowisp
 */
export const useListarInstalaciones = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [instalaciones, setInstalaciones] = useState(null);
    const listarInstalaciones = useCallback(async () => {
        setLoading(true);
        setError(null);
        setInstalaciones(null);
        try {
            const requestBody = {
                token: API_TOKEN,
            };
            const response = await apiClient.post(ENDPOINTS.LISTA_INSTALACIONES, requestBody);
            const isSuccess = response.estado === 'exito';
            if (isSuccess &&
                response.instalaciones &&
                Array.isArray(response.instalaciones)) {
                setInstalaciones(response.instalaciones);
                return {
                    status: true,
                    instalaciones: response.instalaciones,
                };
            }
            else {
                if (isSuccess) {
                    setInstalaciones([]);
                    return {
                        status: true,
                        instalaciones: [],
                    };
                }
                else {
                    const errorMsg = response.error ||
                        response.mensaje ||
                        'No se encontraron instalaciones API';
                    setError(errorMsg);
                    setInstalaciones([]);
                    return {
                        status: false,
                        message: errorMsg,
                        instalaciones: [],
                    };
                }
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(`Error de conexión: ${errorMessage}`);
            setInstalaciones([]);
            return {
                status: false,
                message: errorMessage,
                instalaciones: [],
            };
        }
        finally {
            setLoading(false);
        }
    }, []);
    return {
        listarInstalaciones,
        instalaciones,
        loading,
        error,
        setInstalaciones,
    };
};
