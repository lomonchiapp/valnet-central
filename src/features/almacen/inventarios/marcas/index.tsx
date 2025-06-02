import { useState, useEffect, useMemo } from 'react'
import { Marca } from '@/types'
import { PlusCircle, Trash2, Package } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { TipoArticulo } from '@/types'

export default function Marcas() {
  const { marcas, articulos, subscribeToMarcas, subscribeToArticulos } = useAlmacenState()
  const [showNewForm, setShowNewForm] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [marcaAEliminar, setMarcaAEliminar] = useState<Marca | null>(null)
  const { eliminarMarca, isLoading: eliminandoMarca } = useEliminarMarca()

  useEffect(() => {
    const unsubscribeMarcas = subscribeToMarcas()
    const unsubscribeArticulos = subscribeToArticulos()
    return () => {
      unsubscribeMarcas()
      unsubscribeArticulos()
    }
  }, [subscribeToMarcas, subscribeToArticulos])

  const sortedMarcas = [...marcas].sort((a, b) =>
    a.nombre.localeCompare(b.nombre)
  )

  // Obtener los modelos únicos para cada marca
  const marcasConModelos = useMemo(() => {
    return sortedMarcas.map(marca => {
      const articulosDeMarca = articulos.filter(
        articulo => 
          articulo.marca === marca.id && 
          articulo.tipo === TipoArticulo.EQUIPO &&
          articulo.modelo
      )
      
      // Obtener modelos únicos
      const modelosUnicos = [...new Set(
        articulosDeMarca.map(articulo => articulo.modelo)
      )].sort()

      return {
        ...marca,
        modelos: modelosUnicos
      }
    })
  }, [sortedMarcas, articulos])

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
            Lista de todas las marcas disponibles y sus modelos asociados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {marcasConModelos.length === 0 ? (
            <p className='text-center py-8 text-muted-foreground'>
              No hay marcas registradas. Crea una nueva para comenzar.
            </p>
          ) : (
            <ScrollArea className='h-[500px]'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {marcasConModelos.map((marca) => (
                  <Card key={marca.id} className='hover:shadow-md transition-shadow'>
                    <CardHeader className='pb-2'>
                      <div className='flex justify-between items-start'>
                        <CardTitle className='text-lg'>{marca.nombre}</CardTitle>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleDeleteClick(marca)}
                          className='h-8 w-8'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {marca.modelos.length > 0 ? (
                        <div className='space-y-2'>
                          <p className='text-sm text-muted-foreground'>Modelos:</p>
                          <div className='flex flex-wrap gap-2'>
                            {marca.modelos.map((modelo) => (
                              <Badge key={modelo} variant='secondary' className='flex items-center gap-1'>
                                <Package className='h-3 w-3' />
                                {modelo}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className='text-sm text-muted-foreground'>
                          No hay modelos registrados para esta marca.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
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
