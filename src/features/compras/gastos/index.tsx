import { useState } from 'react'
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

interface GastoForm {
  id: string
  proveedor: string
  descripcion: string
  monto: number
  fecha: string
}

export default function Gastos() {
  const [gastos, setGastos] = useState<GastoForm[]>([
    {
      id: '1',
      proveedor: 'Proveedor A',
      descripcion: 'Compra de papelería',
      monto: 200,
      fecha: '2024-06-01',
    },
    {
      id: '2',
      proveedor: 'Proveedor B',
      descripcion: 'Pago de internet',
      monto: 100,
      fecha: '2024-06-02',
    },
  ])
  const [proveedor, setProveedor] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const handleAddOrEdit = () => {
    if (!proveedor || !descripcion || !monto || !fecha) {
      toast.error('Completa todos los campos')
      return
    }
    if (editId) {
      setGastos(
        gastos.map((g) =>
          g.id === editId
            ? {
                id: editId,
                proveedor,
                descripcion,
                monto: Number(monto),
                fecha,
              }
            : g
        )
      )
      setEditId(null)
      toast.success('Gasto actualizado')
    } else {
      setGastos([
        ...gastos,
        {
          id: Date.now().toString(),
          proveedor,
          descripcion,
          monto: Number(monto),
          fecha,
        },
      ])
      toast.success('Gasto agregado')
    }
    setProveedor('')
    setDescripcion('')
    setMonto('')
    setFecha('')
    setOpen(false)
  }

  const handleEdit = (gasto: GastoForm) => {
    setEditId(gasto.id)
    setProveedor(gasto.proveedor)
    setDescripcion(gasto.descripcion)
    setMonto(gasto.monto.toString())
    setFecha(gasto.fecha)
    setOpen(true)
  }

  const handleDelete = (id: string) => {
    setGastos(gastos.filter((g) => g.id !== id))
    toast.success('Gasto eliminado')
  }

  const filtered = gastos.filter(
    (g) =>
      g.descripcion.toLowerCase().includes(search.toLowerCase()) ||
      g.proveedor.toLowerCase().includes(search.toLowerCase())
  )

  const actions = (
    <>
      <Button variant='outline'>Exportar Excel</Button>
      <Button variant='outline'>Exportar PDF</Button>
    </>
  )

  return (
    <FeatureLayout
      title='Gastos / Pagos'
      description='Administra los gastos y pagos realizados por la empresa.'
      actions={actions}
    >
      <div className='flex gap-4 items-center flex-wrap'>
        <Input
          placeholder='Buscar por proveedor o descripción...'
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
                setProveedor('')
                setDescripcion('')
                setMonto('')
                setFecha('')
                setOpen(true)
              }}
            >
              <Plus className='w-4 h-4 mr-2' /> Agregar gasto
            </Button>
          </SheetTrigger>
          <SheetContent
            side='top'
            className='h-[400px] w-full max-w-2xl mx-auto rounded-b-xl border-t-0 animate-in slide-in-from-top duration-300'
          >
            <SheetHeader className='mb-6'>
              <SheetTitle className='text-2xl'>
                {editId ? 'Editar Gasto' : 'Agregar Gasto'}
              </SheetTitle>
            </SheetHeader>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-4'>
                <div>
                  <label className='text-sm font-medium mb-1.5 block'>
                    Proveedor
                  </label>
                  <Input
                    value={proveedor}
                    onChange={(e) => setProveedor(e.target.value)}
                    placeholder='Nombre del proveedor'
                  />
                </div>
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
              </div>
              <div className='space-y-4'>
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
              <TableHead>Proveedor</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className='text-center text-muted-foreground py-8'
                >
                  No hay gastos registrados.
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
                  <TableCell>{gasto.proveedor}</TableCell>
                  <TableCell>{gasto.descripcion}</TableCell>
                  <TableCell>
                    <span className='font-semibold text-primary'>
                      ${gasto.monto.toLocaleString()}
                    </span>
                  </TableCell>
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
