import { useState, useEffect } from 'react'
import { database } from '@/firebase'
import { Ubicacion } from '@/types/interfaces/almacen/ubicacion'
import { doc, deleteDoc } from 'firebase/firestore'
import { PlusCircle, Pencil, Trash2, Warehouse } from 'lucide-react'
import { toast } from 'sonner'
import { useAlmacenState } from '@/context/global/useAlmacenState'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NuevaUbicacionForm } from '../inventario/components/NuevaUbicacionForm'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Ubicaciones() {
  const { ubicaciones, inventarios, subscribeToUbicaciones, subscribeToInventarios } = useAlmacenState()
  const [showNewForm, setShowNewForm] = useState(false)
  const [editingUbicacion, setEditingUbicacion] = useState<Ubicacion | null>(null)
  const [deletingUbicacion, setDeletingUbicacion] = useState<Ubicacion | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedInventario, setSelectedInventario] = useState<string>('todos')

  useEffect(() => {
    const unsubscribeUbicaciones = subscribeToUbicaciones()
    const unsubscribeInventarios = subscribeToInventarios()
    return () => {
      unsubscribeUbicaciones()
      unsubscribeInventarios()
    }
  }, [subscribeToUbicaciones, subscribeToInventarios])

  const handleDelete = async () => {
    if (!deletingUbicacion) return

    setIsDeleting(true)
    try {
      await deleteDoc(doc(database, 'ubicaciones', deletingUbicacion.id))
      toast.success(`Ubicación "${deletingUbicacion.nombre}" eliminada`)
      setDeletingUbicacion(null)
    } catch (err) {
      console.error(err)
      toast.error('Error al eliminar la ubicación')
    } finally {
      setIsDeleting(false)
    }
  }

  const getInventarioNombre = (idInventario: string) => {
    const inventario = inventarios.find(inv => inv.id === idInventario)
    return inventario?.nombre || 'Inventario no encontrado'
  }

  const filteredUbicaciones = selectedInventario === 'todos' 
    ? ubicaciones 
    : ubicaciones.filter(u => u.idInventario === selectedInventario)

  const sortedUbicaciones = [...filteredUbicaciones].sort((a, b) =>
    a.nombre.localeCompare(b.nombre)
  )

  const groupedUbicaciones = sortedUbicaciones.reduce((acc, ubicacion) => {
    const inventarioId = ubicacion.idInventario
    if (!acc[inventarioId]) {
      acc[inventarioId] = []
    }
    acc[inventarioId].push(ubicacion)
    return acc
  }, {} as Record<string, Ubicacion[]>)

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Ubicaciones de Almacén</h1>
          <p className='text-muted-foreground'>
            Administra las ubicaciones físicas para organizar el inventario.
          </p>
        </div>
        <Button onClick={() => setShowNewForm(true)}>
          <PlusCircle className='mr-2 h-4 w-4' />
          Nueva Ubicación
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className='flex justify-between items-center'>
            <div>
              <CardTitle>Ubicaciones Registradas</CardTitle>
              <CardDescription>
                Lista de todas las ubicaciones disponibles para asignar a artículos.
              </CardDescription>
            </div>
            <Select
              value={selectedInventario}
              onValueChange={setSelectedInventario}
            >
              <SelectTrigger className='w-[200px]'>
                <SelectValue placeholder='Filtrar por inventario' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='todos'>Todos los inventarios</SelectItem>
                {inventarios.map((inventario) => (
                  <SelectItem key={inventario.id} value={inventario.id}>
                    {inventario.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {sortedUbicaciones.length === 0 ? (
            <p className='text-center py-8 text-muted-foreground'>
              No hay ubicaciones registradas. Crea una nueva para comenzar.
            </p>
          ) : (
            <ScrollArea className='h-[600px]'>
              {selectedInventario === 'todos' ? (
                // Mostrar agrupado por inventario
                <div className='space-y-6 p-4'>
                  {Object.entries(groupedUbicaciones).map(([inventarioId, ubicaciones]) => (
                    <div key={inventarioId} className='space-y-4'>
                      <h3 className='text-lg font-semibold text-muted-foreground'>
                        {getInventarioNombre(inventarioId)}
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {ubicaciones.map((ubicacion) => (
                          <Card key={ubicacion.id} className='relative group'>
                            <CardHeader className='pb-2'>
                              <div className='flex items-center justify-between'>
                                <div className='flex items-center space-x-2'>
                                  <Warehouse className='h-5 w-5 text-muted-foreground' />
                                  <CardTitle className='text-lg'>{ubicacion.nombre}</CardTitle>
                                </div>
                                <div className='flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    onClick={() => setEditingUbicacion(ubicacion)}
                                    className='h-8 w-8'
                                  >
                                    <Pencil className='h-4 w-4' />
                                  </Button>
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    onClick={() => setDeletingUbicacion(ubicacion)}
                                    className='h-8 w-8'
                                  >
                                    <Trash2 className='h-4 w-4' />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Mostrar solo las ubicaciones del inventario seleccionado
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4'>
                  {sortedUbicaciones.map((ubicacion) => (
                    <Card key={ubicacion.id} className='relative group'>
                      <CardHeader className='pb-2'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-2'>
                            <Warehouse className='h-5 w-5 text-muted-foreground' />
                            <CardTitle className='text-lg'>{ubicacion.nombre}</CardTitle>
                          </div>
                          <div className='flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => setEditingUbicacion(ubicacion)}
                              className='h-8 w-8'
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => setDeletingUbicacion(ubicacion)}
                              className='h-8 w-8'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <NuevaUbicacionForm
        open={showNewForm}
        onOpenChange={setShowNewForm}
        onUbicacionCreada={() => {
          setShowNewForm(false)
          toast.success('Ubicación creada exitosamente')
        }}
      />

      {editingUbicacion && (
        <NuevaUbicacionForm
          open={!!editingUbicacion}
          onOpenChange={(open) => {
            if (!open) setEditingUbicacion(null)
          }}
          ubicacionToEdit={editingUbicacion}
          onUbicacionCreada={() => {
            setEditingUbicacion(null)
            toast.success('Ubicación actualizada exitosamente')
          }}
        />
      )}

      <AlertDialog
        open={!!deletingUbicacion}
        onOpenChange={(open) => !open && setDeletingUbicacion(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la ubicación "{deletingUbicacion?.nombre}".
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className='bg-destructive text-destructive-foreground'
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
