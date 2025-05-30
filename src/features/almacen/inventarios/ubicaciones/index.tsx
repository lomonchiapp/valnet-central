import { useState, useEffect } from 'react'
import { database } from '@/firebase'
import { Ubicacion } from '@/types/interfaces/almacen/ubicacion'
import { doc, deleteDoc } from 'firebase/firestore'
import { PlusCircle, Pencil, Trash2 } from 'lucide-react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { NuevaUbicacionForm } from '../inventario/components/NuevaUbicacionForm'

export default function Ubicaciones() {
  const { ubicaciones, subscribeToUbicaciones } = useAlmacenState()
  const [showNewForm, setShowNewForm] = useState(false)
  const [editingUbicacion, setEditingUbicacion] = useState<Ubicacion | null>(
    null
  )
  const [deletingUbicacion, setDeletingUbicacion] = useState<Ubicacion | null>(
    null
  )
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeToUbicaciones()
    return () => unsubscribe()
  }, [subscribeToUbicaciones])

  const handleDelete = async () => {
    if (!deletingUbicacion) return

    setIsDeleting(true)
    try {
      await deleteDoc(doc(database, 'ubicaciones', deletingUbicacion.id))
      toast.success(`Ubicación "${deletingUbicacion.nombre}" eliminada`)
      setDeletingUbicacion(null)
    } catch (err) {
      //eslint-disable-next-line no-console
      console.error(err)
      toast.error('Error al eliminar la ubicación')
    } finally {
      setIsDeleting(false)
    }
  }

  const sortedUbicaciones = [...ubicaciones].sort((a, b) =>
    a.nombre.localeCompare(b.nombre)
  )

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Ubicaciones</h1>
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
          <CardTitle>Ubicaciones Registradas</CardTitle>
          <CardDescription>
            Lista de todas las ubicaciones disponibles para asignar a artículos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedUbicaciones.length === 0 ? (
            <p className='text-center py-8 text-muted-foreground'>
              No hay ubicaciones registradas. Crea una nueva para comenzar.
            </p>
          ) : (
            <ScrollArea className='h-[500px]'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Fecha de Creación</TableHead>
                    <TableHead className='text-right'>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedUbicaciones.map((ubicacion) => (
                    <TableRow key={ubicacion.id}>
                      <TableCell className='font-medium'>
                        {ubicacion.nombre}
                      </TableCell>
                      <TableCell>
                        {ubicacion.createdAt instanceof Date
                          ? ubicacion.createdAt.toLocaleDateString()
                          : new Date(ubicacion.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end space-x-2'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => setEditingUbicacion(ubicacion)}
                          >
                            <Pencil className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => setDeletingUbicacion(ubicacion)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
