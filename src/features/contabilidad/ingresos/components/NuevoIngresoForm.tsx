import { useState, useEffect } from 'react'
import { database } from '@/firebase'
import { TipoCuentaContable } from '@/types/interfaces/contabilidad/cuenta'
import { Ingreso, TipoIngreso } from '@/types/interfaces/contabilidad/ingreso'
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { Plus, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { useContabilidadState } from '@/context/global/useContabilidadState'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { useIngresos, type IngresoInput } from '../hooks/useIngresos'

interface NuevoIngresoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editIngreso?: Ingreso | null
  onSuccess: (ingreso: Ingreso) => void
}

const tipoIngresoLabels: Record<TipoIngreso, string> = {
  [TipoIngreso.VENTA_SERVICIO]: 'Venta de Servicio',
  [TipoIngreso.VENTA_PRODUCTO]: 'Venta de Producto',
  [TipoIngreso.INTERES]: 'Interés',
  [TipoIngreso.COMISION]: 'Comisión',
  [TipoIngreso.OTRO]: 'Otro',
}

export function NuevoIngresoForm({
  open,
  onOpenChange,
  editIngreso,
  onSuccess,
}: NuevoIngresoFormProps) {
  const { cuentas, subscribeToCuentas } = useContabilidadState()
  const { isLoading, createIngreso, updateIngreso } = useIngresos()

  const [formData, setFormData] = useState<IngresoInput>({
    descripcion: '',
    monto: 0,
    fecha: new Date().toISOString().split('T')[0],
    idcuenta: '',
    tipo: TipoIngreso.VENTA_SERVICIO,
    referencia: '',
    notas: '',
  })

  // Estados para el modal de cuenta
  const [showCuentaForm, setShowCuentaForm] = useState(false)

  // Estados para el formulario de cuenta
  const [cuentaFormData, setCuentaFormData] = useState({
    nombre: '',
    tipo: TipoCuentaContable.ACTIVO,
    descripcion: '',
    balance: 0,
  })
  const [isCreatingCuenta, setIsCreatingCuenta] = useState(false)

  useEffect(() => {
    const unsubscribeCuentas = subscribeToCuentas()

    return () => {
      unsubscribeCuentas()
    }
  }, [])

  useEffect(() => {
    if (editIngreso) {
      setFormData({
        descripcion: editIngreso.descripcion,
        monto: editIngreso.monto,
        fecha: editIngreso.fecha.split('T')[0], // Convertir ISO string a formato date input
        idcuenta: editIngreso.idcuenta,
        tipo: editIngreso.tipo,
        referencia: editIngreso.referencia || '',
        notas: editIngreso.notas || '',
      })
    } else {
      setFormData({
        descripcion: '',
        monto: 0,
        fecha: new Date().toISOString().split('T')[0],
        idcuenta: '',
        tipo: TipoIngreso.VENTA_SERVICIO,
        referencia: '',
        notas: '',
      })
    }
  }, [editIngreso, open])

  const handleSubmit = async () => {
    let result: Ingreso | null = null

    if (editIngreso?.id) {
      result = await updateIngreso(editIngreso.id, formData)
    } else {
      result = await createIngreso(formData)
    }

    if (result) {
      onSuccess(result)
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  const handleFieldChange = (
    field: keyof IngresoInput,
    value: string | number | TipoIngreso
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCreateCuenta = async () => {
    if (!cuentaFormData.nombre || !cuentaFormData.tipo) {
      toast.error('Completa el nombre y tipo de cuenta')
      return
    }

    setIsCreatingCuenta(true)
    try {
      const docRef = await addDoc(collection(database, 'cuentas'), {
        ...cuentaFormData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      await updateDoc(doc(database, 'cuentas', docRef.id), {
        id: docRef.id,
      })

      // Auto-seleccionar la cuenta recién creada
      setFormData((prev) => ({ ...prev, idcuenta: docRef.id }))

      toast.success('Cuenta creada exitosamente')
      setCuentaFormData({
        nombre: '',
        tipo: TipoCuentaContable.ACTIVO,
        descripcion: '',
        balance: 0,
      })
      setShowCuentaForm(false)
    } catch (error) {
      console.error('Error al crear cuenta:', error)
      toast.error('Error al crear la cuenta')
    } finally {
      setIsCreatingCuenta(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='top'
        className='h-[600px] w-full max-w-4xl mx-auto rounded-b-xl border-t-0 animate-in slide-in-from-top duration-300'
      >
        <SheetHeader className='mb-6'>
          <SheetTitle className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
            <TrendingUp className='h-6 w-6 text-green-600' />
            {editIngreso ? 'Editar Ingreso' : 'Nuevo Ingreso'}
          </SheetTitle>
        </SheetHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className='space-y-6'
        >
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Columna izquierda */}
            <div className='space-y-4'>
              <div>
                <Label htmlFor='tipo' className='text-sm font-medium'>
                  Tipo de Ingreso *
                </Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) =>
                    handleFieldChange('tipo', value as TipoIngreso)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder='Selecciona el tipo de ingreso' />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(tipoIngresoLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='cuenta' className='text-sm font-medium'>
                  Cuenta Contable *
                </Label>
                <div className='flex gap-2 mt-1'>
                  <Select
                    value={formData.idcuenta}
                    onValueChange={(value) =>
                      handleFieldChange('idcuenta', value)
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className='flex-1'>
                      <SelectValue placeholder='Selecciona una cuenta' />
                    </SelectTrigger>
                    <SelectContent>
                      {cuentas.map((cuenta) => (
                        <SelectItem key={cuenta.id} value={cuenta.id}>
                          <div className='flex flex-col'>
                            <span className='font-medium'>
                              {cuenta.nombre} - ($
                              {cuenta.balance.toLocaleString()})
                            </span>
                            <span className='text-xs text-gray-500'>
                              {cuenta.descripcion}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    onClick={() => setShowCuentaForm(true)}
                    disabled={isLoading}
                    className='shrink-0'
                  >
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor='descripcion' className='text-sm font-medium'>
                  Descripción *
                </Label>
                <Textarea
                  id='descripcion'
                  value={formData.descripcion}
                  onChange={(e) =>
                    handleFieldChange('descripcion', e.target.value)
                  }
                  placeholder='Describe el concepto del ingreso...'
                  disabled={isLoading}
                  rows={3}
                  className='mt-1 resize-none'
                />
              </div>

              <div>
                <Label htmlFor='referencia' className='text-sm font-medium'>
                  Referencia
                </Label>
                <Input
                  id='referencia'
                  value={formData.referencia}
                  onChange={(e) =>
                    handleFieldChange('referencia', e.target.value)
                  }
                  placeholder='Número de factura, recibo, etc.'
                  disabled={isLoading}
                  className='mt-1'
                />
              </div>
            </div>

            {/* Columna derecha */}
            <div className='space-y-4'>
              <div>
                <Label htmlFor='monto' className='text-sm font-medium'>
                  Monto *
                </Label>
                <div className='relative mt-1'>
                  <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500'>
                    $
                  </span>
                  <Input
                    id='monto'
                    type='number'
                    step='0.01'
                    min='0'
                    value={formData.monto}
                    onChange={(e) =>
                      handleFieldChange('monto', Number(e.target.value))
                    }
                    placeholder='0.00'
                    disabled={isLoading}
                    className='pl-8'
                  />
                </div>
              </div>

              <div>
                <Label htmlFor='fecha' className='text-sm font-medium'>
                  Fecha *
                </Label>
                <Input
                  id='fecha'
                  type='date'
                  value={formData.fecha}
                  onChange={(e) => handleFieldChange('fecha', e.target.value)}
                  disabled={isLoading}
                  className='mt-1'
                />
              </div>

              <div>
                <Label htmlFor='notas' className='text-sm font-medium'>
                  Notas
                </Label>
                <Textarea
                  id='notas'
                  value={formData.notas}
                  onChange={(e) => handleFieldChange('notas', e.target.value)}
                  placeholder='Notas adicionales...'
                  disabled={isLoading}
                  rows={3}
                  className='mt-1 resize-none'
                />
              </div>

              {/* Resumen */}
              <div className='p-4 bg-green-50 rounded-lg border border-green-200'>
                <h4 className='text-sm font-medium text-green-900 mb-2 flex items-center gap-2'>
                  <TrendingUp className='h-4 w-4' />
                  Resumen del Ingreso
                </h4>
                <div className='space-y-1 text-sm text-green-800'>
                  <div className='flex justify-between'>
                    <span>Tipo:</span>
                    <span className='font-medium'>
                      {tipoIngresoLabels[formData.tipo]}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Cuenta:</span>
                    <span className='font-medium'>
                      {formData.idcuenta
                        ? cuentas.find((c) => c.id === formData.idcuenta)
                            ?.nombre || 'No seleccionada'
                        : 'No seleccionada'}
                    </span>
                  </div>
                  {formData.idcuenta && formData.monto > 0 && (
                    <>
                      <div className='border-t border-green-300 pt-2 mt-2'>
                        <div className='flex justify-between text-xs'>
                          <span>Balance actual:</span>
                          <span className='font-medium'>
                            $
                            {(
                              cuentas.find((c) => c.id === formData.idcuenta)
                                ?.balance || 0
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className='flex justify-between text-xs'>
                          <span>Crédito (ingreso):</span>
                          <span className='font-medium text-green-700'>
                            +${formData.monto.toLocaleString()}
                          </span>
                        </div>
                        <div className='flex justify-between text-xs font-semibold border-t border-green-300 pt-1 mt-1'>
                          <span>Balance resultante:</span>
                          <span className='text-green-700'>
                            $
                            {(
                              (cuentas.find((c) => c.id === formData.idcuenta)
                                ?.balance || 0) + formData.monto
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                  <div className='border-t border-green-300 pt-2 mt-3'>
                    <div className='flex justify-between items-center'>
                      <span className='font-semibold text-green-800'>
                        Total del Ingreso:
                      </span>
                      <span className='font-bold text-2xl text-green-600'>
                        ${formData.monto.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='flex gap-3 justify-end pt-4 border-t border-gray-200'>
            <Button
              type='button'
              variant='outline'
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              disabled={isLoading}
              className='bg-green-600 hover:bg-green-700'
            >
              {isLoading
                ? 'Guardando...'
                : editIngreso
                  ? 'Actualizar'
                  : 'Registrar Ingreso'}
            </Button>
          </div>
        </form>
      </SheetContent>

      {/* Modal para crear cuenta */}
      <Dialog open={showCuentaForm} onOpenChange={setShowCuentaForm}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Nueva Cuenta Contable</DialogTitle>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div>
              <Label htmlFor='nombre-cuenta'>Nombre *</Label>
              <Input
                id='nombre-cuenta'
                value={cuentaFormData.nombre}
                onChange={(e) =>
                  setCuentaFormData((prev) => ({
                    ...prev,
                    nombre: e.target.value,
                  }))
                }
                placeholder='Nombre de la cuenta'
                disabled={isCreatingCuenta}
              />
            </div>
            <div>
              <Label htmlFor='tipo-cuenta'>Tipo *</Label>
              <Select
                value={cuentaFormData.tipo}
                onValueChange={(value) =>
                  setCuentaFormData((prev) => ({
                    ...prev,
                    tipo: value as TipoCuentaContable,
                  }))
                }
                disabled={isCreatingCuenta}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Selecciona el tipo' />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TipoCuentaContable).map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor='descripcion-cuenta'>Descripción</Label>
              <Input
                id='descripcion-cuenta'
                value={cuentaFormData.descripcion}
                onChange={(e) =>
                  setCuentaFormData((prev) => ({
                    ...prev,
                    descripcion: e.target.value,
                  }))
                }
                placeholder='Descripción de la cuenta'
                disabled={isCreatingCuenta}
              />
            </div>
            <div>
              <Label htmlFor='balance-cuenta'>Balance inicial</Label>
              <Input
                id='balance-cuenta'
                type='number'
                value={cuentaFormData.balance}
                onChange={(e) =>
                  setCuentaFormData((prev) => ({
                    ...prev,
                    balance: Number(e.target.value),
                  }))
                }
                placeholder='0.00'
                disabled={isCreatingCuenta}
              />
            </div>
            <div className='flex gap-3 justify-end pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setShowCuentaForm(false)}
                disabled={isCreatingCuenta}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateCuenta} disabled={isCreatingCuenta}>
                {isCreatingCuenta ? 'Creando...' : 'Crear Cuenta'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Sheet>
  )
}
