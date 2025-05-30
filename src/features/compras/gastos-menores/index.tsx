import { useState, useEffect } from 'react'
import { database as db } from '@/firebase'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore'
import { Edit, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { FeatureLayout } from '@/components/layout/feature-layout'

interface GastoMenorForm {
  id: string
  descripcion: string
  monto: number
  fecha: string
  responsable: string
}

export default function GastosMenores() {
  const [gastos, setGastos] = useState<GastoMenorForm[]>([])
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState('')
  const [responsable, setResponsable] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGastos()
  }, [])

  const fetchGastos = async () => {
    try {
      const q = query(
        collection(db, 'gastos-menores'),
        orderBy('fecha', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const gastosData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GastoMenorForm[]
      setGastos(gastosData)
    } catch (error) {
      console.error('Error fetching gastos:', error)
      toast.error('Error al cargar los gastos menores')
    } finally {
      setLoading(false)
    }
  }

  const handleAddOrEdit = async () => {
    if (!descripcion || !monto || !fecha || !responsable) {
      toast.error('Completa todos los campos')
      return
    }

    try {
      if (editId) {
        const gastoRef = doc(db, 'gastos-menores', editId)
        await updateDoc(gastoRef, {
          descripcion,
          monto: Number(monto),
          fecha,
          responsable,
          updatedAt: new Date(),
        })
        toast.success('Gasto menor actualizado')
      } else {
        await addDoc(collection(db, 'gastos-menores'), {
          descripcion,
          monto: Number(monto),
          fecha,
          responsable,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        toast.success('Gasto menor agregado')
      }

      setDescripcion('')
      setMonto('')
      setFecha('')
      setResponsable('')
      setEditId(null)
      setOpen(false)
      fetchGastos()
    } catch (error) {
      console.error('Error saving gasto:', error)
      toast.error('Error al guardar el gasto menor')
    }
  }

  const handleEdit = (gasto: GastoMenorForm) => {
    setEditId(gasto.id)
    setDescripcion(gasto.descripcion)
    setMonto(gasto.monto.toString())
    setFecha(gasto.fecha)
    setResponsable(gasto.responsable)
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'gastos-menores', id))
      toast.success('Gasto menor eliminado')
      fetchGastos()
    } catch (error) {
      console.error('Error deleting gasto:', error)
      toast.error('Error al eliminar el gasto menor')
    }
  }

  const filtered = gastos.filter(
    (g) =>
      g.descripcion.toLowerCase().includes(search.toLowerCase()) ||
      g.responsable.toLowerCase().includes(search.toLowerCase())
  )

  const actions = (
    <>
      <Button variant='outline'>Exportar Excel</Button>
      <Button variant='outline'>Exportar PDF</Button>
    </>
  )

  return (
    <FeatureLayout
      title='Gastos Menores'
      description='Administra los gastos menores de la empresa.'
      actions={actions}
    >
      <div className='flex gap-4 items-center flex-wrap'>
        <Input
          placeholder='Buscar por descripción o responsable...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='max-w-xs'
        />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              className='ml-auto'
              onClick={() => {
                setEditId(null)
                setDescripcion('')
                setMonto('')
                setFecha('')
                setResponsable('')
                setOpen(true)
              }}
            >
              <Plus className='w-4 h-4 mr-2' /> Agregar gasto menor
            </Button>
          </SheetTrigger>
          <SheetContent
            side='top'
            className='h-[400px] w-full max-w-2xl mx-auto rounded-b-xl border-t-0 animate-in slide-in-from-top duration-300'
          >
            <SheetHeader className='mb-6'>
              <SheetTitle className='text-2xl'>
                {editId ? 'Editar Gasto Menor' : 'Agregar Gasto Menor'}
              </SheetTitle>
            </SheetHeader>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-4'>
                <div>
                  <label className='text-sm font-medium mb-1.5 block'>
                    Descripción
                  </label>
                  <Input
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder='Descripción del gasto'
                  />
                </div>
                <div>
                  <label className='text-sm font-medium mb-1.5 block'>
                    Monto
                  </label>
                  <Input
                    type='number'
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    placeholder='0.00'
                  />
                </div>
              </div>
              <div className='space-y-4'>
                <div>
                  <label className='text-sm font-medium mb-1.5 block'>
                    Fecha
                  </label>
                  <Input
                    type='date'
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />
                </div>
                <div>
                  <label className='text-sm font-medium mb-1.5 block'>
                    Responsable
                  </label>
                  <Input
                    value={responsable}
                    onChange={(e) => setResponsable(e.target.value)}
                    placeholder='Nombre del responsable'
                  />
                </div>
              </div>
            </div>
            <div className='flex gap-2 justify-end mt-6'>
              <Button
                variant='outline'
                type='button'
                onClick={() => {
                  setOpen(false)
                  setEditId(null)
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleAddOrEdit}>
                {editId ? 'Actualizar' : 'Agregar'}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className='border rounded-lg overflow-x-auto bg-white'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className='text-center text-muted-foreground py-8'
                >
                  Cargando gastos...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className='text-center text-muted-foreground py-8'
                >
                  No hay gastos menores registrados.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((gasto) => (
                <TableRow key={gasto.id}>
                  <TableCell>
                    <span className='font-mono text-xs bg-muted px-2 py-1 rounded'>
                      {gasto.fecha}
                    </span>
                  </TableCell>
                  <TableCell>{gasto.descripcion}</TableCell>
                  <TableCell>
                    <span className='font-semibold text-primary'>
                      ${gasto.monto.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>{gasto.responsable}</TableCell>
                  <TableCell className='flex gap-2'>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size='icon'
                          variant='outline'
                          onClick={() => handleEdit(gasto)}
                        >
                          <Edit className='w-4 h-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size='icon'
                          variant='destructive'
                          onClick={() => handleDelete(gasto.id)}
                        >
                          <Trash2 className='w-4 h-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Eliminar</TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </FeatureLayout>
  )
}
