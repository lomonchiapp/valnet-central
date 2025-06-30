import { useEffect, useMemo, useState } from 'react'
import { useGetCliente } from '@/api/hooks/useGetCliente'
import type { FacturaMikrowisp } from '@/types/interfaces/facturacion/factura'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Main } from '@/components/layout/main'
import { ChevronLeft, ChevronRight, Search, FileText, Printer, Eye, TrendingUp, Users, DollarSign, Clock } from 'lucide-react'
import type { ClienteDetalle } from '@/api/hooks/useGetCliente'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle
} from '@/components/ui/sheet'
import { useFacturasPagadas, useFacturasBackend } from '@/hooks/useFacturasBackend'

interface ClienteAgrupado {
  idcliente: string
  facturas: FacturaMikrowisp[]
  totalPagado: number
  estado: 'PAGADO' | 'PENDIENTE'
}

export default function FacturasPagadas() {
  const { getClientePorId } = useGetCliente()
  const [busqueda, setBusqueda] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [elementosPorPagina, setElementosPorPagina] = useState(10)
  const [minFacturas, setMinFacturas] = useState<number | ''>('')
  const [maxFacturas, setMaxFacturas] = useState<number | ''>('')
  
  // Estados del nuevo backend
  const { data: backendData, loading, error } = useFacturasPagadas(paginaActual, 50, busqueda)
  const { syncStatus } = useFacturasBackend()
  
  // Estado para cachear info de clientes
  const [clientesInfo, setClientesInfo] = useState<Record<string, ClienteDetalle>>({})
  // Estado para el sheet de detalle de facturas
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteAgrupado | null>(null)
  const [sheetAbierto, setSheetAbierto] = useState(false)

  // Obtener clientes agrupados del backend
  const clientesAgrupados: ClienteAgrupado[] = useMemo(() => {
    return backendData?.data.clientes || []
  }, [backendData])

  // Filtrar por búsqueda
  const clientesFiltrados = useMemo(() => {
    let filtrados = clientesAgrupados
    if (busqueda.trim()) {
      const term = busqueda.toLowerCase()
      filtrados = filtrados.filter(c => {
        const idMatch = String(c.idcliente).toLowerCase().includes(term)
        const nombreMatch = clientesInfo[c.idcliente]?.nombre?.toLowerCase().includes(term)
        return idMatch || nombreMatch
      })
    }
    if (minFacturas !== '' && !isNaN(Number(minFacturas))) {
      filtrados = filtrados.filter(c => c.facturas.length >= Number(minFacturas))
    }
    if (maxFacturas !== '' && !isNaN(Number(maxFacturas))) {
      filtrados = filtrados.filter(c => c.facturas.length <= Number(maxFacturas))
    }
    return filtrados
  }, [clientesAgrupados, busqueda, minFacturas, maxFacturas, clientesInfo])

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

  // Función para abrir el detalle de facturas
  const abrirDetalleFacturas = (cliente: ClienteAgrupado) => {
    setClienteSeleccionado(cliente)
    setSheetAbierto(true)
  }

  // Función para ver/imprimir factura individual
  const verFactura = (factura: FacturaMikrowisp) => {
    // Aquí puedes implementar la lógica para ver/imprimir la factura
    console.log('Ver factura:', factura)
    alert(`Ver factura ID: ${factura.id}`)
  }

  const imprimirFactura = (factura: FacturaMikrowisp) => {
    // Aquí puedes implementar la lógica para imprimir la factura
    console.log('Imprimir factura:', factura)
    alert(`Imprimir factura ID: ${factura.id}`)
  }

  return (
    <Main>
      <div className='mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-bold'>Facturas Pagadas</h2>
          <p className='text-muted-foreground'>Visualiza y gestiona las facturas pagadas agrupadas por cliente.</p>
        </div>
        <div className='flex gap-2 flex-wrap'>
          <Badge className='bg-green-100 text-green-800'>
            <Users className="w-3 h-3 mr-1" />
            Clientes: {backendData?.data.pagination.totalClientes || 0}
          </Badge>
          <Badge className='bg-blue-100 text-blue-800'>
            <DollarSign className="w-3 h-3 mr-1" />
            Total: {(backendData?.data.statistics.totalPagado || 0).toLocaleString('es-DO', { style: 'currency', currency: 'DOP' })}
          </Badge>
          <Badge className='bg-purple-100 text-purple-800'>
            <FileText className="w-3 h-3 mr-1" />
            Facturas: {backendData?.data.statistics.totalFacturas || 0}
          </Badge>
          {loading && (
            <Badge className='bg-yellow-100 text-yellow-800 animate-pulse'>
              <Clock className="w-3 h-3 mr-1" />
              Cargando desde backend...
            </Badge>
          )}
          {syncStatus.pagadas && (
            <Badge className='bg-green-50 text-green-700 text-xs'>
              <TrendingUp className="w-3 h-3 mr-1" />
              Sync: {new Date(syncStatus.pagadas.lastSync).toLocaleTimeString()}
            </Badge>
          )}
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
              <TableHead>Total Pagado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && clientesPaginados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className='text-center py-8'>
                  <div className="flex flex-col items-center gap-2">
                    <span>🚀 Carga robusta en progreso...</span>
                    <span className="text-sm text-gray-600">
                      Cliente {paginaActual} de {totalPaginas}
                    </span>
                    <span className="text-xs text-gray-500">
                      Estrategia: Consulta individual por cliente
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4} className='text-center text-red-500 py-8'>{error}</TableCell>
              </TableRow>
            ) : clientesPaginados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className='text-center text-muted-foreground py-8'>No se encontraron clientes con los filtros seleccionados</TableCell>
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
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-blue-100 hover:text-blue-800 transition-colors px-3 py-1 font-semibold"
                      onClick={() => abrirDetalleFacturas(cliente)}
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      {cliente.facturas.length} facturas
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className='font-bold text-green-600'>
                      {Number(cliente.totalPagado).toLocaleString('es-DO', { style: 'currency', currency: 'DOP' })}
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

      {/* Sheet para detalle de facturas */}
      <Sheet open={sheetAbierto} onOpenChange={setSheetAbierto}>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Detalle de Facturas - Cliente {clienteSeleccionado?.idcliente}
            </SheetTitle>
            <SheetDescription>
              {clienteSeleccionado && clientesInfo[clienteSeleccionado.idcliente] && (
                <span>Cliente: {clientesInfo[clienteSeleccionado.idcliente].nombre}</span>
              )}
            </SheetDescription>
          </SheetHeader>
          
          {clienteSeleccionado && (
            <div className="mt-6">
              {/* Resumen */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{clienteSeleccionado.facturas.length}</div>
                  <div className="text-sm text-slate-600">Total Facturas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {clienteSeleccionado.totalPagado.toLocaleString('es-DO', { style: 'currency', currency: 'DOP' })}
                  </div>
                  <div className="text-sm text-slate-600">Total Pagado</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {(clienteSeleccionado.totalPagado / clienteSeleccionado.facturas.length).toLocaleString('es-DO', { style: 'currency', currency: 'DOP' })}
                  </div>
                  <div className="text-sm text-slate-600">Promedio por Factura</div>
                </div>
              </div>

              {/* Tabla de facturas */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-100">
                      <TableHead>ID Factura</TableHead>
                      <TableHead>Fecha Emisión</TableHead>
                      <TableHead>Fecha Vencimiento</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Fecha Pago</TableHead>
                      <TableHead>Forma Pago</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clienteSeleccionado.facturas.map((factura) => (
                      <TableRow key={factura.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium">{factura.id}</TableCell>
                        <TableCell>{new Date(factura.emitido).toLocaleDateString('es-DO')}</TableCell>
                        <TableCell>{new Date(factura.vencimiento).toLocaleDateString('es-DO')}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {Number(factura.total).toLocaleString('es-DO', { style: 'currency', currency: 'DOP' })}
                        </TableCell>
                        <TableCell>
                          {factura.fechapago ? new Date(factura.fechapago).toLocaleDateString('es-DO') : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {factura.formapago || 'No especificado'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => verFactura(factura)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => imprimirFactura(factura)}
                              className="h-8 w-8 p-0"
                            >
                              <Printer className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Main>
  )
} 