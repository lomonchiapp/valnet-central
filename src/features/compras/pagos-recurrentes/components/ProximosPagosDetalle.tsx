import { useState, useMemo } from 'react'
import { Calendar, Clock, DollarSign, AlertCircle, CheckCircle2, Plus, Edit3 } from 'lucide-react'
import { format, isToday, isTomorrow, addDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PagoRecurrente, TipoMonto, EstadoPagoRecurrente } from '@/types/interfaces/contabilidad/pagoRecurrente'
import { useActualizarPagoRecurrente } from '../hooks'
import { toast } from 'sonner'

interface ProximosPagosDetalleProps {
  pagosRecurrentes: PagoRecurrente[]
}

interface MontoVariable {
  pagoId: string
  monto: number
  notas?: string
}

export default function ProximosPagosDetalle({ pagosRecurrentes }: ProximosPagosDetalleProps) {
  const [montosVariables, setMontosVariables] = useState<Record<string, MontoVariable>>({})
  const [montoTemporal, setMontoTemporal] = useState<number>(0)
  const [notasTemporal, setNotasTemporal] = useState<string>('')
  const [dialogAbierto, setDialogAbierto] = useState<string | null>(null)
  
  const { actualizarPagoRecurrente } = useActualizarPagoRecurrente()

  // Filtrar y ordenar próximos pagos (próximos 30 días)
  const proximosPagos = useMemo(() => {
    const hoy = new Date()
    const en30Dias = addDays(hoy, 30)
    
    return pagosRecurrentes
      .filter(pago => 
        pago.estado === EstadoPagoRecurrente.ACTIVO &&
        isWithinInterval(new Date(pago.fechaProximoPago), {
          start: startOfDay(hoy),
          end: endOfDay(en30Dias)
        })
      )
      .sort((a, b) => new Date(a.fechaProximoPago).getTime() - new Date(b.fechaProximoPago).getTime())
      .slice(0, 5) // Mostrar máximo 5 próximos pagos
  }, [pagosRecurrentes])

  const formatearFecha = (fecha: string) => {
    const fechaObj = new Date(fecha)
    
    if (isToday(fechaObj)) {
      return 'Hoy'
    } else if (isTomorrow(fechaObj)) {
      return 'Mañana'
    } else {
      return format(fechaObj, 'dd MMM', { locale: es })
    }
  }

  const obtenerUrgencia = (fecha: string) => {
    const fechaObj = new Date(fecha)
    const hoy = new Date()
    const diasRestantes = Math.ceil((fechaObj.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diasRestantes <= 0) return 'vencido'
    if (diasRestantes <= 3) return 'urgente'
    if (diasRestantes <= 7) return 'proximo'
    return 'normal'
  }

  const obtenerVarianteUrgencia = (urgencia: string) => {
    switch (urgencia) {
      case 'vencido': return 'destructive'
      case 'urgente': return 'destructive'
      case 'proximo': return 'secondary'
      default: return 'outline'
    }
  }

  const obtenerIconoUrgencia = (urgencia: string) => {
    switch (urgencia) {
      case 'vencido': return <AlertCircle className="h-4 w-4" />
      case 'urgente': return <Clock className="h-4 w-4" />
      case 'proximo': return <Calendar className="h-4 w-4" />
      default: return <CheckCircle2 className="h-4 w-4" />
    }
  }

  const handleGuardarMontoVariable = async (pagoId: string) => {
    try {
      const nuevoMonto = {
        pagoId,
        monto: montoTemporal,
        notas: notasTemporal
      }
      
      setMontosVariables(prev => ({
        ...prev,
        [pagoId]: nuevoMonto
      }))
      
      // Actualizar el pago recurrente en la base de datos
      await actualizarPagoRecurrente(pagoId, {
        monto: montoTemporal,
        notas: notasTemporal
      })
      
      // Cerrar dialog y limpiar estado
      setDialogAbierto(null)
      setMontoTemporal(0)
      setNotasTemporal('')
      toast.success('Monto actualizado correctamente')
    } catch {
      toast.error('Error al actualizar el monto')
    }
  }

  const iniciarEdicionMonto = (pago: PagoRecurrente) => {
    setMontoTemporal(montosVariables[pago.id]?.monto || pago.monto)
    setNotasTemporal(montosVariables[pago.id]?.notas || pago.notas || '')
    setDialogAbierto(pago.id)
  }

  const cerrarDialog = () => {
    setDialogAbierto(null)
    setMontoTemporal(0)
    setNotasTemporal('')
  }

  const calcularTotalProximosPagos = () => {
    return proximosPagos.reduce((total, pago) => {
      const montoFinal = montosVariables[pago.id]?.monto || pago.monto
      return total + montoFinal
    }, 0)
  }

  if (proximosPagos.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay pagos próximos
            </h3>
            <p className="text-gray-600">
              No tienes pagos recurrentes programados para los próximos 30 días.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Próximos Pagos
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Pagos recurrentes programados para los próximos 30 días
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Total estimado</div>
            <div className="text-2xl font-bold text-indigo-600">
              ${calcularTotalProximosPagos().toLocaleString()}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {proximosPagos.map((pago) => {
          const urgencia = obtenerUrgencia(pago.fechaProximoPago)
          const montoFinal = montosVariables[pago.id]?.monto || pago.monto
          const esVariable = pago.tipoMonto === TipoMonto.VARIABLE
          
          return (
            <div
              key={pago.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className={`p-2 rounded-full ${
                    urgencia === 'vencido' || urgencia === 'urgente' 
                      ? 'bg-red-100 text-red-600' 
                      : urgencia === 'proximo'
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {obtenerIconoUrgencia(urgencia)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {pago.descripcion}
                    </h4>
                    {esVariable && (
                      <Badge variant="outline" className="text-xs">
                        Variable
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatearFecha(pago.fechaProximoPago)}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {pago.frecuencia.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    ${montoFinal.toLocaleString()}
                  </div>
                  {esVariable && montosVariables[pago.id] && (
                    <div className="text-xs text-green-600">
                      Actualizado
                    </div>
                  )}
                </div>
                
                <Badge variant={obtenerVarianteUrgencia(urgencia)} className="text-xs">
                  {urgencia === 'vencido' ? 'Vencido' :
                   urgencia === 'urgente' ? 'Urgente' :
                   urgencia === 'proximo' ? 'Próximo' : 'Programado'}
                </Badge>

                {esVariable && (
                  <Dialog open={dialogAbierto === pago.id} onOpenChange={(open) => !open && cerrarDialog()}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => iniciarEdicionMonto(pago)}
                        className="flex items-center space-x-1"
                      >
                        {montosVariables[pago.id] ? (
                          <>
                            <Edit3 className="h-3 w-3" />
                            <span>Editar</span>
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3" />
                            <span>Agregar monto</span>
                          </>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {montosVariables[pago.id] ? 'Editar' : 'Agregar'} Monto Variable
                        </DialogTitle>
                        <DialogDescription>
                          Define el monto específico para este período de pago: {pago.descripcion}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="monto">Monto a pagar</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="monto"
                              type="number"
                              value={montoTemporal}
                              onChange={(e) => setMontoTemporal(Number(e.target.value))}
                              className="pl-10"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notas">Notas (opcional)</Label>
                          <Textarea
                            id="notas"
                            value={notasTemporal}
                            onChange={(e) => setNotasTemporal(e.target.value)}
                            placeholder="Detalles adicionales sobre este pago..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={cerrarDialog}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={() => handleGuardarMontoVariable(pago.id)}
                          disabled={montoTemporal <= 0}
                        >
                          Guardar Monto
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          )
        })}
        
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Mostrando {proximosPagos.length} próximos pagos</span>
            <span>
              {proximosPagos.filter(p => obtenerUrgencia(p.fechaProximoPago) === 'urgente').length} pagos urgentes
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 