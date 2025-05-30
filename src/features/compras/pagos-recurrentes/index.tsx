import { useState, useEffect } from 'react'
import { PlusCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useComprasState } from '@/context/global/useComprasState'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import NuevoPagoRecurrenteForm from './NuevoPagoRecurrenteForm'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

export default function PagosRecurrentes() {
  const { pagosRecurrentes, subscribeToPagosRecurrentes } = useComprasState()
  const [showNewForm, setShowNewForm] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeToPagosRecurrentes()
    return () => unsubscribe()
  }, [subscribeToPagosRecurrentes])

  const sortedPagosRecurrentes = [...pagosRecurrentes].sort((a, b) =>
    a.descripcion.localeCompare(b.descripcion)
  )

  return (
    <div className='space-y-6 max-w-7xl mx-auto'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Pagos Recurrentes</h1>
          <p className='text-muted-foreground'>
            Administra los pagos recurrentes de la empresa, como facturas de luz, agua, telefónica, etc.
          </p>
        </div>
        <Button onClick={() => setShowNewForm(true)}>
          <PlusCircle className='mr-2 h-4 w-4' />
          Nuevo Pago Recurrente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pagos Recurrentes Registrados</CardTitle>
          <CardDescription>
            Lista de todos los pagos recurrentes configurados para la empresa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedPagosRecurrentes.length === 0 ? (
            <p className='text-center py-8 text-muted-foreground'>
              No hay pagos recurrentes registrados. Crea uno nuevo para comenzar.
            </p>
          ) : (
            <ScrollArea className='h-[500px]'>
              <table className='min-w-full text-sm'>
                <thead>
                  <tr>
                    <th className='text-left font-semibold p-2'>Nombre</th>
                    <th className='text-right font-semibold p-2'>Monto</th>
                    <th className='text-center font-semibold p-2'>Frecuencia</th>
                    <th className='text-center font-semibold p-2'>Próximo Pago</th>
                    <th className='text-center font-semibold p-2'>Estado</th>
                    <th className='text-right font-semibold p-2'>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPagosRecurrentes.map((pago) => (
                    <tr key={pago.id} className='border-b last:border-0'>
                      <td className='p-2 font-medium'>{pago.descripcion}</td>
                      <td className='p-2 text-right'>{pago.monto}</td>
                      <td className='p-2 text-center'>{pago.frecuencia}</td>
                      <td className='p-2 text-center'>{pago.fechaProximoPago}</td>
                      <td className='p-2 text-center'>{pago.estado}</td>
                      <td className='p-2 text-right'>
                        <Button variant='ghost' size='icon'>
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Sheet open={showNewForm} onOpenChange={setShowNewForm}>
        <SheetContent side='top' className='max-w-2xl mx-auto'>
          <SheetHeader>
            <SheetTitle>Nuevo pago recurrente</SheetTitle>
          </SheetHeader>
          <NuevoPagoRecurrenteForm onClose={() => {
            setShowNewForm(false)
            toast.success('Pago recurrente creado exitosamente')
          }} />
        </SheetContent>
      </Sheet>
    </div>
  )
} 