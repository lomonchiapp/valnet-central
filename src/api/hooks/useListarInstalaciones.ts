import { useState, useCallback } from 'react';
import { apiClient } from '../client';
import { API_TOKEN, ENDPOINTS } from '../config';
import type { InstalacionMikrowisp } from '../../types/interfaces/valnet/instalacionMikrowisp';

// Estructura de respuesta del API de Mikrowisp para instalaciones
interface ListarInstalacionesResponse {
  estado?: string; // 'exito' o 'error'
  instalaciones?: InstalacionMikrowisp[];
  mensaje?: string;
  error?: string;
}

/**
 * Hook para listar instalaciones desde Mikrowisp
 */
export const useListarInstalaciones = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [instalaciones, setInstalaciones] = useState<InstalacionMikrowisp[] | null>(null);

  const listarInstalaciones = useCallback(async () => {
    setLoading(true);
    setError(null);
    setInstalaciones(null);

    try {
      const requestBody = {
        token: API_TOKEN,
      };

      const response = await apiClient.post<ListarInstalacionesResponse>(
        ENDPOINTS.LISTA_INSTALACIONES,
        requestBody
      );

      const isSuccess = response.estado === 'exito';

      if (isSuccess && response.instalaciones && Array.isArray(response.instalaciones)) {
        setInstalaciones(response.instalaciones);
        return {
          status: true,
          instalaciones: response.instalaciones,
        };
      } else {
        if (isSuccess) {
          setInstalaciones([]);
          return {
            status: true,
            instalaciones: [],
          };
        } else {
          const errorMsg = response.error || response.mensaje || 'No se encontraron instalaciones API';
          setError(errorMsg);
          setInstalaciones([]);
          return {
            status: false,
            message: errorMsg,
            instalaciones: [],
          };
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error de conexión: ${errorMessage}`);
      setInstalaciones([]);
      return {
        status: false,
        message: errorMessage,
        instalaciones: [],
      };
    } finally {
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