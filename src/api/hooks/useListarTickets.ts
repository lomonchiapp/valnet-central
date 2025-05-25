/* eslint-disable no-console */
import { useState, useCallback } from 'react';
import { useValnetState } from '@/context/global/useValnetState';
import { useListarInstalaciones } from './useListarInstalaciones';
import type { InstalacionMikrowisp } from '@/types/interfaces/valnet/instalacionMikrowisp';
import { listarTicketsService } from '@/api/lib/ticketService';
import type { TicketMikrowisp } from '@/types/interfaces/coordinacion/ticket';

export const useListarTickets = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<TicketMikrowisp[]>([]);
  const { instalaciones } = useValnetState();
  const { listarInstalaciones } = useListarInstalaciones();

  const listarTickets = useCallback(async (idClientes?: (number | string)[]) => {
    setLoading(true);
    setError(null);
    setTickets([]);
    let ids: (number | string)[] = [];
    try {
      if (idClientes && idClientes.length > 0) {
        console.log('[Tickets] Usando idClientes recibidos:', idClientes);
        ids = idClientes;
      } else if (instalaciones && instalaciones.length > 0) {
        ids = instalaciones.map((inst: InstalacionMikrowisp) => inst.id).filter(Boolean);
        console.log('[Tickets] Usando id de instalaciones del estado global:', ids);
      } else {
        console.log('[Tickets] No hay instalaciones en el estado global, consultando API...');
        const result = await listarInstalaciones();
        if (result && result.instalaciones && result.instalaciones.length > 0) {
          ids = result.instalaciones.map((inst: InstalacionMikrowisp) => inst.id).filter(Boolean);
          console.log('[Tickets] Instalaciones obtenidas de la API:', ids);
        } else {
          console.log('[Tickets] No se encontraron instalaciones en la API.');
        }
      }
      if (!ids || ids.length === 0) {
        setError('No se encontraron clientes para listar tickets.');
        setTickets([]);
        console.log('[Tickets] No se encontraron clientes para listar tickets.');
        return { status: false, message: 'No se encontraron clientes para listar tickets.', tickets: [] };
      }
      const result = await listarTicketsService({ idClientes: ids });
      if (result.status) {
        setTickets(result.tickets);
      } else {
        setError(result.message || 'Error obteniendo tickets');
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error de conexión: ${errorMessage}`);
      setTickets([]);
      console.log('[Tickets] Error general en listarTickets:', err);
      return { status: false, message: errorMessage, tickets: [] };
    } finally {
      setLoading(false);
    }
  }, [instalaciones, listarInstalaciones]);

  return {
    listarTickets,
    tickets,
    loading,
    error,
    setTickets,
  };
};

// Exportar la función pura para su uso fuera de componentes
export { listarTicketsService as listarTicketsFn }; 