import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Main } from '@/components/layout/main'
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  FileText, 
  Users, 
  DollarSign, 
  Clock, 
  TrendingUp,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { useFacturasPagadas, useFacturasBackend } from '@/hooks/useFacturasBackend'

export default function FacturasPagadasBackend() {
  const [busqueda, setBusqueda] = useState('')
  const [paginaActual, setPaginaActual] = useState(1)
  const [elementosPorPagina] = useState(20)

  // Hook del backend
  const { data: backendData, loading, error, refresh } = useFacturasPagadas(
    paginaActual, 
    elementosPorPagina, 
    busqueda
  )
  
  const { syncStatus, forceSync, loading: syncLoading } = useFacturasBackend()

  const clientesAgrupados = backendData?.data.clientes || []
  const pagination = backendData?.data.pagination
  const statistics = backendData?.data.statistics

  return (
    <Main>
      {/* Header con estadísticas */}
      <div className='mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-bold'>💰 Facturas Pagadas</h2>
          <p className='text-muted-foreground'>
            Visualiza facturas pagadas cargadas desde el backend optimizado
          </p>
        </div>
        
        <div className='flex gap-2 flex-wrap items-center'>
          <Badge className='bg-green-100 text-green-800'>
            <Users className="w-3 h-3 mr-1" />
            {pagination?.totalClientes || 0} clientes
          </Badge>
          <Badge className='bg-blue-100 text-blue-800'>
            <DollarSign className="w-3 h-3 mr-1" />
            {(statistics?.totalPagado || 0).toLocaleString('es-DO', { 
              style: 'currency', 
              currency: 'DOP' 
            })}
          </Badge>
          <Badge className='bg-purple-100 text-purple-800'>
            <FileText className="w-3 h-3 mr-1" />
            {statistics?.totalFacturas || 0} facturas
          </Badge>
          
          {/* Estado de sincronización */}
          {syncStatus.pagadas && (
            <Badge className='bg-green-50 text-green-700 text-xs'>
              <TrendingUp className="w-3 h-3 mr-1" />
              Sync: {new Date(syncStatus.pagadas.lastSync).toLocaleTimeString()}
            </Badge>
          )}
          
          {/* Loading indicator */}
          {loading && (
            <Badge className='bg-yellow-100 text-yellow-800 animate-pulse'>
              <Clock className="w-3 h-3 mr-1" />
              Cargando...
            </Badge>
          )}
        </div>
      </div>

      {/* Controles */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4'>
        <div className='relative w-full md:w-80'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4' />
          <Input
            placeholder='Buscar por ID de cliente...'
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className='pl-10 pr-4 py-2'
          />
        </div>
        
        <div className='flex gap-2'>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={forceSync}
            disabled={syncLoading}
          >
            <TrendingUp className={`w-4 h-4 mr-2 ${syncLoading ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
        </div>
      </div>

      {/* Estado de error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">Error: {error}</span>
        </div>
      )}

      {/* Tabla de resultados */}
      <div className='border rounded-lg overflow-x-auto bg-white shadow-sm'>
        <Table>
          <TableHeader className='bg-gray-50'>
            <TableRow>
              <TableHead>ID Cliente</TableHead>
              <TableHead>Facturas</TableHead>
              <TableHead>Total Pagado</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && clientesAgrupados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className='text-center py-8'>
                  <div className="flex flex-col items-center gap-2">
                    <Clock className="w-8 h-8 text-blue-500 animate-spin" />
                    <span>⚡ Cargando desde backend optimizado...</span>
                    <span className="text-sm text-gray-600">
                      Respuesta ultra-rápida desde archivos JSON
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4} className='text-center text-red-500 py-8'>
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  {error}
                </TableCell>
              </TableRow>
            ) : clientesAgrupados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className='text-center text-muted-foreground py-8'>
                  No se encontraron clientes con los filtros seleccionados
                </TableCell>
              </TableRow>
            ) : (
              clientesAgrupados.map(cliente => (
                <TableRow key={cliente.idcliente} className='hover:bg-gray-50'>
                  <TableCell className='font-medium'>
                    {cliente.idcliente}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-blue-100 hover:text-blue-800 transition-colors px-3 py-1 font-semibold"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      {cliente.facturas.length} facturas
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className='font-bold text-green-600'>
                      {cliente.totalPagado.toLocaleString('es-DO', { 
                        style: 'currency', 
                        currency: 'DOP' 
                      })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">
                      ✅ {cliente.estado}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* Paginación */}
        {pagination && pagination.totalPages > 1 && (
          <div className='flex items-center justify-between px-4 py-3 border-t bg-gray-50'>
            <div className='text-sm text-muted-foreground'>
              Página {pagination.currentPage} de {pagination.totalPages} 
              ({pagination.totalClientes} clientes total)
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage}
              >
                <ChevronLeft className='w-4 h-4' />
                Anterior
              </Button>
              <span className='text-sm px-3 py-1 bg-gray-100 rounded'>
                {pagination.currentPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaActual(p => p + 1)}
                disabled={!pagination.hasNextPage}
              >
                Siguiente
                <ChevronRight className='w-4 h-4' />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Estado de sincronización detallado */}
      {syncStatus.pagadas && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">📊 Estado de Sincronización</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-600 font-medium">Última sync:</span>
              <br />
              <span>{new Date(syncStatus.pagadas.lastSync).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Total facturas:</span>
              <br />
              <span>{syncStatus.pagadas.totalFacturas}</span>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Total clientes:</span>
              <br />
              <span>{syncStatus.pagadas.totalClientes}</span>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Duración:</span>
              <br />
              <span>{syncStatus.pagadas.duration}ms</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer informativo */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-green-800">🚀 Backend Optimizado Activo</h3>
        </div>
        <p className="text-green-700 text-sm">
          Los datos se cargan desde un backend intermedio que cachea las facturas en archivos JSON. 
          Esto proporciona respuestas ultra-rápidas (~10ms) y soluciona los problemas de timeout 
          con la API de Mikrowisp para grandes volúmenes de datos.
        </p>
      </div>
    </Main>
  )
} 