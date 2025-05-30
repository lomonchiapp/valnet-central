import { useState, useEffect } from 'react'
import { PlusCircle, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAlmacenState } from '@/context/global/useAlmacenState'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NuevaMarcaForm } from '@/features/almacen/marcas/components/NuevaMarcaForm'

export default function Marcas() {
  const { marcas, subscribeToMarcas } = useAlmacenState()
  const [showNewForm, setShowNewForm] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeToMarcas()
    return () => unsubscribe()
  }, [subscribeToMarcas])

  const sortedMarcas = [...marcas].sort((a, b) =>
    a.nombre.localeCompare(b.nombre)
  )

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Marcas</h1>
          <p className='text-muted-foreground'>
            Administra las marcas de los productos en el inventario.
          </p>
        </div>
        <Button onClick={() => setShowNewForm(true)}>
          <PlusCircle className='mr-2 h-4 w-4' />
          Nueva Marca
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Marcas Registradas</CardTitle>
          <CardDescription>
            Lista de todas las marcas disponibles para asignar a artículos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedMarcas.length === 0 ? (
            <p className='text-center py-8 text-muted-foreground'>
              No hay marcas registradas. Crea una nueva para comenzar.
            </p>
          ) : (
            <ScrollArea className='h-[500px]'>
              <table className='min-w-full text-sm'>
                <thead>
                  <tr>
                    <th className='text-left font-semibold p-2'>Nombre</th>
                    <th className='text-right font-semibold p-2'>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMarcas.map((marca) => (
                    <tr key={marca.id} className='border-b last:border-0'>
                      <td className='p-2 font-medium'>{marca.nombre}</td>
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

      <NuevaMarcaForm
        open={showNewForm}
        onOpenChange={setShowNewForm}
        onMarcaCreada={() => {
          setShowNewForm(false)
          toast.success('Marca creada exitosamente')
        }}
      />
    </div>
  )
}
