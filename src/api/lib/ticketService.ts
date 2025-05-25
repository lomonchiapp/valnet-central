import { apiClient } from '../client';
import { API_TOKEN, ENDPOINTS } from '../config';
import type { TicketMikrowisp } from '@/types/interfaces/coordinacion/ticket';
import type { InstalacionMikrowisp } from '@/types/interfaces/valnet/instalacionMikrowisp';

/* eslint-disable no-console */

interface TicketApiResponse {
  estado: string;
  mensaje?: string;
  data?: {
    abiertos: number;
    cerrados: number;
    respondidos: number;
    respuesta_cliente: number;
    tickets: TicketMikrowisp[];
  };
}

/**
 * Función **pura** (sin dependencias de React) para obtener tickets desde la API de Mikrowisp.
 * Puede recibir explícitamente los `idClientes` o bien un arreglo de `instalaciones` del cual
 * se extraerán los IDs. Si ninguno está disponible retornará un estado *false*.
 */
export const listarTicketsService = async (
  params: {
    idClientes?: (number | string)[];
    instalaciones?: InstalacionMikrowisp[];
  } = {}
): Promise<{ status: boolean; tickets: TicketMikrowisp[]; message?: string }> => {
  const { idClientes, instalaciones } = params;

  let ids: (number | string)[] = [];

  if (idClientes && idClientes.length > 0) {
    ids = idClientes;
  } else if (instalaciones && instalaciones.length > 0) {
    ids = instalaciones.map((inst) => inst.id).filter(Boolean);
  }

  if (ids.length === 0) {
    return {
      status: false,
      tickets: [],
      message: 'No se encontraron clientes para listar tickets.',
    };
  }

  try {
    // Requests concurrentes para cada cliente
    const requests = ids.map(async (idcliente) => {
      const body = { token: API_TOKEN, idcliente: String(idcliente), currencyCode: 'DOP' };
      try {
        const response = await apiClient.post<TicketApiResponse>(ENDPOINTS.CLIENTE_TICKETS, body);
        if (
          response.estado === 'exito' &&
          response.data &&
          Array.isArray(response.data.tickets)
        ) {
          return response.data.tickets.map((t) => ({ ...t, idcliente: String(idcliente) }));
        }
      } catch (error) {
        // En caso de error con un cliente, continuamos con los demás
        console.error(`[TicketsService] Error obteniendo tickets para cliente ${idcliente}:`, error);
      }
      return [];
    });

    const results = await Promise.all(requests);
    const allTickets = results.flat();
    return { status: true, tickets: allTickets };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return { status: false, tickets: [], message };
  }
}; 