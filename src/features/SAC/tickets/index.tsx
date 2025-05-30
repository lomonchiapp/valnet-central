import { useEffect, useState, useMemo } from 'react'
import { RefreshCw, Ticket as TicketIcon } from 'lucide-react'
import { useCoordinacionState } from '@/context/global/useCoordinacionState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function Tickets() {
  const { tickets, subscribeToTickets, brigadas } = useCoordinacionState()
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [filterDepartamento, setFilterDepartamento] = useState('')
  const [filterTecnico, setFilterTecnico] = useState('')
  const [filterAsunto, setFilterAsunto] = useState('')
  const [filterRemitente, setFilterRemitente] = useState('')
  const [filterId, setFilterId] = useState('')
  const pageSize = 10

  // Obtener departamentos y tecnicos únicos para los selects
  const departamentos = useMemo(
    () => Array.from(new Set(tickets.map((t) => t.dp).filter(Boolean))),
    [tickets]
  )

  // Filtro por columna
  const filteredTickets = tickets.filter((ticket) => {
    return (
      (!filterId || ticket.id.toLowerCase().includes(filterId.toLowerCase())) &&
      (!filterDepartamento || ticket.dp === filterDepartamento) &&
      (!filterRemitente ||
        ticket.solicitante
          .toLowerCase()
          .includes(filterRemitente.toLowerCase())) &&
      (!filterAsunto ||
        ticket.asunto.toLowerCase().includes(filterAsunto.toLowerCase())) &&
      (!filterTecnico ||
        (ticket.idbrigada || 'No asignado') === filterTecnico)
    )
  })

  const totalPages = Math.ceil(filteredTickets.length / pageSize)
  const paginatedTickets = filteredTickets.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  useEffect(() => {
    setLoading(true)
    const unsubscribe = subscribeToTickets()
    setLoading(false)
    return () => unsubscribe()
  }, [subscribeToTickets])

  const formatDate = (dateValue: string | Date | undefined) => {
    if (!dateValue) return 'N/A'
    try {
      if (typeof dateValue === 'string' || dateValue instanceof Date) {
        return new Intl.DateTimeFormat('es-DO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(new Date(dateValue))
      }
      return 'N/A'
    } catch {
      return 'N/A'
    }
  }

  return (
    <div className='container mx-auto py-8 px-4 md:px-8 lg:px-16'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8'>
        <div className='flex items-center gap-3'>
          <RefreshCw
            className={
              loading
                ? 'animate-spin h-6 w-6 text-primary'
                : 'h-6 w-6 text-primary'
            }
          />
          <h1 className='text-3xl md:text-4xl font-bold tracking-tight'>
            Tickets
          </h1>
        </div>
        <Button variant='default' className='h-10 px-6'>
          + Nuevo
        </Button>
      </div>
      <div className='bg-white rounded-xl shadow-md p-4 md:p-8'>
        {/* Filtros arriba de la tabla */}
        <div className='flex flex-wrap gap-4 mb-4'>
          <Input
            placeholder='Buscar N° Ticket...'
            value={filterId}
            onChange={(e) => setFilterId(e.target.value)}
            className='w-36'
          />
          <select
            value={filterDepartamento}
            onChange={(e) => setFilterDepartamento(e.target.value)}
            className='border rounded px-2 py-1 text-sm'
          >
            <option value=''>Todos los departamentos</option>
            {departamentos.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>
          <Input
            placeholder='Buscar remitente...'
            value={filterRemitente}
            onChange={(e) => setFilterRemitente(e.target.value)}
            className='w-44'
          />
          <Input
            placeholder='Buscar asunto...'
            value={filterAsunto}
            onChange={(e) => setFilterAsunto(e.target.value)}
            className='w-44'
          />
          <select
            value={filterTecnico}
            onChange={(e) => setFilterTecnico(e.target.value)}
            className='border rounded px-2 py-1 text-sm'
          >
            <option value=''>Todas las brigadas</option>
            {brigadas.map((brig) => (
              <option key={brig.id} value={brig.nombre}>
                {brig.nombre}
              </option>
            ))}
          </select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-20'>N°</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Remitente</TableHead>
              <TableHead>Asunto</TableHead>
              <TableHead>Brigada</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className='text-right'>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>
                  <Button
                    variant='outline'
                    size='icon'
                    className='mr-2 h-6 w-6 p-0'
                  >
                    +
                  </Button>
                  <span className='font-mono text-xs'>{ticket.id}</span>
                </TableCell>
                <TableCell>
                  <Badge variant='secondary' className='text-xs px-2 py-1'>
                    {ticket.dp || 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell>{ticket.solicitante}</TableCell>
                <TableCell>{ticket.asunto}</TableCell>
                <TableCell>{ticket.idbrigada || 'No asignado'}</TableCell>
                <TableCell>{formatDate(ticket.fechavisita)}</TableCell>
                <TableCell className='text-right'>
                  <Button variant='ghost' size='icon' title='Ver detalles'>
                    <TicketIcon className='h-4 w-4' />
                  </Button>
                  {/* Aquí puedes agregar más acciones: editar, eliminar, etc. */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Paginación */}
        {totalPages > 1 && (
          <div className='flex justify-center gap-4 mt-8'>
            <Button
              variant='secondary'
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <span className='self-center text-base'>
              Página {page} de {totalPages}
            </span>
            <Button
              variant='secondary'
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
