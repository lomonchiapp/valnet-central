import { useState, useEffect } from 'react'
import { database } from '@/firebase'
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { toast } from 'sonner'
import { useComprasState } from '@/context/global/useComprasState'
import { useContabilidadState } from '@/context/global/useContabilidadState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

export interface GastoFormData {
  id?: string
  proveedorId: string
  cuentaId: string
  descripcion: string
  monto: number
  fecha: string
}

interface GastoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editGasto?: GastoFormData | null
  onSuccess?: () => void
}

export function GastoForm({
  open,
  onOpenChange,
  editGasto,
  onSuccess,
}: GastoFormProps) {
  const { proveedores, subscribeToProveedores } = useComprasState()
  const { cuentas, subscribeToCuentas } = useContabilidadState()

  useEffect(() => {
    console.log('Iniciando suscripciones...')
    const unsubscribeProveedores = subscribeToProveedores()
    const unsubscribeCuentas = subscribeToCuentas()

    return () => {
      console.log('Limpiando suscripciones...')
      unsubscribeProveedores()
      unsubscribeCuentas()
    }
  }, [subscribeToProveedores, subscribeToCuentas])

  // Debug: Log para verificar las cuentas
  useEffect(() => {
    console.log('Cuentas disponibles:', cuentas)
    console.log('Número de cuentas:', cuentas.length)
    console.log('Proveedores disponibles:', proveedores)
    console.log('Número de proveedores:', proveedores.length)
  }, [cuentas, proveedores])

  const [formData, setFormData] = useState<GastoFormData>({
    proveedorId: '',
    cuentaId: '',
    descripcion: '',
    monto: 0,
    fecha: new Date().toISOString().split('T')[0],
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (editGasto) {
      setFormData(editGasto)
    } else {
      setFormData({
        proveedorId: '',
        cuentaId: '',
        descripcion: '',
        monto: 0,
        fecha: new Date().toISOString().split('T')[0],
      })
    }
  }, [editGasto, open])

  const handleSubmit = async () => {
    if (
      !formData.proveedorId ||
      !formData.cuentaId ||
      !formData.descripcion ||
      !formData.monto ||
      !formData.fecha
    ) {
      toast.error('Completa todos los campos')
      return
    }

    setIsLoading(true)
    try {
      const gastoData = {
        proveedorId: formData.proveedorId,
        cuentaId: formData.cuentaId,
        descripcion: formData.descripcion,
        monto: Number(formData.monto),
        fecha: new Date(formData.fecha),
        updatedAt: serverTimestamp(),
      }

      if (editGasto?.id) {
        await updateDoc(doc(database, 'gastosMenores', editGasto.id), gastoData)
        toast.success('Gasto actualizado exitosamente')
      } else {
        const docRef = await addDoc(collection(database, 'gastosMenores'), {
          ...gastoData,
          createdAt: serverTimestamp(),
        })
        await updateDoc(doc(database, 'gastosMenores', docRef.id), {
          id: docRef.id,
        })
        toast.success('Gasto creado exitosamente')
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error al guardar gasto:', error)
      toast.error('Error al guardar el gasto')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='top'
        className='h-[600px] w-full max-w-5xl mx-auto rounded-b-2xl border-t-0 shadow-2xl animate-in slide-in-from-top-full duration-500 ease-out data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top-full data-[state=closed]:duration-300'
      >
        <SheetHeader className='mb-8 pb-4 border-b border-gray-100'>
          <SheetTitle className='text-3xl font-bold text-gray-900 text-center'>
            {editGasto ? 'Editar Gasto' : 'Agregar Nuevo Gasto'}
          </SheetTitle>
          <p className='text-gray-600 text-center mt-2'>
            Complete todos los campos para registrar el gasto
          </p>
        </SheetHeader>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 px-4'>
          <div className='space-y-6'>
            <div className='transform transition-all duration-200 hover:scale-[1.02]'>
              <label className='text-sm font-semibold mb-2 block text-gray-700'>
                Proveedor *
              </label>
              <Select
                value={formData.proveedorId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, proveedorId: value }))
                }
                disabled={isLoading}
              >
                <SelectTrigger className='h-12 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors duration-200'>
                  <SelectValue placeholder='Selecciona un proveedor' />
                </SelectTrigger>
                <SelectContent className='animate-in slide-in-from-top-2 duration-200'>
                  {proveedores.map((proveedor) => (
                    <SelectItem
                      key={proveedor.id}
                      value={proveedor.id}
                      className='hover:bg-blue-50 transition-colors duration-150'
                    >
                      {proveedor.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='transform transition-all duration-200 hover:scale-[1.02]'>
              <label className='text-sm font-semibold mb-2 block text-gray-700'>
                Cuenta contable *
              </label>
              <Select
                value={formData.cuentaId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, cuentaId: value }))
                }
                disabled={isLoading}
              >
                <SelectTrigger className='h-12 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors duration-200'>
                  <SelectValue placeholder='Selecciona una cuenta'>
                    {formData.cuentaId && (
                      <div className='flex flex-col text-left'>
                        <span className='font-medium'>
                          {
                            cuentas.find((c) => c.id === formData.cuentaId)
                              ?.nombre
                          }
                        </span>
                        <span className='text-xs text-gray-500'>
                          {
                            cuentas.find((c) => c.id === formData.cuentaId)
                              ?.descripcion
                          }
                        </span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className='animate-in slide-in-from-top-2 duration-200'>
                  {cuentas.length === 0 ? (
                    <div className='p-4 text-center text-gray-500'>
                      No hay cuentas disponibles
                    </div>
                  ) : (
                    cuentas.map((cuenta) => (
                      <SelectItem
                        key={cuenta.id}
                        value={cuenta.id}
                        className='hover:bg-blue-50 transition-colors duration-150 cursor-pointer'
                      >
                        <div className='flex flex-col py-1 w-full'>
                          <span className='font-medium text-gray-900'>
                            {cuenta.nombre}
                          </span>
                          <span className='text-xs text-gray-500 mt-1'>
                            {cuenta.descripcion}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className='transform transition-all duration-200 hover:scale-[1.02]'>
              <label className='text-sm font-semibold mb-2 block text-gray-700'>
                Descripción *
              </label>
              <Input
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    descripcion: e.target.value,
                  }))
                }
                placeholder='Descripción del gasto'
                disabled={isLoading}
                className='h-12 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200'
              />
            </div>
          </div>

          <div className='space-y-6'>
            <div className='transform transition-all duration-200 hover:scale-[1.02]'>
              <label className='text-sm font-semibold mb-2 block text-gray-700'>
                Monto *
              </label>
              <div className='relative'>
                <span className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold text-lg'>
                  $
                </span>
                <Input
                  type='number'
                  step='0.01'
                  value={formData.monto}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      monto: Number(e.target.value),
                    }))
                  }
                  placeholder='0.00'
                  disabled={isLoading}
                  className='h-12 pl-8 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200 text-lg font-semibold'
                />
              </div>
            </div>

            <div className='transform transition-all duration-200 hover:scale-[1.02]'>
              <label className='text-sm font-semibold mb-2 block text-gray-700'>
                Fecha *
              </label>
              <Input
                type='date'
                value={formData.fecha}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, fecha: e.target.value }))
                }
                disabled={isLoading}
                className='h-12 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200'
              />
            </div>

            {/* Resumen visual */}
            <div className='p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 transform transition-all duration-300 hover:shadow-lg'>
              <h4 className='text-sm font-bold text-gray-900 mb-3 flex items-center'>
                <span className='w-2 h-2 bg-blue-500 rounded-full mr-2'></span>
                Resumen del Gasto
              </h4>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Proveedor:</span>
                  <span className='font-medium text-gray-900'>
                    {formData.proveedorId
                      ? proveedores.find((p) => p.id === formData.proveedorId)
                          ?.nombre || 'No seleccionado'
                      : 'No seleccionado'}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Cuenta:</span>
                  <span className='font-medium text-gray-900'>
                    {formData.cuentaId
                      ? cuentas.find((c) => c.id === formData.cuentaId)
                          ?.nombre || 'No seleccionada'
                      : 'No seleccionada'}
                  </span>
                </div>
                <div className='border-t border-blue-200 pt-2 mt-3'>
                  <div className='flex justify-between items-center'>
                    <span className='font-semibold text-gray-700'>Total:</span>
                    <span className='font-bold text-2xl text-blue-600'>
                      ${formData.monto.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='flex gap-4 justify-end mt-8 pt-6 border-t border-gray-100 px-4'>
          <Button
            variant='outline'
            type='button'
            onClick={handleCancel}
            disabled={isLoading}
            className='px-8 py-3 h-12 border-2 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105'
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className='px-8 py-3 h-12 bg-blue-600 hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl'
          >
            {isLoading ? (
              <div className='flex items-center gap-2'>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                Guardando...
              </div>
            ) : editGasto ? (
              'Actualizar Gasto'
            ) : (
              'Agregar Gasto'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
