import { useState, useEffect } from 'react'
import { Marca } from '@/types'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NuevaMarcaForm } from '@/features/almacen/marcas/components/NuevaMarcaForm'
import { useEliminarMarca } from '@/features/almacen/marcas/hooks/useEliminarMarca'

export default function Marcas() {
  const { marcas, subscribeToMarcas } = useAlmacenState()
  const [showNewForm, setShowNewForm] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [marcaAEliminar, setMarcaAEliminar] = useState<Marca | null>(null)
  const { eliminarMarca, isLoading: eliminandoMarca } = useEliminarMarca()

  useEffect(() => {
    const unsubscribe = subscribeToMarcas()
    return () => unsubscribe()
  }, [subscribeToMarcas])

  const sortedMarcas = [...marcas].sort((a, b) =>
    a.nombre.localeCompare(b.nombre)
  )

  const handleDeleteClick = (marca: Marca) => {
    setMarcaAEliminar(marca)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!marcaAEliminar) return
    try {
      await eliminarMarca(marcaAEliminar.id)
      toast.success(`Marca "${marcaAEliminar.nombre}" eliminada exitosamente`)
    } catch {
      toast.error('Error al eliminar la marca. Intente nuevamente.')
    } finally {
      setDeleteDialogOpen(false)
      setMarcaAEliminar(null)
    }
  }

  return (
    <div className='space-y-6 max-w-7xl mx-auto'>
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
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleDeleteClick(marca)}
                        >
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar marca</DialogTitle>
          </DialogHeader>
          <p>
            ¿Estás seguro de que deseas eliminar la marca "
            {marcaAEliminar?.nombre}"?
          </p>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setDeleteDialogOpen(false)}
              disabled={eliminandoMarca}
            >
              Cancelar
            </Button>
            <Button
              variant='destructive'
              onClick={handleConfirmDelete}
              disabled={eliminandoMarca}
            >
              {eliminandoMarca ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
