import { useEffect, useState, useMemo } from 'react'
import { useListarInstalaciones } from '@/api/hooks/useListarInstalaciones'
import { ClienteDetalle, useGetCliente } from '@/api/hooks/useGetCliente'
import { Main } from '@/components/layout/main'
import type { InstalacionConCliente } from '@/api/hooks/useInstalacionesConClientes'
import { Search, ChevronLeft, ChevronRight, SortAsc, SortDesc } from 'lucide-react'

// Interface para datos extendidos de instalación con facturación
type InstalacionExtendida = InstalacionConCliente

// Componente para mostrar una instalación con información del cliente
function InstalacionItem({ instalacion }: { instalacion: InstalacionExtendida }) {
  return (
    <div className='border rounded-lg p-4 mb-4 bg-card'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {/* Información de la instalación */}
        <div>
          <h3 className='font-semibold text-lg mb-2'>{instalacion.cliente}</h3>
          <div className='space-y-1 text-sm'>
            <p><span className='font-medium'>Cédula:</span> {instalacion.cedula}</p>
            <p><span className='font-medium'>Dirección:</span> {instalacion.direccion}</p>
            <p><span className='font-medium'>Teléfono:</span> {instalacion.telefono}</p>
            <p><span className='font-medium'>Móvil:</span> {instalacion.movil}</p>
            <p><span className='font-medium'>Email:</span> {instalacion.email}</p>
          </div>
        </div>

        {/* Estado de la instalación */}
        <div>
          <h4 className='font-medium mb-2'>Estado de Instalación</h4>
          <div className='space-y-1 text-sm'>
            <p><span className='font-medium'>Estado:</span> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                instalacion.estate === 'INSTALADO' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {instalacion.estate}
              </span>
            </p>
            <p><span className='font-medium'>Fecha Ingreso:</span> {instalacion.fecha_ingreso}</p>
            <p><span className='font-medium'>Fecha Instalación:</span> {instalacion.fecha_instalacion}</p>
            <p><span className='font-medium'>Zona:</span> {instalacion.zona}</p>
          </div>
        </div>

        {/* Información de facturación */}
        <div>
          <h4 className='font-medium mb-2'>Información de Facturación</h4>
          {instalacion.estate !== 'INSTALADO' ? (
            <p className='text-sm text-muted-foreground'>Solo disponible para instalaciones completadas</p>
          ) : instalacion.clienteDetalle ? (
            <div className='space-y-1 text-sm'>
              <p><span className='font-medium'>Estado Cliente:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  instalacion.clienteDetalle.estado === 'ACTIVO' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {instalacion.clienteDetalle.estado}
                </span>
              </p>
              <p><span className='font-medium'>Facturas No Pagadas:</span> 
                <span className={`ml-2 font-semibold ${
                  instalacion.clienteDetalle.facturacion.facturas_nopagadas > 0 
                    ? 'text-red-600' 
                    : 'text-green-600'
                }`}>
                  {instalacion.clienteDetalle.facturacion.facturas_nopagadas}
                </span>
              </p>
              <p><span className='font-medium'>Total Adeudado:</span> 
                <span className={`ml-2 font-semibold ${
                  parseFloat(instalacion.clienteDetalle.facturacion.total_facturas) > 0 
                    ? 'text-red-600' 
                    : 'text-green-600'
                }`}>
                  ${instalacion.clienteDetalle.facturacion.total_facturas}
                </span>
              </p>
              {instalacion.clienteDetalle.servicios && instalacion.clienteDetalle.servicios.length > 0 && (
                <p><span className='font-medium'>Plan:</span> {instalacion.clienteDetalle.servicios[0].perfil}</p>
              )}
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>Cargando información de facturación...</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Componente de paginación
function Paginacion({ 
  paginaActual, 
  totalPaginas, 
  onPaginaCambiada, 
  elementosPorPagina, 
  onElementosPorPaginaCambiado 
}: {
  paginaActual: number
  totalPaginas: number
  onPaginaCambiada: (pagina: number) => void
  elementosPorPagina: number
  onElementosPorPaginaCambiado: (elementos: number) => void
}) {
  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1)
  const paginasVisible = paginas.slice(
    Math.max(0, paginaActual - 3),
    Math.min(totalPaginas, paginaActual + 2)
  )

  return (
    <div className='flex items-center justify-between mt-6'>
      <div className='flex items-center gap-2'>
        <span className='text-sm text-muted-foreground'>Mostrar:</span>
        <select
          value={elementosPorPagina}
          onChange={(e) => onElementosPorPaginaCambiado(Number(e.target.value))}
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
          onClick={() => onPaginaCambiada(paginaActual - 1)}
          disabled={paginaActual === 1}
          className='p-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <ChevronLeft className='w-4 h-4' />
        </button>

        {paginasVisible.map(pagina => (
          <button
            key={pagina}
            onClick={() => onPaginaCambiada(pagina)}
            className={`px-3 py-1 rounded text-sm ${
              pagina === paginaActual
                ? 'bg-primary text-primary-foreground'
                : 'border hover:bg-secondary'
            }`}
          >
            {pagina}
          </button>
        ))}

        <button
          onClick={() => onPaginaCambiada(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className='p-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <ChevronRight className='w-4 h-4' />
        </button>
      </div>

      <div className='text-sm text-muted-foreground'>
        Página {paginaActual} de {totalPaginas}
      </div>
    </div>
  )
}

export default function Instalaciones() {
  const { listarInstalaciones, instalaciones, loading, error } = useListarInstalaciones()
  const { getClientePorCedula } = useGetCliente()
  const [clientesPagina, setClientesPagina] = useState<Record<string, ClienteDetalle>>({})
  const [loadingClientes, setLoadingClientes] = useState(false)
  
  // Estados para filtros y paginación
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'INSTALADO' | 'NO INSTALADO'>('INSTALADO')
  const [busqueda, setBusqueda] = useState('')
  const [ordenamiento, setOrdenamiento] = useState<'fecha' | 'deuda' | 'nombre'>('deuda')
  const [direccionOrden, setDireccionOrden] = useState<'asc' | 'desc'>('desc')
  const [paginaActual, setPaginaActual] = useState(1)
  const [elementosPorPagina, setElementosPorPagina] = useState(10)

  // Estado para manejar datos de clientes cargados
  const [instalacionesExtendidas, setInstalacionesExtendidas] = useState<InstalacionExtendida[]>([])

  // Actualizar instalaciones extendidas cuando cambien las instalaciones base
  useEffect(() => {
    if (instalaciones) {
      setInstalacionesExtendidas(instalaciones)
    }
  }, [instalaciones])

  useEffect(() => {
    listarInstalaciones()
  }, [listarInstalaciones])

  // Filtrar y buscar instalaciones
  const instalacionesFiltradas = useMemo(() => {
    if (!instalacionesExtendidas) return []
    
    let filtradas = instalacionesExtendidas.slice()
    
    // Aplicar filtro de estado
    if (filtroEstado !== 'TODOS') {
      filtradas = filtradas.filter(instalacion => instalacion.estate === filtroEstado)
    }
    
    // Aplicar búsqueda
    if (busqueda.trim()) {
      const terminoBusqueda = busqueda.toLowerCase().trim()
      filtradas = filtradas.filter(instalacion => 
        instalacion.cliente.toLowerCase().includes(terminoBusqueda) ||
        instalacion.cedula.toLowerCase().includes(terminoBusqueda) ||
        instalacion.direccion.toLowerCase().includes(terminoBusqueda) ||
        instalacion.telefono.includes(terminoBusqueda) ||
        instalacion.movil.includes(terminoBusqueda) ||
        instalacion.email.toLowerCase().includes(terminoBusqueda)
      )
    }
    
    return filtradas
  }, [instalacionesExtendidas, filtroEstado, busqueda])

  // Ordenar instalaciones
  const instalacionesOrdenadas = useMemo(() => {
    return instalacionesFiltradas.sort((a, b) => {
      let comparacion = 0
      
      switch (ordenamiento) {
        case 'deuda': {
          // Si no tenemos datos de facturación, priorizar las que no han cargado aún
          const deudaA = a.clienteDetalle?.facturacion?.total_facturas 
            ? parseFloat(a.clienteDetalle.facturacion.total_facturas) 
            : (a.estate === 'INSTALADO' && a.clienteDetalle === undefined ? -1 : 0) // -1 para que aparezcan primero las que están cargando
          const deudaB = b.clienteDetalle?.facturacion?.total_facturas 
            ? parseFloat(b.clienteDetalle.facturacion.total_facturas) 
            : (b.estate === 'INSTALADO' && b.clienteDetalle === undefined ? -1 : 0)
          
          // Si ambos están cargando, ordenar por fecha
          if (deudaA === -1 && deudaB === -1) {
            comparacion = new Date(b.fecha_ingreso).getTime() - new Date(a.fecha_ingreso).getTime()
          } else {
            comparacion = deudaB - deudaA // Mayor deuda primero
          }
          break
        }
        case 'nombre': {
          comparacion = a.cliente.localeCompare(b.cliente)
          break
        }
        case 'fecha':
        default: {
          comparacion = new Date(b.fecha_ingreso).getTime() - new Date(a.fecha_ingreso).getTime()
          break
        }
      }
      
      return direccionOrden === 'desc' ? comparacion : -comparacion
    })
  }, [instalacionesFiltradas, ordenamiento, direccionOrden])

  // Paginación
  const totalPaginas = Math.ceil(instalacionesOrdenadas.length / elementosPorPagina)
  const instalacionesPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * elementosPorPagina
    const fin = inicio + elementosPorPagina
    return instalacionesOrdenadas.slice(inicio, fin)
  }, [instalacionesOrdenadas, paginaActual, elementosPorPagina])

  // Reset página cuando cambien los filtros
  useEffect(() => {
    setPaginaActual(1)
  }, [filtroEstado, busqueda, ordenamiento, direccionOrden])

  const conteoInstalaciones = useMemo(() => {
    if (!instalaciones) return { total: 0, instalado: 0, noInstalado: 0 }
    
    return {
      total: instalaciones.length,
      instalado: instalaciones.filter(i => i.estate === 'INSTALADO').length,
      noInstalado: instalaciones.filter(i => i.estate !== 'INSTALADO').length
    }
  }, [instalaciones])

  // Calcular estadísticas de deuda
  const estadisticasDeuda = useMemo(() => {
    const instalacionesConDeuda = instalacionesExtendidas.filter(i => 
      i.estate === 'INSTALADO' && 
      i.clienteDetalle?.facturacion
    )
    
    const totalDeudores = instalacionesConDeuda.filter(i => 
      parseFloat(i.clienteDetalle!.facturacion.total_facturas) > 0
    ).length
    
    const deudaTotal = instalacionesConDeuda.reduce((total, i) => 
      total + parseFloat(i.clienteDetalle!.facturacion.total_facturas), 0
    )
    
    return {
      clientesConDatos: instalacionesConDeuda.length,
      totalDeudores,
      deudaTotal: deudaTotal.toFixed(2)
    }
  }, [instalacionesExtendidas])

  const toggleOrdenamiento = (tipo: 'fecha' | 'deuda' | 'nombre') => {
    if (ordenamiento === tipo) {
      setDireccionOrden(direccionOrden === 'asc' ? 'desc' : 'asc')
    } else {
      setOrdenamiento(tipo)
      setDireccionOrden('desc')
    }
  }

  // Cargar detalles de clientes solo para la página actual
  useEffect(() => {
    const fetchClientes = async () => {
      if (!instalacionesPaginadas) return
      setLoadingClientes(true)
      const detalles: Record<string, ClienteDetalle> = {}
      await Promise.all(
        instalacionesPaginadas.map(async (inst) => {
          if (inst.estate === 'INSTALADO' && inst.cedula) {
            const res = await getClientePorCedula(inst.cedula)
            detalles[inst.cedula] = res.clientes && res.clientes[0] ? res.clientes[0] : {
              id: 0,
              pasarela: '',
              codigo: '',
              direccion_principal: '',
              cedula: inst.cedula,
              nombre: inst.cliente,
              estado: 'ACTIVO',
              facturacion: {
                total_facturas: '0',
                facturas_nopagadas: 0
              },
              correo: '',
              telefono: '',
              movil: '',
              servicios: []
            }
          }
        })
      )
      setClientesPagina(detalles)
      setLoadingClientes(false)
    }
    fetchClientes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(instalacionesPaginadas)])

  if (loading || loadingClientes) {
    return (
      <Main>
        <div className='w-full text-center py-12'>
          <div className='text-lg font-semibold'>
            Cargando instalaciones y facturación de la página...
          </div>
        </div>
      </Main>
    )
  }

  return (
    <>
      <Main>
        <div className='mb-4 flex items-center justify-between space-y-2 flex-wrap'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Instalaciones</h2>
            <p className='text-muted-foreground'>
              Gestiona las instalaciones del servicio. La información de facturación solo se muestra para instalaciones completadas.
            </p>
          </div>
          {instalaciones && (
            <div className='text-sm text-muted-foreground'>
              <div>Total: {conteoInstalaciones.total} instalaciones</div>
              <div className='text-xs mt-1'>
                Instaladas: {conteoInstalaciones.instalado} | No instaladas: {conteoInstalaciones.noInstalado}
              </div>
              <div className='text-xs mt-1'>
                Mostrando: {instalacionesFiltradas.length} resultados
              </div>
              {estadisticasDeuda.clientesConDatos > 0 && (
                <div className='text-xs mt-1 p-2 bg-red-50 rounded border-l-4 border-red-500'>
                  <div className='font-medium text-red-800'>📊 Estadísticas de Deuda:</div>
                  <div className='text-red-700'>
                    🔍 Datos cargados: {estadisticasDeuda.clientesConDatos} clientes
                  </div>
                  <div className='text-red-700'>
                    💸 Deudores: {estadisticasDeuda.totalDeudores} clientes
                  </div>
                  <div className='text-red-700 font-semibold'>
                    💰 Deuda total: ${estadisticasDeuda.deudaTotal}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filtros y búsqueda */}
        <div className='mb-4 space-y-4'>
          {/* Barra de búsqueda */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
            <input
              type='text'
              placeholder='Buscar por nombre, cédula, dirección, teléfono o email...'
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
            />
          </div>

          {/* Filtros de estado */}
          <div className='flex gap-2 flex-wrap'>
            <button
              onClick={() => setFiltroEstado('TODOS')}
              className={`px-3 py-1 rounded text-sm ${
                filtroEstado === 'TODOS'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Todas ({conteoInstalaciones.total})
            </button>
            <button
              onClick={() => setFiltroEstado('INSTALADO')}
              className={`px-3 py-1 rounded text-sm ${
                filtroEstado === 'INSTALADO'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Instaladas ({conteoInstalaciones.instalado})
            </button>
            <button
              onClick={() => setFiltroEstado('NO INSTALADO')}
              className={`px-3 py-1 rounded text-sm ${
                filtroEstado === 'NO INSTALADO'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              No Instaladas ({conteoInstalaciones.noInstalado})
            </button>
          </div>

          {/* Controles de ordenamiento */}
          <div className='flex gap-2 flex-wrap items-center'>
            <span className='text-sm text-muted-foreground'>Ordenar por:</span>
            <button
              onClick={() => toggleOrdenamiento('deuda')}
              className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
                ordenamiento === 'deuda'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Deuda
              {ordenamiento === 'deuda' && (
                direccionOrden === 'desc' ? <SortDesc className='w-3 h-3' /> : <SortAsc className='w-3 h-3' />
              )}
            </button>
            <button
              onClick={() => toggleOrdenamiento('nombre')}
              className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
                ordenamiento === 'nombre'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Nombre
              {ordenamiento === 'nombre' && (
                direccionOrden === 'desc' ? <SortDesc className='w-3 h-3' /> : <SortAsc className='w-3 h-3' />
              )}
            </button>
            <button
              onClick={() => toggleOrdenamiento('fecha')}
              className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
                ordenamiento === 'fecha'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              Fecha
              {ordenamiento === 'fecha' && (
                direccionOrden === 'desc' ? <SortDesc className='w-3 h-3' /> : <SortAsc className='w-3 h-3' />
              )}
            </button>
          </div>
        </div>

        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          {loading ? (
            <div className='w-full text-center py-8'>
              Cargando instalaciones...
            </div>
          ) : error ? (
            <div className='w-full text-center text-red-500 py-8'>{error}</div>
          ) : instalacionesPaginadas && instalacionesPaginadas.length > 0 ? (
            <>
              <div className='space-y-4'>
                {instalacionesPaginadas.map((instalacion) => {
                  const clienteDetalle = clientesPagina[instalacion.cedula]
                  return (
                    <InstalacionItem
                      key={instalacion.id}
                      instalacion={{ ...instalacion, clienteDetalle }}
                    />
                  )
                })}
              </div>
              
              <Paginacion
                paginaActual={paginaActual}
                totalPaginas={totalPaginas}
                onPaginaCambiada={setPaginaActual}
                elementosPorPagina={elementosPorPagina}
                onElementosPorPaginaCambiado={setElementosPorPagina}
              />
            </>
          ) : (
            <div className='w-full text-center py-8 text-muted-foreground'>
              No se encontraron instalaciones con los filtros seleccionados
            </div>
          )}
        </div>
      </Main>
    </>
  )
}
