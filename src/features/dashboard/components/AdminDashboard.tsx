import { useState, useEffect, useCallback } from 'react'
import { format, differenceInDays, isBefore } from 'date-fns'
import { EstadoPagoRecurrente } from '@/types/interfaces/contabilidad/pagoRecurrente'
import {
  EstadoNotificacion,
  TipoNotificacion,
  Notificacion,
} from '@/types/interfaces/notificaciones/notificacion'
import { es } from 'date-fns/locale'
import {
  Wrench,
  Ticket,
  AlertCircle,
  RefreshCw,
  Bell,
  DollarSign,
  TrendingUp,
  Calendar,
  CreditCard,
  Banknote,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useComprasState } from '@/context/global/useComprasState'
import { useContabilidadState } from '@/context/global/useContabilidadState'
import { useCoordinacionState } from '@/context/global/useCoordinacionState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { useObtenerNotificaciones } from '@/features/notificaciones/hooks'

export function AdminDashboard() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const { obtenerNotificaciones } = useObtenerNotificaciones()
  const [notificacionesPagos, setNotificacionesPagos] = useState<
    Notificacion[]
  >([])

  // Zustand stores
  const {
    cuentas,
    ingresos,
    pagosRecurrentes,
    subscribeToCuentas,
    subscribeToIngresos,
    subscribeToPagosRecurrentes,
    subscribeToMovimientosCuenta,
  } = useContabilidadState()

  const { proveedores, subscribeToProveedores } = useComprasState()

  const { tickets, brigadas, subscribeToTickets, subscribeToBrigadas } =
    useCoordinacionState()

  const fetchData = useCallback(async () => {
    try {
      setError(null)

      // Obtener notificaciones de pagos
      const notifs = await obtenerNotificaciones(EstadoNotificacion.PENDIENTE)
      const pagosNotifs = notifs.filter(
        (n) =>
          n.tipo === TipoNotificacion.PAGO_PROXIMO ||
          n.tipo === TipoNotificacion.PAGO_VENCIDO
      )
      setNotificacionesPagos(pagosNotifs)
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Error desconocido al cargar los datos'
      setError(errorMessage)
      console.error('Error en fetchData:', err)
    }
  }, [obtenerNotificaciones])

  useEffect(() => {
    fetchData()

    // Suscribirse a todos los stores
    const unsubscribeCuentas = subscribeToCuentas()
    const unsubscribeIngresos = subscribeToIngresos()
    const unsubscribePagosRecurrentes = subscribeToPagosRecurrentes()
    const unsubscribeMovimientos = subscribeToMovimientosCuenta()
    const unsubscribeProveedores = subscribeToProveedores()
    const unsubscribeTickets = subscribeToTickets()
    const unsubscribeBrigadas = subscribeToBrigadas()

    return () => {
      unsubscribeCuentas()
      unsubscribeIngresos()
      unsubscribePagosRecurrentes()
      unsubscribeMovimientos()
      unsubscribeProveedores()
      unsubscribeTickets()
      unsubscribeBrigadas()
    }
  }, [
    subscribeToCuentas,
    subscribeToIngresos,
    fetchData,
    subscribeToPagosRecurrentes,
    subscribeToMovimientosCuenta,
    subscribeToProveedores,
    subscribeToTickets,
    subscribeToBrigadas,
  ])

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

  // Cálculos dinámicos
  const hoy = new Date()

  // Pagos recurrentes próximos
  const pagosProximos = pagosRecurrentes.filter((pago) => {
    const fechaProximo = new Date(pago.fechaProximoPago)
    const diasRestantes = differenceInDays(fechaProximo, hoy)
    return (
      diasRestantes >= 0 &&
      diasRestantes <= 7 &&
      pago.estado === EstadoPagoRecurrente.ACTIVO
    )
  })

  const pagosVencidos = pagosRecurrentes.filter((pago) => {
    const fechaProximo = new Date(pago.fechaProximoPago)
    return (
      isBefore(fechaProximo, hoy) && pago.estado === EstadoPagoRecurrente.ACTIVO
    )
  })

  // Balance total de cuentas
  const balanceTotal = cuentas.reduce((sum, cuenta) => sum + cuenta.balance, 0)

  // Últimos ingresos (últimos 7 días)
  const ultimosIngresos = ingresos
    .filter((ingreso) => {
      const fechaIngreso = new Date(ingreso.fecha)
      const diasAtras = differenceInDays(hoy, fechaIngreso)
      return diasAtras <= 7
    })
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 5)

  // Tickets pendientes - using correct enum values
  const ticketsPendientes = tickets.filter(
    (ticket) => ticket.estado === 'Abierto'
  )
  const ticketsEnProceso = tickets.filter(
    (ticket) => ticket.estado === 'Respondido'
  )

  // Brigadas activas - checking if brigadas array exists and has items
  const brigadasActivas = brigadas.filter((brigada) => brigada.nombre) // Simple existence check

  const getCuentaNombre = (idcuenta: string) => {
    return (
      cuentas.find((c) => c.id === idcuenta)?.nombre || 'Cuenta desconocida'
    )
  }

  const getProveedorNombre = (idproveedor: string) => {
    return (
      proveedores.find((p) => p.id === idproveedor)?.nombre ||
      'Proveedor desconocido'
    )
  }

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
      {/* Header con botón de actualización */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Panel de Administración
          </h1>
          <p className='text-muted-foreground'>
            Resumen ejecutivo del estado del sistema
          </p>
        </div>
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
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card className='border-green-200 bg-green-50'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-green-700'>
              Balance Total
            </CardTitle>
            <DollarSign className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-900'>
              ${balanceTotal.toLocaleString()}
            </div>
            <p className='text-xs text-green-600'>
              {cuentas.length} cuentas activas
            </p>
          </CardContent>
        </Card>

        <Card className='border-red-200 bg-red-50'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-red-700'>
              Pagos Urgentes
            </CardTitle>
            <AlertCircle className='h-4 w-4 text-red-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-900'>
              {pagosVencidos.length + pagosProximos.length}
            </div>
            <p className='text-xs text-red-600'>
              {pagosVencidos.length} vencidos, {pagosProximos.length} próximos
            </p>
          </CardContent>
        </Card>

        <Card className='border-blue-200 bg-blue-50'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-blue-700'>
              Tickets Activos
            </CardTitle>
            <Ticket className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-900'>
              {ticketsPendientes.length + ticketsEnProceso.length}
            </div>
            <p className='text-xs text-blue-600'>
              {ticketsPendientes.length} abiertos, {ticketsEnProceso.length}{' '}
              respondidos
            </p>
          </CardContent>
        </Card>

        <Card className='border-purple-200 bg-purple-50'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-purple-700'>
              Brigadas Registradas
            </CardTitle>
            <Wrench className='h-4 w-4 text-purple-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-purple-900'>
              {brigadasActivas.length}
            </div>
            <p className='text-xs text-purple-600'>Brigadas en el sistema</p>
          </CardContent>
        </Card>
      </div>

      {/* Widgets dinámicos */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {/* Pagos Recurrentes Próximos */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Calendar className='h-4 w-4' />
              Pagos Próximos
            </CardTitle>
            <CardDescription>
              Pagos recurrentes en los próximos 7 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {[...pagosVencidos, ...pagosProximos].slice(0, 5).map((pago) => {
                const diasRestantes = differenceInDays(
                  new Date(pago.fechaProximoPago),
                  hoy
                )
                const isVencido = diasRestantes < 0

                return (
                  <div
                    key={pago.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isVencido
                        ? 'border-red-200 bg-red-50'
                        : 'border-yellow-200 bg-yellow-50'
                    }`}
                  >
                    <div className='flex-1'>
                      <p className='font-medium text-sm'>{pago.descripcion}</p>
                      <p className='text-xs text-muted-foreground'>
                        {getProveedorNombre(pago.idproveedor)}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='font-semibold'>
                        ${pago.monto.toLocaleString()}
                      </p>
                      <Badge
                        variant={isVencido ? 'destructive' : 'default'}
                        className='text-xs'
                      >
                        {isVencido
                          ? `Vencido ${Math.abs(diasRestantes)}d`
                          : `${diasRestantes}d`}
                      </Badge>
                    </div>
                  </div>
                )
              })}
              {[...pagosVencidos, ...pagosProximos].length === 0 && (
                <div className='text-center py-6'>
                  <CheckCircle2 className='mx-auto h-8 w-8 text-green-500 mb-2' />
                  <p className='text-sm text-muted-foreground'>
                    No hay pagos próximos
                  </p>
                </div>
              )}
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

        {/* Balance de Cuentas */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CreditCard className='h-4 w-4' />
              Balance de Cuentas
            </CardTitle>
            <CardDescription>
              Estado financiero de las cuentas principales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {cuentas
                .sort((a, b) => b.balance - a.balance)
                .slice(0, 5)
                .map((cuenta) => (
                  <div
                    key={cuenta.id}
                    className='flex items-center justify-between p-3 rounded-lg border'
                  >
                    <div className='flex-1'>
                      <p className='font-medium text-sm'>{cuenta.nombre}</p>
                      <p className='text-xs text-muted-foreground'>
                        {cuenta.tipo}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p
                        className={`font-semibold ${
                          cuenta.balance >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        ${cuenta.balance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              {cuentas.length === 0 && (
                <div className='text-center py-6'>
                  <CreditCard className='mx-auto h-8 w-8 text-gray-400 mb-2' />
                  <p className='text-sm text-muted-foreground'>
                    No hay cuentas registradas
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant='ghost'
              className='w-full'
              onClick={() => navigate('/contabilidad/cuentas')}
            >
              Ver todas las cuentas
            </Button>
          </CardFooter>
        </Card>

        {/* Últimos Ingresos */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Banknote className='h-4 w-4' />
              Últimos Ingresos
            </CardTitle>
            <CardDescription>Ingresos de los últimos 7 días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {ultimosIngresos.map((ingreso) => (
                <div
                  key={ingreso.id}
                  className='flex items-center justify-between p-3 rounded-lg border border-green-200 bg-green-50'
                >
                  <div className='flex-1'>
                    <p className='font-medium text-sm'>{ingreso.descripcion}</p>
                    <p className='text-xs text-muted-foreground'>
                      {getCuentaNombre(ingreso.idcuenta)} •{' '}
                      {format(new Date(ingreso.fecha), 'dd MMM', {
                        locale: es,
                      })}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold text-green-600'>
                      +${ingreso.monto.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {ultimosIngresos.length === 0 && (
                <div className='text-center py-6'>
                  <TrendingUp className='mx-auto h-8 w-8 text-gray-400 mb-2' />
                  <p className='text-sm text-muted-foreground'>
                    No hay ingresos recientes
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant='ghost'
              className='w-full'
              onClick={() => navigate('/contabilidad/ingresos')}
            >
              Ver todos los ingresos
            </Button>
          </CardFooter>
        </Card>

        {/* Tickets y Soporte */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Ticket className='h-4 w-4' />
              Tickets de Soporte
            </CardTitle>
            <CardDescription>Estado actual de tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {[...ticketsPendientes, ...ticketsEnProceso]
                .slice(0, 4)
                .map((ticket) => (
                  <div
                    key={ticket.id}
                    className='flex items-center justify-between p-3 rounded-lg border'
                  >
                    <div className='flex-1'>
                      <p className='font-medium text-sm'>{ticket.asunto}</p>
                      <p className='text-xs text-muted-foreground'>
                        {ticket.solicitante} • {ticket.cedula}
                      </p>
                    </div>
                    <Badge
                      variant={
                        ticket.estado === 'Abierto' ? 'destructive' : 'default'
                      }
                    >
                      {ticket.estado}
                    </Badge>
                  </div>
                ))}
              {tickets.length === 0 && (
                <div className='text-center py-6'>
                  <CheckCircle2 className='mx-auto h-8 w-8 text-green-500 mb-2' />
                  <p className='text-sm text-muted-foreground'>
                    No hay tickets activos
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant='ghost'
              className='w-full'
              onClick={() => navigate('/coordinacion/tickets')}
            >
              Ver todos los tickets
            </Button>
          </CardFooter>
        </Card>

        {/* Brigadas Registradas */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Wrench className='h-4 w-4' />
              Brigadas del Sistema
            </CardTitle>
            <CardDescription>
              Brigadas registradas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {brigadasActivas.slice(0, 4).map((brigada) => (
                <div
                  key={brigada.id}
                  className='flex items-center justify-between p-3 rounded-lg border'
                >
                  <div className='flex-1'>
                    <p className='font-medium text-sm'>{brigada.nombre}</p>
                    <p className='text-xs text-muted-foreground'>
                      Matrícula: {brigada.matricula}
                    </p>
                  </div>
                  <div className='text-right'>
                    <Badge
                      variant='default'
                      className='bg-green-100 text-green-800'
                    >
                      Registrada
                    </Badge>
                  </div>
                </div>
              ))}
              {brigadasActivas.length === 0 && (
                <div className='text-center py-6'>
                  <Clock className='mx-auto h-8 w-8 text-gray-400 mb-2' />
                  <p className='text-sm text-muted-foreground'>
                    No hay brigadas registradas
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant='ghost'
              className='w-full'
              onClick={() => navigate('/coordinacion/brigadas')}
            >
              Ver todas las brigadas
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Notificaciones de Pagos */}
      {notificacionesPagos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Bell className='h-4 w-4' />
              Notificaciones de Pagos
            </CardTitle>
            <CardDescription>Alertas importantes del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {notificacionesPagos.map((notif) => (
                <div
                  key={notif.id}
                  className='flex items-start gap-3 p-3 rounded-lg border'
                >
                  <span className='text-xl'>
                    {getNotificacionIcon(notif.tipo)}
                  </span>
                  <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                      <h4 className='font-medium'>{notif.titulo}</h4>
                      <Badge
                        variant='outline'
                        className={getNotificacionColor(notif.tipo)}
                      >
                        {notif.tipo === TipoNotificacion.PAGO_VENCIDO
                          ? 'Vencido'
                          : 'Próximo'}
                      </Badge>
                    </div>
                    <p className='text-sm text-muted-foreground mt-1'>
                      {notif.mensaje}
                    </p>
                    <p className='text-xs text-muted-foreground mt-2'>
                      {format(new Date(notif.fechaNotificacion), 'PPP', {
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AdminDashboard
