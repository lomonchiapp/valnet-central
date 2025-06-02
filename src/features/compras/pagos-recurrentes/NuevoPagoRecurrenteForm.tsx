import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import {
  FrecuenciaPago,
  MetodoPago,
  TipoMonto,
  EstadoPagoRecurrente,
} from '@/types/interfaces/contabilidad/pagoRecurrente'
import { es } from 'date-fns/locale'
import { CalendarIcon, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useComprasState } from '@/context/global/useComprasState'
import { useContabilidadState } from '@/context/global/useContabilidadState'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { NuevoProveedorForm } from '@/features/almacen/inventarios/proveedores/NuevoProveedorForm'
import { NuevaCuentaContable } from '@/features/contabilidad/cuentas/NuevaCuentaContable'
import { useCrearPagoRecurrente } from './hooks'

interface PagoRecurrenteForm {
  idcuenta: string
  idproveedor: string
  descripcion: string
  tipoMonto: TipoMonto
  monto: number
  fechaInicio: Date
  frecuencia: FrecuenciaPago
  fechaProximoPago: Date
  fechaFin?: Date
  estado: EstadoPagoRecurrente
  metodoPago: MetodoPago
  notas?: string
}

export default function NuevoPagoRecurrenteForm({
  onClose,
}: {
  onClose: () => void
}) {
  const { cuentas, subscribeToCuentas } = useContabilidadState()
  const { proveedores, subscribeToProveedores } = useComprasState()
  const { crearPagoRecurrente } = useCrearPagoRecurrente()
  const [form, setForm] = useState<PagoRecurrenteForm>({
    idcuenta: '',
    idproveedor: '',
    descripcion: '',
    tipoMonto: TipoMonto.FIJO,
    monto: 0,
    fechaInicio: new Date(),
    frecuencia: FrecuenciaPago.MENSUAL,
    fechaProximoPago: new Date(),
    estado: EstadoPagoRecurrente.ACTIVO,
    metodoPago: MetodoPago.TRANSFERENCIA,
    notas: '',
  })

  // Estados para los modales
  const [showNuevaCuenta, setShowNuevaCuenta] = useState(false)
  const [showNuevoProveedor, setShowNuevoProveedor] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const unsubscribeCuentas = subscribeToCuentas()
    const unsubscribeProveedores = subscribeToProveedores()

    return () => {
      unsubscribeCuentas()
      unsubscribeProveedores()
    }
  }, [subscribeToCuentas, subscribeToProveedores])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted', form)

    // Validate required fields
    const missingFields = []
    if (!form.idcuenta) missingFields.push('Cuenta Contable')
    if (!form.idproveedor) missingFields.push('Proveedor')
    if (!form.descripcion) missingFields.push('Descripción')

    if (missingFields.length > 0) {
      console.log('Validation failed - missing fields:', missingFields)
      toast.error(
        `Por favor completa los siguientes campos: ${missingFields.join(', ')}`
      )
      return
    }

    if (form.tipoMonto === TipoMonto.FIJO && !form.monto) {
      console.log('Monto validation failed', {
        tipoMonto: form.tipoMonto,
        monto: form.monto,
      })
      toast.error('El monto es requerido para pagos fijos')
      return
    }

    try {
      setIsSubmitting(true)
      console.log('Creating pago recurrente...')

      // Convert all dates to ISO strings
      const fechaInicio = form.fechaInicio.toISOString()
      const fechaProximoPago = form.fechaProximoPago.toISOString()
      const fechaFin = form.fechaFin?.toISOString()

      const pagoData = {
        idcuenta: form.idcuenta,
        idproveedor: form.idproveedor,
        descripcion: form.descripcion,
        tipoMonto: form.tipoMonto,
        monto: form.monto,
        frecuencia: form.frecuencia,
        estado: form.estado,
        metodoPago: form.metodoPago,
        fechaInicio,
        fechaProximoPago,
        ...(fechaFin && { fechaFin }),
        ...(form.notas && form.notas.trim() && { notas: form.notas.trim() }),
      }

      console.log('Pago data:', pagoData)
      await crearPagoRecurrente(pagoData)
      console.log('Pago recurrente created successfully')
      onClose()
    } catch (error) {
      console.error('Error al crear el pago recurrente:', error)
      toast.error('Error al crear el pago recurrente')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='mt-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
        {/* Sección 1: Información Básica */}
        <div className='space-y-8'>
          <div className='bg-white p-8 rounded-lg border space-y-8'>
            <h3 className='text-xl font-semibold'>Información Básica</h3>

            <div>
              <label className='block text-sm font-medium mb-2'>
                Cuenta Contable *
              </label>
              <div className='flex gap-2'>
                <Select
                  value={form.idcuenta}
                  onValueChange={(value) =>
                    setForm({ ...form, idcuenta: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecciona una cuenta' />
                  </SelectTrigger>
                  <SelectContent>
                    {cuentas.map((cuenta) => (
                      <SelectItem key={cuenta.id} value={cuenta.id}>
                        {cuenta.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog
                  open={showNuevaCuenta}
                  onOpenChange={setShowNuevaCuenta}
                >
                  <DialogTrigger asChild>
                    <Button variant='outline' size='icon'>
                      <Plus className='h-4 w-4' />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <NuevaCuentaContable
                      cuentas={cuentas}
                      onSuccess={() => setShowNuevaCuenta(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>
                Proveedor *
              </label>
              <div className='flex gap-2'>
                <Select
                  value={form.idproveedor}
                  onValueChange={(value) =>
                    setForm({ ...form, idproveedor: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecciona un proveedor' />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedores.map((proveedor) => (
                      <SelectItem key={proveedor.id} value={proveedor.id}>
                        {proveedor.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog
                  open={showNuevoProveedor}
                  onOpenChange={setShowNuevoProveedor}
                >
                  <DialogTrigger asChild>
                    <Button variant='outline' size='icon'>
                      <Plus className='h-4 w-4' />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <NuevoProveedorForm
                      open={showNuevoProveedor}
                      onOpenChange={setShowNuevoProveedor}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>
                Descripción *
              </label>
              <Textarea
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
                placeholder='Describe el pago recurrente'
                className='h-20'
              />
            </div>
          </div>
        </div>

        {/* Sección 2: Configuración del Pago */}
        <div className='space-y-8'>
          <div className='bg-white p-8 rounded-lg border space-y-8'>
            <h3 className='text-xl font-semibold'>Configuración del Pago</h3>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Tipo de Monto *
                </label>
                <Select
                  value={form.tipoMonto}
                  onValueChange={(value) => {
                    const newTipoMonto = value as TipoMonto
                    setForm({
                      ...form,
                      tipoMonto: newTipoMonto,
                      monto:
                        newTipoMonto === TipoMonto.VARIABLE ? 0 : form.monto,
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecciona tipo' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TipoMonto.FIJO}>Fijo</SelectItem>
                    <SelectItem value={TipoMonto.VARIABLE}>Variable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.tipoMonto === TipoMonto.FIJO && (
                <div>
                  <label className='block text-sm font-medium mb-2'>
                    Monto *
                  </label>
                  <Input
                    type='number'
                    value={form.monto}
                    onChange={(e) =>
                      setForm({ ...form, monto: Number(e.target.value) })
                    }
                    placeholder='0.00'
                    className='text-right'
                  />
                </div>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>
                Método de Pago *
              </label>
              <Select
                value={form.metodoPago}
                onValueChange={(value) =>
                  setForm({ ...form, metodoPago: value as MetodoPago })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Selecciona método' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MetodoPago.TRANSFERENCIA}>
                    Transferencia
                  </SelectItem>
                  <SelectItem value={MetodoPago.EFECTIVO}>Efectivo</SelectItem>
                  <SelectItem value={MetodoPago.CHEQUE}>Cheque</SelectItem>
                  <SelectItem value={MetodoPago.TARJETA}>Tarjeta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>
                Frecuencia *
              </label>
              <Select
                value={form.frecuencia}
                onValueChange={(value) =>
                  setForm({ ...form, frecuencia: value as FrecuenciaPago })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Selecciona frecuencia' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FrecuenciaPago.DIARIO}>Diario</SelectItem>
                  <SelectItem value={FrecuenciaPago.SEMANAL}>
                    Semanal
                  </SelectItem>
                  <SelectItem value={FrecuenciaPago.MENSUAL}>
                    Mensual
                  </SelectItem>
                  <SelectItem value={FrecuenciaPago.ANUAL}>Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sección 3: Fechas */}
          <div className='bg-white p-8 rounded-lg border space-y-8'>
            <h3 className='text-xl font-semibold'>Fechas</h3>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Fecha de Inicio *
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !form.fechaInicio && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {form.fechaInicio
                        ? format(form.fechaInicio, 'PPP', { locale: es })
                        : 'Selecciona fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={form.fechaInicio}
                      onSelect={(date) =>
                        date && setForm({ ...form, fechaInicio: date })
                      }
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className='block text-sm font-medium mb-2'>
                  Fecha de Fin
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !form.fechaFin && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {form.fechaFin
                        ? format(form.fechaFin, 'PPP', { locale: es })
                        : 'Selecciona fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={form.fechaFin}
                      onSelect={(date) => setForm({ ...form, fechaFin: date })}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Sección 4: Estado y Notas */}
          <div className='bg-white p-8 rounded-lg border space-y-8'>
            <h3 className='text-xl font-semibold'>Estado y Notas</h3>

            <div>
              <label className='block text-sm font-medium mb-2'>Estado *</label>
              <Select
                value={form.estado}
                onValueChange={(value) =>
                  setForm({ ...form, estado: value as EstadoPagoRecurrente })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Selecciona estado' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EstadoPagoRecurrente.ACTIVO}>
                    Activo
                  </SelectItem>
                  <SelectItem value={EstadoPagoRecurrente.INACTIVO}>
                    Inactivo
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>Notas</label>
              <Textarea
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                placeholder='Notas adicionales'
                className='h-20'
              />
            </div>
          </div>
        </div>
      </div>

      <div className='flex justify-end gap-4 mt-10'>
        <Button
          type='button'
          variant='outline'
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar Pago Recurrente'}
        </Button>
      </div>
    </form>
  )
}
