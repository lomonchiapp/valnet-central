import { useState, useEffect, useCallback } from 'react'
import type {
  MetricasSistema,
  Pago,
  Inventario,
  Brigada,
} from '@/types/interfaces/admin'
import { Timestamp } from 'firebase/firestore'
import {
  Users,
  Package,
  Wrench,
  Ticket,
  AlertCircle,
  RefreshCw,
  Bell,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { WallNetDashboardWidget } from './SacDashboard'
import { useObtenerNotificaciones } from '@/features/notificaciones/hooks'
import { EstadoNotificacion, TipoNotificacion, Notificacion } from '@/types/interfaces/notificaciones/notificacion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'

// Mock data
const mockMetricas: MetricasSistema = {
  usuariosActivos: 156,
  inventarioTotal: 1245,
  ticketsAbiertos: 23,
  brigadasActivas: 8,
  pagosPendientes: 12,
  ingresosMensuales: 45000000,
  tendencias: {
    usuarios: 12.5,
    inventario: -2.3,
    tickets: 5.7,
    brigadas: 0,
    pagos: 8.2,
    ingresos: 15.3,
  },
}

const mockPagos: Pago[] = [
  {
    id: '1',
    cliente: {
      id: '1',
      nombre: 'Cliente A',
      email: 'cliente@a.com',
    },
    monto: 1500000,
    concepto: 'Mensualidad Enero',
    fechaVencimiento: Timestamp.fromDate(new Date(Date.now() + 86400000 * 2)), // 2 días
    estado: 'pendiente',
  },
  {
    id: '2',
    cliente: {
      id: '2',
      nombre: 'Cliente B',
      email: 'cliente@b.com',
    },
    monto: 2300000,
    concepto: 'Mensualidad Enero',
    fechaVencimiento: Timestamp.fromDate(new Date(Date.now() + 86400000 * 5)), // 5 días
    estado: 'pendiente',
  },
]

const mockInventario: Inventario[] = [
  {
    id: '1',
    nombre: 'Router TP-Link',
    descripcion: 'Router inalámbrico de alta velocidad',
    categoria: 'Redes',
    stock: 5,
    threshold: 10,
    precio: 150000,
    proveedor: 'TP-Link',
    ultimaActualizacion: Timestamp.now(),
  },
  {
    id: '2',
    nombre: 'Cable UTP Cat6',
    descripcion: 'Cable de red categoría 6',
    categoria: 'Cables',
    stock: 50,
    threshold: 100,
    precio: 25000,
    proveedor: 'Belden',
    ultimaActualizacion: Timestamp.now(),
  },
  {
    id: '3',
    nombre: 'Switch 24 Puertos',
    descripcion: 'Switch de red 24 puertos',
    categoria: 'Redes',
    stock: 2,
    threshold: 5,
    precio: 450000,
    proveedor: 'Cisco',
    ultimaActualizacion: Timestamp.now(),
  },
]

const mockBrigadas: Brigada[] = [
  {
    id: '1',
    nombre: 'Brigada Norte',
    miembros: [
      { id: '1', nombre: 'Juan Pérez', rol: 'Técnico' },
      { id: '2', nombre: 'María García', rol: 'Técnico' },
    ],
    tareas: [
      {
        id: '1',
        descripcion: 'Instalación cliente nuevo',
        estado: 'pendiente',
        fechaAsignacion: Timestamp.now(),
      },
      {
        id: '2',
        descripcion: 'Mantenimiento preventivo',
        estado: 'en_proceso',
        fechaAsignacion: Timestamp.now(),
      },
    ],
    estado: 'activo',
  },
  {
    id: '2',
    nombre: 'Brigada Sur',
    miembros: [
      { id: '3', nombre: 'Carlos López', rol: 'Técnico' },
      { id: '4', nombre: 'Ana Martínez', rol: 'Técnico' },
    ],
    tareas: [
      {
        id: '3',
        descripcion: 'Reparación de falla',
        estado: 'pendiente',
        fechaAsignacion: Timestamp.now(),
      },
    ],
    estado: 'activo',
  },
]

export function AdminDashboard() {
  const navigate = useNavigate()
  const [metricas, setMetricas] = useState<MetricasSistema>(mockMetricas)
  const [pagos, setPagos] = useState<Pago[]>(mockPagos)
  const [inventario, setInventario] = useState<Inventario[]>(mockInventario)
  const [brigadas, setBrigadas] = useState<Brigada[]>(mockBrigadas)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { obtenerNotificaciones } = useObtenerNotificaciones()
  const [notificacionesPagos, setNotificacionesPagos] = useState<Notificacion[]>([])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Obtener notificaciones de pagos
      const notifs = await obtenerNotificaciones(EstadoNotificacion.PENDIENTE)
      const pagosNotifs = notifs.filter(n => 
        n.tipo === TipoNotificacion.PAGO_PROXIMO || 
        n.tipo === TipoNotificacion.PAGO_VENCIDO
      )
      setNotificacionesPagos(pagosNotifs)

      // Por ahora usamos los datos mock
      setMetricas(mockMetricas)
      setPagos(mockPagos)
      setInventario(mockInventario)
      setBrigadas(mockBrigadas)
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Error desconocido al cargar los datos'
      setError(errorMessage)
      console.error('Error en fetchData:', err)
    } finally {
      setLoading(false)
    }
  }, [ obtenerNotificaciones ])

  useEffect(() => {
    fetchData()
  }, [ fetchData ])

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900'></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen gap-4'>
        <div className='text-red-500 text-lg font-semibold'>{error}</div>
        <Button
          variant='outline'
          onClick={fetchData}
          className='flex items-center gap-2'
        >
          <RefreshCw className='h-4 w-4' />
          Intentar nuevamente
        </Button>
      </div>
    )
  }

  const metrics = [
    {
      label: 'Usuarios Activos',
      value: metricas.usuariosActivos,
      icon: <Users className='h-4 w-4 text-muted-foreground' />,
      trend: metricas.tendencias.usuarios,
    },
    {
      label: 'Inventario Total',
      value: metricas.inventarioTotal,
      icon: <Package className='h-4 w-4 text-muted-foreground' />,
      trend: metricas.tendencias.inventario,
    },
    {
      label: 'Tickets Abiertos',
      value: metricas.ticketsAbiertos,
      icon: <Ticket className='h-4 w-4 text-muted-foreground' />,
      trend: metricas.tendencias.tickets,
    },
    {
      label: 'Brigadas Activas',
      value: metricas.brigadasActivas,
      icon: <Wrench className='h-4 w-4 text-muted-foreground' />,
      trend: metricas.tendencias.brigadas,
    },
  ]

  const getNotificacionIcon = (tipo: TipoNotificacion) => {
    switch (tipo) {
      case TipoNotificacion.PAGO_RECURRENTE:
        return '💰'
      case TipoNotificacion.PAGO_VENCIDO:
        return '⚠️'
      case TipoNotificacion.PAGO_PROXIMO:
        return '🔔'
      default:
        return '📌'
    }
  }

  const getNotificacionColor = (tipo: TipoNotificacion) => {
    switch (tipo) {
      case TipoNotificacion.PAGO_VENCIDO:
        return 'bg-red-100 text-red-800'
      case TipoNotificacion.PAGO_PROXIMO:
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className='space-y-8 px-4 md:px-8 py-6'>
      {/* Botón de actualización */}
      <div className='flex justify-end'>
        <Button
          variant='outline'
          size='sm'
          onClick={fetchData}
          className='flex items-center gap-2'
        >
          <RefreshCw className='h-4 w-4' />
          Actualizar datos
        </Button>
      </div>

      {/* Métricas principales */}
      <div className='grid gap-4 md:grid-cols-4'>
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
              <CardTitle className='text-sm font-medium'>
                {metric.label}
              </CardTitle>
              {metric.icon}
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{metric.value}</div>
              <p
                className={`text-xs ${
                  metric.trend > 0
                    ? 'text-green-500'
                    : metric.trend < 0
                      ? 'text-red-500'
                      : 'text-muted-foreground'
                }`}
              >
                {metric.trend > 0 ? '+' : ''}
                {metric.trend.toFixed(1)}% desde el mes pasado
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {/* Pagos próximos con notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Bell className='h-4 w-4' />
              Pagos y Notificaciones
            </CardTitle>
            <CardDescription>Próximos pagos y alertas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {/* Notificaciones de pagos */}
              {notificacionesPagos.map((notif) => (
                <div
                  key={notif.id}
                  className='flex items-start gap-3 p-3 rounded-lg border'
                >
                  <span className='text-xl'>{getNotificacionIcon(notif.tipo)}</span>
                  <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                      <h4 className='font-medium'>{notif.titulo}</h4>
                      <Badge variant="outline" className={getNotificacionColor(notif.tipo)}>
                        {notif.tipo === TipoNotificacion.PAGO_VENCIDO ? 'Vencido' : 'Próximo'}
                      </Badge>
                    </div>
                    <p className='text-sm text-muted-foreground mt-1'>{notif.mensaje}</p>
                    <p className='text-xs text-muted-foreground mt-2'>
                      {format(new Date(notif.fechaNotificacion), 'PPP', { locale: es })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Pagos regulares */}
              {pagos.map((payment) => (
                <div
                  key={payment.id}
                  className='flex justify-between items-center p-3 rounded-lg border'
                >
                  <div>
                    <p className='font-medium'>{payment.cliente.nombre}</p>
                    <p className='text-xs text-muted-foreground'>
                      Vence: {payment.fechaVencimiento.toDate().toLocaleDateString()}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold'>
                      ${payment.monto.toLocaleString()}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {payment.estado}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant='ghost'
              className='w-full'
              onClick={() => navigate('/compras/pagos-recurrentes')}
            >
              Ver todos los pagos
            </Button>
          </CardFooter>
        </Card>

        {/* Alertas de inventario */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertCircle className='h-4 w-4 text-red-500' />
              Alertas de Inventario
            </CardTitle>
            <CardDescription>Productos con stock bajo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {inventario.map((item) => (
                <div
                  key={item.id}
                  className='flex justify-between items-center p-2 border-b'
                >
                  <div>
                    <p className='font-medium'>{item.nombre}</p>
                    <p className='text-xs text-muted-foreground'>
                      Stock mínimo: {item.threshold}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p
                      className={`font-semibold ${
                        item.stock <= item.threshold * 0.5
                          ? 'text-red-500'
                          : 'text-yellow-500'
                      }`}
                    >
                      {item.stock} unidades
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {item.stock <= item.threshold * 0.5 ? 'Crítico' : 'Bajo'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant='ghost'
              className='w-full'
              onClick={() => navigate('/admin/inventario')}
            >
              Ver inventario completo
            </Button>
          </CardFooter>
        </Card>

        {/* Widget WallNet */}
        <Card className='lg:col-span-1'>
          <CardHeader>
            <CardTitle>WallNet</CardTitle>
            <CardDescription>Últimas actualizaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <WallNetDashboardWidget />
          </CardContent>
        </Card>

        {/* Brigadas activas */}
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Wrench className='h-4 w-4' />
              Brigadas Activas
            </CardTitle>
            <CardDescription>Equipos en campo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {brigadas.map((brigade) => (
                <div
                  key={brigade.id}
                  className='flex justify-between items-center p-2 border-b'
                >
                  <div>
                    <p className='font-medium'>{brigade.nombre}</p>
                    <p className='text-xs text-muted-foreground'>
                      {brigade.miembros.length} miembros
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold'>
                      {brigade.tareas.length} tareas
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {brigade.estado}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant='ghost'
              className='w-full'
              onClick={() => navigate('/admin/brigadas')}
            >
              Ver todas las brigadas
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard
