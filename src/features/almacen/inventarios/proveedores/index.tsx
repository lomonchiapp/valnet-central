import { useState } from 'react'
import { PlusCircle, User2 } from 'lucide-react'
import { useComprasState } from '@/context/global/useComprasState'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { NuevoProveedorForm } from './NuevoProveedorForm'

export default function Proveedores() {
  const [showNewForm, setShowNewForm] = useState(false)
  const { proveedores } = useComprasState()

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Proveedores</h1>
          <p className='text-muted-foreground'>
            Administra los proveedores de productos y servicios.
          </p>
        </div>
        <Button onClick={() => setShowNewForm(true)}>
          <PlusCircle className='mr-2 h-4 w-4' />
          Nuevo Proveedor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proveedores Registrados</CardTitle>
          <CardDescription>
            Lista de todos los proveedores disponibles para asignar a artículos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {proveedores.length === 0 ? (
            <p className='text-center py-8 text-muted-foreground'>
              No hay proveedores registrados. Crea uno nuevo para comenzar.
            </p>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
              {proveedores.map((proveedor) => (
                <Card
                  key={proveedor.id}
                  className='shadow-md border border-muted-foreground/10'
                >
                  <CardHeader className='flex flex-row items-center gap-3 pb-2'>
                    <div className='bg-primary/10 rounded-full p-2'>
                      <User2 className='h-6 w-6 text-primary' />
                    </div>
                    <div>
                      <CardTitle className='text-lg font-semibold leading-tight'>
                        {proveedor.nombre}
                      </CardTitle>
                      <CardDescription className='text-xs'>
                        Contacto: {proveedor.contacto}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-1 text-sm'>
                    <div>
                      <span className='font-medium'>Teléfono:</span>{' '}
                      {proveedor.telefono}
                    </div>
                    <div>
                      <span className='font-medium'>Email:</span>{' '}
                      {proveedor.email}
                    </div>
                    <div>
                      <span className='font-medium'>Dirección:</span>{' '}
                      {proveedor.direccion}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <NuevoProveedorForm
        open={showNewForm}
        onOpenChange={setShowNewForm}
        onProveedorCreado={() => {
          setShowNewForm(false)
        }}
      />
    </div>
  )
}
