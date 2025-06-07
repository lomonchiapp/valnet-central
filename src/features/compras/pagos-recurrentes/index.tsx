import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { differenceInDays, isBefore } from 'date-fns'
import {
  PagoRecurrente,
  EstadoPagoRecurrente,
  TipoMonto,
} from '@/types/interfaces/contabilidad/pagoRecurrente'
import { es } from 'date-fns/locale'
import {
  PlusCircle,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit,
  DollarSign,
  Zap,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { useComprasState } from '@/context/global/useComprasState'
import { useContabilidadState } from '@/context/global/useContabilidadState'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import NuevoPagoRecurrenteForm from './NuevoPagoRecurrenteForm'
import { useBorrarPagoRecurrente, useProcesarPagoVariable, useProcesarPagoFijo } from './hooks'

export default function PagosRecurrentes() {
  const {
    pagosRecurrentes,
    subscribeToPagosRecurrentes,
    proveedores,
    subscribeToProveedores,
  } = useComprasState()
  const { cuentas } = useContabilidadState()
  const { borrarPagoRecurrente } = useBorrarPagoRecurrente()
  const { procesarPagoVariable } = useProcesarPagoVariable()
  const { procesarPagoFijo } = useProcesarPagoFijo()
  const [showNewForm, setShowNewForm] = useState(false)
  const [editPago, setEditPago] = useState<PagoRecurrente | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(
    null
  )
  const [processingAllPayments, setProcessingAllPayments] = useState(false)
  const [variablePaymentDialog, setVariablePaymentDialog] = useState<{
    show: boolean
    pago: PagoRecurrente | null
  }>({
    show: false,
    pago: null,
  })
  const [variableAmount, setVariableAmount] = useState<string>('')

  useEffect(() => {
    const unsubscribePagos = subscribeToPagosRecurrentes()
    const unsubscribeProveedores = subscribeToProveedores()
    return () => {
      unsubscribePagos()
      unsubscribeProveedores()
    }
  }, [subscribeToPagosRecurrentes, subscribeToProveedores])

  // Calcular estadísticas
  const hoy = new Date()
  const pagosProximos = pagosRecurrentes.filter((pago: PagoRecurrente) => {
    const fechaProximo = new Date(pago.fechaProximoPago)
    const diasRestantes = differenceInDays(fechaProximo, hoy)
    return (
      diasRestantes >= 0 &&
      diasRestantes <= 7 &&
      pago.estado === EstadoPagoRecurrente.ACTIVO
    )
  })

  const pagosVencidos = pagosRecurrentes.filter((pago: PagoRecurrente) => {
    const fechaProximo = new Date(pago.fechaProximoPago)
    return (
      isBefore(fechaProximo, hoy) && pago.estado === EstadoPagoRecurrente.ACTIVO
    )
  })

  const pagosPendientes = [...pagosVencidos, ...pagosProximos]
  const pagosAlDia = pagosRecurrentes.filter((pago: PagoRecurrente) => {
    const fechaProximo = new Date(pago.fechaProximoPago)
    const diasRestantes = differenceInDays(fechaProximo, hoy)
    return (
      diasRestantes > 7 && pago.estado === EstadoPagoRecurrente.ACTIVO
    )
  })

  const totalMontoProximos = pagosProximos.reduce(
    (sum: number, pago: PagoRecurrente) => sum + pago.monto,
    0
  )
  const totalMontoVencidos = pagosVencidos.reduce(
    (sum: number, pago: PagoRecurrente) => sum + pago.monto,
    0
  )

  const getProveedorNombre = (idproveedor: string) => {
    return (
      proveedores.find(
        (p: { id: string; nombre: string }) => p.id === idproveedor
      )?.nombre || 'Proveedor desconocido'
    )
  }

  const getCuentaNombre = (idcuenta: string) => {
    return (
      cuentas.find((c) => c.id === idcuenta)?.nombre || 'Cuenta desconocida'
    )
  }

  const getDiasRestantes = (fechaProximo: string) => {
    return differenceInDays(new Date(fechaProximo), hoy)
  }

  const getEstadoBadge = (pago: PagoRecurrente) => {
    const diasRestantes = getDiasRestantes(pago.fechaProximoPago)

    if (pago.estado === EstadoPagoRecurrente.INACTIVO) {
      return <Badge variant='secondary'>Inactivo</Badge>
    }

    if (diasRestantes < 0) {
      return (
        <Badge variant='destructive'>
          Vencido ({Math.abs(diasRestantes)}d)
        </Badge>
      )
    }

    if (diasRestantes === 0) {
      return <Badge className='bg-orange-500 hover:bg-orange-600'>Hoy</Badge>
    }

    if (diasRestantes <= 3) {
      return (
        <Badge className='bg-yellow-500 hover:bg-yellow-600'>
          Urgente ({diasRestantes}d)
        </Badge>
      )
    }

    if (diasRestantes <= 7) {
      return (
        <Badge className='bg-blue-500 hover:bg-blue-600'>
          Próximo ({diasRestantes}d)
        </Badge>
      )
    }

    return <Badge variant='outline'>{diasRestantes} días</Badge>
  }

  const handleDelete = async (id: string) => {
    try {
      console.log('handleDelete called with ID:', id)
      console.log('Current pagosRecurrentes length:', pagosRecurrentes.length)

      setDeletingId(id)
      await borrarPagoRecurrente(id)

      console.log('Delete operation completed successfully')
    } catch (error) {
      console.error('Error al eliminar pago recurrente:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (pago: PagoRecurrente) => {
    setEditPago(pago)
    setShowNewForm(true)
  }

  const handleFormClose = () => {
    setShowNewForm(false)
    setEditPago(null)
    toast.success('Pago recurrente guardado exitosamente')
  }

  const handleOpenVariablePayment = (pago: PagoRecurrente) => {
    setVariablePaymentDialog({ show: true, pago })
    setVariableAmount(pago.ultimoMonto?.toString() || '')
  }

  const handleProcessVariablePayment = async () => {
    if (!variablePaymentDialog.pago || !variableAmount) return

    const amount = parseFloat(variableAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Ingresa un monto válido')
      return
    }

    try {
      setProcessingPaymentId(variablePaymentDialog.pago.id)
      await procesarPagoVariable(variablePaymentDialog.pago.id, amount)
      setVariablePaymentDialog({ show: false, pago: null })
      setVariableAmount('')
    } catch (error) {
      console.error('Error al procesar pago variable:', error)
    } finally {
      setProcessingPaymentId(null)
    }
  }

  const handleProcessFixedPayment = async (pago: PagoRecurrente) => {
    try {
      setProcessingPaymentId(pago.id)
      await procesarPagoFijo(pago.id)
    } catch (error) {
      console.error('Error al procesar pago fijo:', error)
    } finally {
      setProcessingPaymentId(null)
    }
  }

  const handleCatchUpAllPayments = async () => {
    try {
      setProcessingAllPayments(true)
      
      for (const pago of pagosPendientes) {
        if (pago.tipoMonto === TipoMonto.VARIABLE) {
          // Para pagos variables, usar el último monto si existe
          if (pago.ultimoMonto) {
            await procesarPagoVariable(pago.id, pago.ultimoMonto)
          }
        } else {
          // Para pagos fijos, procesar directamente
          await procesarPagoFijo(pago.id)
        }
      }
      
      toast.success(`Se procesaron ${pagosPendientes.length} pagos pendientes`)
    } catch (error) {
      console.error('Error al procesar todos los pagos:', error)
      toast.error('Error al procesar algunos pagos')
    } finally {
      setProcessingAllPayments(false)
    }
  }

  const renderAmountCell = (pago: PagoRecurrente) => {
    console.log('renderAmountCell Debug:', {
      id: pago.id,
      tipoMonto: pago.tipoMonto,
      tipoMontoType: typeof pago.tipoMonto,
      isVariable: pago.tipoMonto === TipoMonto.VARIABLE,
      isVariableString: String(pago.tipoMonto) === 'VARIABLE',
      TipoMontoVARIABLE: TipoMonto.VARIABLE,
    })

    const isVariablePayment =
      String(pago.tipoMonto) === 'VARIABLE' ||
      pago.tipoMonto === TipoMonto.VARIABLE

    if (isVariablePayment) {
      return (
        <TableCell className='text-right'>
          <div className='flex flex-col items-end gap-1'>
            <Dialog
              open={
                variablePaymentDialog.show &&
                variablePaymentDialog.pago?.id === pago.id
              }
              onOpenChange={(open) => {
                if (!open) {
                  setVariablePaymentDialog({ show: false, pago: null })
                  setVariableAmount('')
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-8 gap-1 text-blue-600 border-blue-200 hover:bg-blue-50'
                  onClick={() => handleOpenVariablePayment(pago)}
                >
                  <DollarSign className='w-3 h-3' />
                  Variable
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Procesar Pago Variable</DialogTitle>
                </DialogHeader>
                <div className='space-y-4'>
                  <div>
                    <p className='text-sm text-gray-600 mb-2'>
                      <strong>{pago.descripcion}</strong>
                    </p>
                    <p className='text-xs text-gray-500'>
                      Proveedor: {getProveedorNombre(pago.idproveedor)}
                    </p>
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-2'>
                      Monto a pagar
                    </label>
                    <Input
                      type='number'
                      value={variableAmount}
                      onChange={(e) => setVariableAmount(e.target.value)}
                      placeholder='0.00'
                      className='text-right'
                      step='0.01'
                      min='0'
                    />
                  </div>
                  {pago.ultimoMonto && (
                    <p className='text-xs text-gray-500'>
                      Último pago: ${pago.ultimoMonto.toLocaleString()}
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setVariablePaymentDialog({ show: false, pago: null })
                      setVariableAmount('')
                    }}
                    disabled={processingPaymentId === pago.id}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleProcessVariablePayment}
                    disabled={
                      processingPaymentId === pago.id || !variableAmount
                    }
                  >
                    {processingPaymentId === pago.id
                      ? 'Procesando...'
                      : 'Procesar Pago'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {pago.ultimoMonto && (
              <span className='text-xs text-gray-500'>
                Último: ${pago.ultimoMonto.toLocaleString()}
              </span>
            )}
          </div>
        </TableCell>
      )
    }

    return (
      <TableCell className='text-right font-mono'>
        <span className='font-bold text-lg'>
          ${pago.monto.toLocaleString()}
        </span>
      </TableCell>
    )
  }

  const sortedPagosRecurrentes = [...pagosRecurrentes].sort(
    (a: PagoRecurrente, b: PagoRecurrente) => {
      // Primero vencidos, luego por días restantes
      const diasA = getDiasRestantes(a.fechaProximoPago)
      const diasB = getDiasRestantes(b.fechaProximoPago)

      if (diasA < 0 && diasB >= 0) return -1
      if (diasA >= 0 && diasB < 0) return 1

      return diasA - diasB
    }
  )

  return (
    <div className='space-y-6 max-w-7xl mx-auto'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Pagos Recurrentes
          </h1>
          <p className='text-muted-foreground'>
            Gestiona y monitorea los pagos recurrentes de la empresa
          </p>
        </div>
        <div className='flex gap-3'>
          {pagosPendientes.length > 0 && (
            <Button 
              onClick={handleCatchUpAllPayments} 
              disabled={processingAllPayments}
              variant="outline"
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <Zap className="mr-2 h-4 w-4" />
              {processingAllPayments ? 'Procesando...' : `Ponerse al día (${pagosPendientes.length})`}
            </Button>
          )}
          <Button onClick={() => setShowNewForm(true)} size='lg'>
            <PlusCircle className='mr-2 h-5 w-5' />
            Nuevo Pago Recurrente
          </Button>
        </div>
      </div>

      {/* Dashboard de estadísticas */}
      <div className='grid grid-cols-1 md:grid-cols-5 gap-6'>
        <Card className='border-red-200 bg-red-50'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-red-700'>
              Vencidos
            </CardTitle>
            <AlertTriangle className='h-4 w-4 text-red-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-900'>
              {pagosVencidos.length}
            </div>
            <p className='text-xs text-red-600'>
              ${totalMontoVencidos.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className='border-yellow-200 bg-yellow-50'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-yellow-700'>
              Próximos (7 días)
            </CardTitle>
            <Clock className='h-4 w-4 text-yellow-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-yellow-900'>
              {pagosProximos.length}
            </div>
            <p className='text-xs text-yellow-600'>
              ${totalMontoProximos.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className='border-emerald-200 bg-emerald-50'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-emerald-700'>
              Al Día
            </CardTitle>
            <CheckCircle2 className='h-4 w-4 text-emerald-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-emerald-900'>
              {pagosAlDia.length}
            </div>
            <p className='text-xs text-emerald-600'>
              {pagosAlDia.length === pagosRecurrentes.filter(p => p.estado === EstadoPagoRecurrente.ACTIVO).length && pagosPendientes.length === 0 
                ? '¡Todos al día!' 
                : 'Pagos programados'
              }
            </p>
          </CardContent>
        </Card>

        <Card className='border-green-200 bg-green-50'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-green-700'>
              Activos
            </CardTitle>
            <RefreshCw className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-900'>
              {
                pagosRecurrentes.filter(
                  (p: PagoRecurrente) =>
                    p.estado === EstadoPagoRecurrente.ACTIVO
                ).length
              }
            </div>
            <p className='text-xs text-green-600'>Pagos configurados</p>
          </CardContent>
        </Card>

        <Card className='border-blue-200 bg-blue-50'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-blue-700'>
              Total Registrados
            </CardTitle>
            <Calendar className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-900'>
              {pagosRecurrentes.length}
            </div>
            <p className='text-xs text-blue-600'>Todos los pagos</p>
          </CardContent>
        </Card>
      </div>

      {/* Banner de éxito cuando todos los pagos están al día */}
      {pagosPendientes.length === 0 && pagosRecurrentes.filter(p => p.estado === EstadoPagoRecurrente.ACTIVO).length > 0 && (
        <Card className='border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50'>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-center gap-3'>
              <CheckCircle2 className='h-8 w-8 text-emerald-600' />
              <div className='text-center'>
                <h3 className='text-lg font-semibold text-emerald-800'>
                  ¡Felicitaciones! Todos los pagos están al día
                </h3>
                <p className='text-sm text-emerald-600'>
                  No tienes pagos vencidos ni próximos. Tu gestión financiera está excelente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de pagos recurrentes */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='h-5 w-5' />
            Pagos Recurrentes Registrados
          </CardTitle>
          <CardDescription>
            Lista de todos los pagos recurrentes ordenados por prioridad
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedPagosRecurrentes.length === 0 ? (
            <div className='text-center py-12'>
              <Calendar className='mx-auto h-12 w-12 text-gray-400 mb-4' />
              <p className='text-lg font-medium text-gray-900 mb-2'>
                No hay pagos recurrentes registrados
              </p>
              <p className='text-gray-500 mb-6'>
                Crea tu primer pago recurrente para empezar a planificar
              </p>
              <Button onClick={() => setShowNewForm(true)}>
                <PlusCircle className='mr-2 h-4 w-4' />
                Crear Primer Pago
              </Button>
            </div>
          ) : (
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[300px]'>Descripción</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Cuenta</TableHead>
                    <TableHead className='text-right'>Monto</TableHead>
                    <TableHead>Frecuencia</TableHead>
                    <TableHead>Próximo Pago</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className='text-right'>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPagosRecurrentes.map((pago: PagoRecurrente) => (
                    <TableRow
                      key={pago.id}
                      className={`
                      ${getDiasRestantes(pago.fechaProximoPago) < 0 ? 'bg-red-50 hover:bg-red-100' : ''}
                      ${getDiasRestantes(pago.fechaProximoPago) === 0 ? 'bg-orange-50 hover:bg-orange-100' : ''}
                      ${getDiasRestantes(pago.fechaProximoPago) > 0 && getDiasRestantes(pago.fechaProximoPago) <= 3 ? 'bg-yellow-50 hover:bg-yellow-100' : ''}
                    `}
                    >
                      <TableCell className='font-medium'>
                        <div>
                          <div className='font-semibold'>
                            {pago.descripcion}
                          </div>
                          {pago.notas && (
                            <div className='text-sm text-gray-500'>
                              {pago.notas}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getProveedorNombre(pago.idproveedor)}
                      </TableCell>
                      <TableCell className='text-sm'>
                        {getCuentaNombre(pago.idcuenta)}
                      </TableCell>
                      {renderAmountCell(pago)}
                      <TableCell>
                        <Badge variant='outline'>{pago.frecuencia}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className='text-sm'>
                          {format(
                            new Date(pago.fechaProximoPago),
                            'dd MMM yyyy',
                            { locale: es }
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getEstadoBadge(pago)}</TableCell>
                      <TableCell>
                        <div className='flex gap-1 justify-end'>
                          {/* Botón para procesar pago fijo */}
                          {pago.tipoMonto !== TipoMonto.VARIABLE && 
                           (getDiasRestantes(pago.fechaProximoPago) <= 7) && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size='icon'
                                  variant='outline'
                                  onClick={() => handleProcessFixedPayment(pago)}
                                  disabled={processingPaymentId === pago.id}
                                  className='h-8 w-8 bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                                >
                                  {processingPaymentId === pago.id ? (
                                    <RefreshCw className='w-3 h-3 animate-spin' />
                                  ) : (
                                    <CheckCircle2 className='w-3 h-3' />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {processingPaymentId === pago.id ? 'Procesando...' : 'Marcar como pagado'}
                              </TooltipContent>
                            </Tooltip>
                          )}

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size='icon'
                                variant='outline'
                                onClick={() => handleEdit(pago)}
                                className='h-8 w-8'
                              >
                                <Edit className='w-3 h-3' />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar pago</TooltipContent>
                          </Tooltip>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size='icon'
                                    variant='destructive'
                                    className='h-8 w-8'
                                  >
                                    <Trash2 className='w-3 h-3' />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Eliminar pago</TooltipContent>
                              </Tooltip>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  ¿Eliminar pago recurrente?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción eliminará permanentemente el pago
                                  recurrente
                                  <strong> "{pago.descripcion}"</strong> de
                                  <strong>
                                    {' '}
                                    {getProveedorNombre(pago.idproveedor)}
                                  </strong>
                                  .
                                  <br />
                                  <br />
                                  Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  disabled={deletingId === pago.id}
                                >
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(pago.id)}
                                  className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                  disabled={deletingId === pago.id}
                                >
                                  {deletingId === pago.id
                                    ? 'Eliminando...'
                                    : 'Eliminar'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulario */}
      <Sheet open={showNewForm} onOpenChange={setShowNewForm}>
        <SheetContent side='top' className='max-w-[90%] mx-auto'>
          <SheetHeader>
            <SheetTitle>
              {editPago ? 'Editar pago recurrente' : 'Nuevo pago recurrente'}
            </SheetTitle>
          </SheetHeader>
          <NuevoPagoRecurrenteForm onClose={handleFormClose} />
        </SheetContent>
      </Sheet>
    </div>
  )
}
