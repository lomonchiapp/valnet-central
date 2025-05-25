import { useEffect, useState, useMemo } from "react";
import { useValnetState } from "@/context/global/useValnetState";
import { useCoordinacionState } from "@/context/global/useCoordinacionState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RefreshCw, Ticket as TicketIcon } from 'lucide-react';
import { useListarInstalaciones } from "@/api/hooks";
import type { InstalacionMikrowisp } from '@/types/interfaces/valnet/instalacionMikrowisp';
import type { TicketMikrowisp } from '@/types/interfaces/coordinacion/ticket';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Tickets() {
  const { instalaciones, setInstalaciones } = useValnetState();
  const { tickets, fetchTicketsFromApi } = useCoordinacionState();
  const { listarInstalaciones } = useListarInstalaciones();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<'abiertos' | 'cerrados' | 'respondidos'>('abiertos');
  const PAGE_SIZE = 20; // grupos por página
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  // Filtrado por estado seleccionado en la pestaña
  const statusFilteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const estado = t.estado.toLowerCase();
      if (tab === 'abiertos') return estado === 'abierto';
      if (tab === 'cerrados') return estado === 'cerrado';
      return estado === 'respondido';
    });
  }, [tickets, tab]);

  // Agrupar y ordenar tickets por cliente
  const groupedTickets = useMemo(() => {
    const map = new Map<string, { key: string; nombre: string; cedula: string; tickets: TicketMikrowisp[] }>();
    statusFilteredTickets.forEach((t) => {
      const key = t.idcliente;
      const inst = instalaciones.find((i) => String(i.id) === String(key));
      const nombre = inst?.cliente || t.solicitante || `Cliente ${key}`;
      const cedula = inst?.cedula || '';

      if (!map.has(key)) {
        map.set(key, { key, nombre, cedula, tickets: [] });
      }
      map.get(key)!.tickets.push(t);
    });

    const arr = Array.from(map.values());
    arr.sort((a, b) => {
      const latestA = a.tickets.reduce((max, t) => (t.fecha_soporte > max ? t.fecha_soporte : max), '');
      const latestB = b.tickets.reduce((max, t) => (t.fecha_soporte > max ? t.fecha_soporte : max), '');
      return latestB.localeCompare(latestA);
    });
    return arr;
  }, [statusFilteredTickets, instalaciones]);

  // Filtrado por búsqueda
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groupedTickets;
    const term = search.toLowerCase();
    return groupedTickets.filter((g) =>
      g.nombre.toLowerCase().includes(term) ||
      g.cedula.toLowerCase().includes(term) ||
      g.key.toLowerCase().includes(term)
    );
  }, [groupedTickets, search]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / PAGE_SIZE));
  const paginatedGroups = filteredGroups.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Efecto principal: cargar instalaciones y luego tickets
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        // Si aún no hay instalaciones en el estado global, obténlas
        let currentInsts: InstalacionMikrowisp[] = instalaciones;
        if (currentInsts.length === 0) {
          const resp = await listarInstalaciones();
          if (resp && resp.status && resp.instalaciones) {
            setInstalaciones(resp.instalaciones);
            currentInsts = resp.instalaciones;
          } else {
            throw new Error(resp.message || 'No se pudieron obtener instalaciones');
          }
        }
        const ids: (number | string)[] = Array.from(new Set(currentInsts.map((inst: InstalacionMikrowisp) => inst.id).filter((id): id is number => typeof id === 'number' && id > 0)));

        if (ids.length === 0) {
          throw new Error('No se encontraron IDs de clientes a consultar');
        }

        await fetchTicketsFromApi(ids);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[Tickets] Error al cargar datos:', err);
        setError('Error al cargar los tickets');
      } finally {
        setLoading(false);
      }
    };

    // Ejecutar rutina
    if (tickets.length === 0) {
      cargarDatos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets.length]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <RefreshCw className={loading ? "animate-spin h-5 w-5 text-primary" : "h-5 w-5 text-primary"} />
          <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
        </div>
        <Input
          placeholder="Buscar por nombre, cédula o id..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // Resetear paginación al filtrar
          }}
          className="max-w-sm"
        />
        {/* Tabs para filtrar por estado */}
        <Tabs
          value={tab}
          onValueChange={(value: string) => {
            if (value === 'abiertos' || value === 'cerrados' || value === 'respondidos') {
              setTab(value);
              setPage(1);
              setExpandedKey(null);
            }
          }}
          className="mb-4"
        >
          <TabsList>
            <TabsTrigger value="abiertos">Abiertos</TabsTrigger>
            <TabsTrigger value="cerrados">Cerrados</TabsTrigger>
            <TabsTrigger value="respondidos">Respondidos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {error && <div className="text-destructive">{error}</div>}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Cargando tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No se encontraron tickets.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {paginatedGroups.map((g) => (
              <Card key={g.key} className="shadow-md border border-muted-foreground/10">
                <CardHeader
                  className="flex flex-row items-center gap-3 pb-2 cursor-pointer"
                  onClick={() => setExpandedKey((prev) => (prev === g.key ? null : g.key))}
                >
                  <div className="bg-primary/10 rounded-full p-2">
                    <TicketIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold leading-tight">
                      {g.nombre}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Cédula: {g.cedula || 'N/A'} | Tickets: {g.tickets.length}
                    </CardDescription>
                  </div>
                </CardHeader>
                {expandedKey === g.key && (
                  <CardContent className="space-y-4 pt-0">
                    {g.tickets
                      .sort((a, b) => b.fecha_soporte.localeCompare(a.fecha_soporte))
                      .map((ticket) => (
                        <div key={ticket.id} className="border p-2 rounded-md space-y-1 text-sm bg-muted/50">
                          <div className="font-medium">{ticket.asunto}</div>
                          <div className="text-xs">Fecha: {ticket.fecha_soporte}</div>
                          <div className="text-xs">Estado: {ticket.estado}</div>
                        </div>
                      ))}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-6">
              <Button variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Anterior
              </Button>
              <span className="self-center text-sm">
                Página {page} de {totalPages}
              </span>
              <Button variant="secondary" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 