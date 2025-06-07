import { useEffect, useMemo, useState } from 'react'
import { useListarFacturas } from '@/api/hooks/useListarFacturas'
import { useGetCliente } from '@/api/hooks/useGetCliente'
import type { FacturaMikrowisp } from '@/types/interfaces/facturacion/factura'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Main } from '@/components/layout/main'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import type { ClienteDetalle } from '@/api/hooks/useGetCliente'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

interface ClienteAgrupado {
  idcliente: string
  facturas: FacturaMikrowisp[]
  totalAdeudado: number
  estado: 'AL_DIA' | 'DEUDOR'
}

export default function FacturasPorCliente() {
  const { listarFacturas, facturas, loading, error } = useListarFacturas()
  const { getClientePorId } = useGetCliente()
  const [busqueda, setBusqueda] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [elementosPorPagina, setElementosPorPagina] = useState(10)
  const [minFacturas, setMinFacturas] = useState<number | ''>('')
  const [maxFacturas, setMaxFacturas] = useState<number | ''>('')
  // Estado para cachear info de clientes
  const [clientesInfo, setClientesInfo] = useState<Record<string, ClienteDetalle>>({})

  useEffect(() => {
    listarFacturas({ limit: 2500, estado: 1 })
  }, [listarFacturas])

  // Agrupar facturas por cliente
  const clientesAgrupados: ClienteAgrupado[] = useMemo(() => {
    if (!facturas) return []
    const agrupado: Record<string, ClienteAgrupado> = {}
    facturas.forEach(factura => {
      const id = factura.idcliente || 'SIN_ID'
      if (!agrupado[id]) {
        agrupado[id] = {
          idcliente: id,
          facturas: [],
          totalAdeudado: 0,
          estado: 'DEUDOR', // Todos son deudores
        }
      }
      agrupado[id].facturas.push(factura)
      agrupado[id].totalAdeudado += Number(factura.total) || 0
    })
    // Ordenar de mayor a menor por cantidad de facturas
    return Object.values(agrupado).sort((a, b) => b.facturas.length - a.facturas.length)
  }, [facturas])

  // Filtrar por búsqueda
  const clientesFiltrados = useMemo(() => {
    let filtrados = clientesAgrupados
    if (busqueda.trim()) {
      const term = busqueda.toLowerCase()
      filtrados = filtrados.filter(c =>
        c.idcliente.toLowerCase().includes(term)
      )
    }
    if (minFacturas !== '' && !isNaN(Number(minFacturas))) {
      filtrados = filtrados.filter(c => c.facturas.length >= Number(minFacturas))
    }
    if (maxFacturas !== '' && !isNaN(Number(maxFacturas))) {
      filtrados = filtrados.filter(c => c.facturas.length <= Number(maxFacturas))
    }
    return filtrados
  }, [clientesAgrupados, busqueda, minFacturas, maxFacturas])

  // Paginación
  const totalPaginas = Math.ceil(clientesFiltrados.length / elementosPorPagina)
  const clientesPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * elementosPorPagina
    return clientesFiltrados.slice(inicio, inicio + elementosPorPagina)
  }, [clientesFiltrados, paginaActual, elementosPorPagina])

  // Obtener info de clientes de la página actual
  useEffect(() => {
    const fetchClientes = async () => {
      const nuevos: Record<string, ClienteDetalle> = {}
      await Promise.all(
        clientesPaginados.map(async (c) => {
          if (!clientesInfo[c.idcliente]) {
            try {
              const res = await getClientePorId(Number(c.idcliente))
              if (res && res.clientes && res.clientes[0]) {
                nuevos[c.idcliente] = res.clientes[0]
              }
            } catch {
              // Puedes loguear el error si lo deseas
            }
          }
        })
      )
      if (Object.keys(nuevos).length > 0) {
        setClientesInfo((prev) => ({ ...prev, ...nuevos }))
      }
    }
    if (clientesPaginados.length > 0) {
      fetchClientes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientesPaginados])

  // Estadísticas
  const totalDeudores = clientesAgrupados.length
  const deudaTotal = clientesAgrupados.reduce((sum, c) => sum + (Number(c.totalAdeudado) || 0), 0)

  return (
    <Main>
      <div className='mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-bold'>Facturas por Cliente</h2>
          <p className='text-muted-foreground'>Visualiza y gestiona las facturas agrupadas por cliente. Todos los clientes listados son deudores.</p>
        </div>
        <div className='flex gap-2 flex-wrap'>
          <Badge className='bg-red-100 text-red-800'>Deudores: {totalDeudores}</Badge>
          <Badge className='bg-blue-100 text-blue-800'>Total deuda: {deudaTotal.toLocaleString('es-DO', { style: 'currency', currency: 'DOP' })}</Badge>
        </div>
      </div>

      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4'>
        <div className='flex flex-col md:flex-row gap-2 w-full md:w-auto items-center'>
          <div className='relative w-full md:w-80'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4' />
            <Input
              placeholder='Buscar por ID de cliente...'
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className='pl-10 pr-4 py-2'
            />
          </div>
          <Input
            type='number'
            min={1}
            value={minFacturas}
            onChange={e => setMinFacturas(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder='Mín. facturas'
            className='w-32'
          />
          <Input
            type='number'
            min={1}
            value={maxFacturas}
            onChange={e => setMaxFacturas(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder='Máx. facturas'
            className='w-32'
          />
        </div>
        <div className='flex gap-2'></div>
      </div>

      <div className='border rounded-lg overflow-x-auto bg-white shadow-sm'>
        <Table>
          <TableHeader className='bg-gray-50'>
            <TableRow>
              <TableHead>ID Cliente</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Facturas</TableHead>
              <TableHead>Deuda Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className='text-center py-8'>Cargando facturas...</TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className='text-center text-red-500 py-8'>{error}</TableCell>
              </TableRow>
            ) : clientesPaginados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='text-center text-muted-foreground py-8'>No se encontraron clientes con los filtros seleccionados</TableCell>
              </TableRow>
            ) : (
              clientesPaginados.map(cliente => (
                <TableRow key={cliente.idcliente} className='hover:bg-gray-50'>
                  <TableCell className='font-medium'>{cliente.idcliente}</TableCell>
                  <TableCell>
                    {clientesInfo[cliente.idcliente] ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className='text-primary underline hover:text-primary/80 font-medium outline-none'>
                            {clientesInfo[cliente.idcliente].nombre}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent align='start'>
                          <div className='space-y-1'>
                            <div className='font-bold text-lg'>{clientesInfo[cliente.idcliente].nombre}</div>
                            <div><span className='font-medium'>Cédula:</span> {clientesInfo[cliente.idcliente].cedula}</div>
                            <div><span className='font-medium'>Dirección:</span> {clientesInfo[cliente.idcliente].direccion_principal}</div>
                            <div><span className='font-medium'>Correo:</span> {clientesInfo[cliente.idcliente].correo}</div>
                            <div><span className='font-medium'>Teléfono:</span> {clientesInfo[cliente.idcliente].telefono}</div>
                            <div><span className='font-medium'>Móvil:</span> {clientesInfo[cliente.idcliente].movil}</div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <span className='text-muted-foreground'>Cargando...</span>
                    )}
                  </TableCell>
                  <TableCell>{cliente.facturas.length}</TableCell>
                  <TableCell>
                    <span className={`font-bold ${cliente.totalAdeudado > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {Number(cliente.totalAdeudado).toLocaleString('es-DO', { style: 'currency', currency: 'DOP' })}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className='flex items-center justify-between px-4 py-3 border-t bg-gray-50'>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-muted-foreground'>Mostrar:</span>
              <select
                value={elementosPorPagina}
                onChange={e => { setElementosPorPagina(Number(e.target.value)); setPaginaActual(1) }}
                className='border rounded px-2 py-1 text-sm'
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className='text-sm text-muted-foreground'>por página</span>
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className='p-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <ChevronLeft className='w-4 h-4' />
              </button>
              <span className='text-sm'>Página {paginaActual} de {totalPaginas}</span>
              <button
                onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
                className='p-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <ChevronRight className='w-4 h-4' />
              </button>
            </div>
          </div>
        )}
      </div>
    </Main>
  )
} 