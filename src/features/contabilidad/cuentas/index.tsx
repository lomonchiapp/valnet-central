import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Cuenta, TipoCuentaContable } from '@/types/interfaces/contabilidad/cuenta'
import { PagoRecurrente } from '@/types/interfaces/contabilidad/pagoRecurrente'
import { useContabilidadState } from '@/context/global/useContabilidadState'
import { useBorrarCuenta } from './hooks'
import { useObtenerPagosVariablesPendientes } from '@/features/compras/pagos-recurrentes/hooks'
import { NuevaCuentaContable } from './NuevaCuentaContable'
import { HistorialMovimientos } from '@/features/contabilidad/movimientos/HistorialMovimientos'
import { useMovimientosCuenta } from '@/features/compras/gastos/hooks/useMovimientosCuenta'
import { ChevronDown, Pencil, Trash2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, AlertCircle, CheckCircle2, AlertTriangle, History, Clock, DollarSign } from 'lucide-react'

type CuentaWithParent = Cuenta & { parentId?: string }

const tipoLabels: Record<TipoCuentaContable, string> = {
  [TipoCuentaContable.ACTIVO]: 'Activos',
  [TipoCuentaContable.PASIVO]: 'Pasivos',
  [TipoCuentaContable.INGRESO]: 'Ingresos',
  [TipoCuentaContable.EGRESOS]: 'Egresos',
}

const tipoColors: Record<TipoCuentaContable, { bg: string; text: string; border: string }> = {
  [TipoCuentaContable.ACTIVO]: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200'
  },
  [TipoCuentaContable.PASIVO]: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200'
  },
  [TipoCuentaContable.INGRESO]: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200'
  },
  [TipoCuentaContable.EGRESOS]: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200'
  }
}

export default function Cuentas() {
  const { cuentas, subscribeToCuentas } = useContabilidadState()
  const { borrarCuenta } = useBorrarCuenta()
  const { movimientosPorCuenta } = useMovimientosCuenta()
  const { obtenerPagosVariablesPendientes } = useObtenerPagosVariablesPendientes()

  const [editCuenta, setEditCuenta] = useState<CuentaWithParent | null>(null)
  const [cuentaHistorial, setCuentaHistorial] = useState<CuentaWithParent | null>(null)
  const [showHistorial, setShowHistorial] = useState(false)
  const [pagosVariablesPendientes, setPagosVariablesPendientes] = useState<PagoRecurrente[]>([])
  const [openSections, setOpenSections] = useState<Record<TipoCuentaContable, boolean>>({
    [TipoCuentaContable.ACTIVO]: true,
    [TipoCuentaContable.PASIVO]: true,
    [TipoCuentaContable.INGRESO]: true,
    [TipoCuentaContable.EGRESOS]: true,
  })

  useEffect(() => {
    const unsubscribe = subscribeToCuentas()
    return () => unsubscribe()
  }, [subscribeToCuentas])

  useEffect(() => {
    const cargarPagosVariablesPendientes = async () => {
      try {
        const pagos = await obtenerPagosVariablesPendientes()
        setPagosVariablesPendientes(pagos)
      } catch (error) {
        console.error('Error al cargar pagos variables pendientes:', error)
      }
    }

    cargarPagosVariablesPendientes()
    
    // Recargar cada 5 minutos
    const interval = setInterval(cargarPagosVariablesPendientes, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [obtenerPagosVariablesPendientes])

  // Filtrar solo cuentas principales (sin parentId)
  const principales = (cuentas as CuentaWithParent[]).filter((c) => !c.parentId)
  // Subcuentas de una cuenta
  const getSubcuentas = (id: string) => (cuentas as CuentaWithParent[]).filter((c) => c.parentId === id)

  // Obtener cantidad de movimientos de una cuenta
  const getMovimientosCount = (idcuenta: string) => {
    return movimientosPorCuenta(idcuenta).length
  }

  const handleEdit = (cuenta: CuentaWithParent) => {
    setEditCuenta(cuenta)
  }

  const handleDelete = async (id: string) => {
    try {
      await borrarCuenta(id)
    } catch (error) {
      console.error('Error al eliminar la cuenta:', error)
    }
  }

  const handleShowHistorial = (cuenta: CuentaWithParent) => {
    setCuentaHistorial(cuenta)
    setShowHistorial(true)
  }

  const handleCloseHistorial = () => {
    setShowHistorial(false)
    setCuentaHistorial(null)
  }

  // Agrupar cuentas por tipo
  const cuentasPorTipo = Object.values(TipoCuentaContable).reduce((acc, tipo) => {
    acc[tipo] = principales.filter(c => c.tipo === tipo)
    return acc
  }, {} as Record<TipoCuentaContable, CuentaWithParent[]>)

  // Calcular balance total por tipo
  const balancePorTipo = Object.values(TipoCuentaContable).reduce((acc, tipo) => {
    const cuentasDelTipo = cuentasPorTipo[tipo]
    acc[tipo] = cuentasDelTipo.reduce((total, cuenta) => {
      const subcuentas = getSubcuentas(cuenta.id)
      const balanceSubcuentas = subcuentas.reduce((sum, sub) => sum + sub.balance, 0)
      return total + cuenta.balance + balanceSubcuentas
    }, 0)
    return acc
  }, {} as Record<TipoCuentaContable, number>)

  const toggleSection = (tipo: TipoCuentaContable) => {
    setOpenSections(prev => ({
      ...prev,
      [tipo]: !prev[tipo]
    }))
  }

  // Calcular balance general
  const balanceGeneral = balancePorTipo[TipoCuentaContable.ACTIVO] - 
                        balancePorTipo[TipoCuentaContable.PASIVO] +
                        balancePorTipo[TipoCuentaContable.INGRESO] -
                        balancePorTipo[TipoCuentaContable.EGRESOS]

  // Función para determinar el estado financiero
  const getEstadoFinanciero = (balance: number) => {
    if (balance > 1000000) {
      return {
        mensaje: "¡Excelente salud financiera!",
        icono: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
      }
    } else if (balance > 0) {
      return {
        mensaje: "Salud financiera positiva",
        icono: <TrendingUp className="h-5 w-5 text-green-500" />,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
      }
    } else if (balance > -100000) {
      return {
        mensaje: "Atención: Balance negativo",
        icono: <AlertCircle className="h-5 w-5 text-orange-500" />,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200"
      }
    } else {
      return {
        mensaje: "¡Alerta! Balance crítico",
        icono: <AlertTriangle className="h-5 w-5 text-red-500" />,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200"
      }
    }
  }

  const estadoFinanciero = getEstadoFinanciero(balanceGeneral)

  // Función para obtener pagos pendientes por cuenta
  const getPagosPendientesPorCuenta = (idcuenta: string) => {
    return pagosVariablesPendientes.filter(pago => pago.idcuenta === idcuenta)
  }

  return (
    <div className='space-y-6 pb-24 relative'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Catálogo de cuentas</h1>
          <p className='text-muted-foreground'>
            Configura y personaliza las cuentas contables que hacen parte de tu
            catálogo.
          </p>
        </div>
        <NuevaCuentaContable 
          cuentas={cuentas as CuentaWithParent[]} 
          onSuccess={() => setEditCuenta(null)}
          editCuenta={editCuenta}
        />
      </div>

      {/* Resumen de Actividad */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Movimientos Totales</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {Object.values(TipoCuentaContable).reduce((total, tipo) => 
              total + cuentasPorTipo[tipo].reduce((sum, cuenta) => 
                sum + getMovimientosCount(cuenta.id) + getSubcuentas(cuenta.id).reduce((subSum, sub) => 
                  subSum + getMovimientosCount(sub.id), 0
                ), 0
              ), 0
            )}
          </p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">Cuentas Activas</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {cuentas.filter(cuenta => getMovimientosCount(cuenta.id) > 0).length}
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">Total Cuentas</span>
          </div>
          <p className="text-2xl font-bold text-orange-900 mt-1">
            {cuentas.length}
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Cuenta Más Activa</span>
          </div>
          <p className="text-sm font-bold text-purple-900 mt-1">
            {(() => {
              const cuentaMasActiva = cuentas.reduce((max, cuenta) => 
                getMovimientosCount(cuenta.id) > getMovimientosCount(max.id) ? cuenta : max
              , cuentas[0] || { id: '', nombre: 'N/A' })
              return cuentaMasActiva.nombre.length > 15 
                ? cuentaMasActiva.nombre.substring(0, 15) + '...'
                : cuentaMasActiva.nombre
            })()}
          </p>
        </div>
      </div>

      {/* Débitos en Progreso */}
      {pagosVariablesPendientes.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-orange-800">Débitos en Progreso</h3>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                {pagosVariablesPendientes.length} pendientes
              </Badge>
            </div>
            <p className="text-sm text-orange-600">
              Pagos recurrentes variables que requieren procesamiento
            </p>
          </div>
          
          <div className="grid gap-3">
            {pagosVariablesPendientes.map((pago) => {
              const cuenta = cuentas.find(c => c.id === pago.idcuenta)
              const diasVencido = Math.floor((new Date().getTime() - new Date(pago.fechaProximoPago).getTime()) / (1000 * 60 * 60 * 24))
              
              return (
                <div key={pago.id} className="bg-white border border-orange-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <DollarSign className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{pago.descripcion}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Cuenta: {cuenta?.nombre}</span>
                        <span>•</span>
                        <span>Frecuencia: {pago.frecuencia}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {pago.ultimoMonto && (
                        <p className="text-xs text-gray-500">
                          Último: ${pago.ultimoMonto.toLocaleString()}
                        </p>
                      )}
                      <Badge 
                        variant={diasVencido > 0 ? "destructive" : "outline"}
                        className={diasVencido > 0 ? "" : "border-yellow-300 text-yellow-700"}
                      >
                        {diasVencido > 0 
                          ? `Vencido ${diasVencido}d` 
                          : 'Vence hoy'
                        }
                      </Badge>
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-orange-600 border-orange-300 hover:bg-orange-50"
                      onClick={() => {
                        // Redirigir a la página de pagos recurrentes
                        window.location.href = '/compras/pagos-recurrentes'
                      }}
                    >
                      <DollarSign className="w-3 h-3 mr-1" />
                      Procesar
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {Object.values(TipoCuentaContable).map((tipo) => (
          <Collapsible
            key={tipo}
            open={openSections[tipo]}
            onOpenChange={() => toggleSection(tipo)}
            className={`border rounded-lg ${tipoColors[tipo].border}`}
          >
            <CollapsibleTrigger className={`flex w-full items-center justify-between p-4 text-lg font-semibold ${tipoColors[tipo].bg}`}>
              <div className="flex items-center gap-4">
                <span className={tipoColors[tipo].text}>{tipoLabels[tipo]}</span>
                <span className={`text-sm font-medium ${
                  tipo === TipoCuentaContable.ACTIVO || tipo === TipoCuentaContable.INGRESO
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  ${balancePorTipo[tipo].toLocaleString()}
                </span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${openSections[tipo] ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4">
              <div className="grid gap-4">
                {cuentasPorTipo[tipo].map((cuenta) => (
                  <div key={cuenta.id} className={`rounded-lg border ${tipoColors[tipo].border} overflow-hidden`}>
                    <div className={`p-4 ${tipoColors[tipo].bg}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-semibold ${tipoColors[tipo].text}`}>{cuenta.nombre}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{cuenta.descripcion}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-2 justify-end mb-1">
                              <p className="text-sm text-muted-foreground">Balance</p>
                              {getMovimientosCount(cuenta.id) > 0 && (
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                  {getMovimientosCount(cuenta.id)} mov.
                                </span>
                              )}
                              {getPagosPendientesPorCuenta(cuenta.id).length > 0 && (
                                <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                                  {getPagosPendientesPorCuenta(cuenta.id).length} pendientes
                                </span>
                              )}
                            </div>
                            <p className={`text-lg font-semibold ${
                              cuenta.balance >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              ${cuenta.balance.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size='icon'
                              variant='ghost'
                              onClick={() => handleShowHistorial(cuenta)}
                              className="hover:bg-blue-50 hover:text-blue-600"
                              title="Ver historial de movimientos"
                            >
                              <History className="h-4 w-4" />
                            </Button>
                            <Button
                              size='icon'
                              variant='ghost'
                              onClick={() => handleEdit(cuenta)}
                              className="hover:bg-white/50"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size='icon'
                              variant='ghost'
                              onClick={() => handleDelete(cuenta.id)}
                              className="hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {getSubcuentas(cuenta.id).length > 0 && (
                      <div className="border-t border-gray-100">
                        {getSubcuentas(cuenta.id).map((sub) => (
                          <div key={sub.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-1 h-1 rounded-full ${tipoColors[tipo].bg}`} />
                                <div>
                                  <h4 className="font-medium">{sub.nombre}</h4>
                                  <p className="text-sm text-muted-foreground">{sub.descripcion}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="flex items-center gap-2 justify-end mb-1">
                                    <p className="text-sm text-muted-foreground">Balance</p>
                                    {getMovimientosCount(sub.id) > 0 && (
                                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                        {getMovimientosCount(sub.id)} mov.
                                      </span>
                                    )}
                                    {getPagosPendientesPorCuenta(sub.id).length > 0 && (
                                      <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                                        {getPagosPendientesPorCuenta(sub.id).length} pendientes
                                      </span>
                                    )}
                                  </div>
                                  <p className={`text-base font-medium ${
                                    sub.balance >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    ${sub.balance.toLocaleString()}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size='icon'
                                    variant='ghost'
                                    onClick={() => handleShowHistorial(sub)}
                                    className="hover:bg-blue-50 hover:text-blue-600"
                                    title="Ver historial de movimientos"
                                  >
                                    <History className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size='icon'
                                    variant='ghost'
                                    onClick={() => handleEdit(sub)}
                                    className="hover:bg-white/50"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size='icon'
                                    variant='ghost'
                                    onClick={() => handleDelete(sub.id)}
                                    className="hover:bg-red-50 hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {cuentasPorTipo[tipo].length === 0 && (
                  <div className={`p-8 text-center rounded-lg border-2 border-dashed ${tipoColors[tipo].border}`}>
                    <p className="text-muted-foreground">No hay cuentas en esta categoría</p>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 right-0 bg-white border-t shadow-lg" style={{ width: 'calc(100% - 240px)' }}>
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-green-50">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Activos</p>
                  <p className="text-lg font-semibold text-green-600">
                    ${balancePorTipo[TipoCuentaContable.ACTIVO].toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-red-50">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pasivos</p>
                  <p className="text-lg font-semibold text-red-600">
                    ${balancePorTipo[TipoCuentaContable.PASIVO].toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-blue-50">
                  <ArrowUpRight className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ingresos</p>
                  <p className="text-lg font-semibold text-blue-600">
                    ${balancePorTipo[TipoCuentaContable.INGRESO].toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-orange-50">
                  <ArrowDownRight className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Egresos</p>
                  <p className="text-lg font-semibold text-orange-600">
                    ${balancePorTipo[TipoCuentaContable.EGRESOS].toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {/* Estado Financiero */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${estadoFinanciero.bgColor} ${estadoFinanciero.borderColor} border`}>
                {estadoFinanciero.icono}
                <p className={`text-sm font-medium ${estadoFinanciero.color}`}>
                  {estadoFinanciero.mensaje}
                </p>
              </div>
              <div className="h-12 w-px bg-gray-200" />
              {/* Balance Final */}
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Balance Final</p>
                <div className="flex items-center gap-2">
                  <p className={`text-3xl font-bold ${balanceGeneral >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${balanceGeneral.toLocaleString()}
                  </p>
                  {balanceGeneral >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Historial de Movimientos */}
      <Dialog open={showHistorial} onOpenChange={handleCloseHistorial}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-blue-600" />
              Historial de Movimientos - {cuentaHistorial?.nombre}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto">
            {cuentaHistorial && (
              <HistorialMovimientos 
                idcuenta={cuentaHistorial.id}
                titulo={`Movimientos de ${cuentaHistorial.nombre}`}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
