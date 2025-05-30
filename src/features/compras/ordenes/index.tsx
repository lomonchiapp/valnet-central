import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { Edit, Trash2, Plus, X } from 'lucide-react'
import { FeatureLayout } from '@/components/layout/feature-layout'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore'
import { database as db } from '@/firebase'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ItemForm {
  descripcion: string
  cantidad: number
  precioUnitario: number
}

interface OrdenForm {
  id: string
  proveedor: string
  fecha: string
  items: ItemForm[]
  total: number
  estado: string
}

const estados = ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'PAGADA']

export default function OrdenesCompra() {
  const [ordenes, setOrdenes] = useState<OrdenForm[]>([])
  const [proveedor, setProveedor] = useState('')
  const [fecha, setFecha] = useState('')
  const [items, setItems] = useState<ItemForm[]>([])
  const [itemDesc, setItemDesc] = useState('')
  const [itemCant, setItemCant] = useState('')
  const [itemPrecio, setItemPrecio] = useState('')
  const [estado, setEstado] = useState('PENDIENTE')
  const [editId, setEditId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrdenes()
  }, [])

  const fetchOrdenes = async () => {
    try {
      const q = query(collection(db, 'ordenes-compra'), orderBy('fecha', 'desc'))
      const querySnapshot = await getDocs(q)
      const ordenesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as OrdenForm[]
      setOrdenes(ordenesData)
    } catch (error) {
      console.error('Error fetching ordenes:', error)
      toast.error('Error al cargar las órdenes')
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = () => {
    if (!itemDesc || !itemCant || !itemPrecio) {
      toast.error('Completa todos los campos del item')
      return
    }
    setItems([...items, { descripcion: itemDesc, cantidad: Number(itemCant), precioUnitario: Number(itemPrecio) }])
    setItemDesc('')
    setItemCant('')
    setItemPrecio('')
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleAddOrEdit = async () => {
    if (!proveedor || !fecha || items.length === 0) {
      toast.error('Completa todos los campos y agrega al menos un item')
      return
    }
    const total = items.reduce((acc, i) => acc + i.cantidad * i.precioUnitario, 0)

    try {
      if (editId) {
        const ordenRef = doc(db, 'ordenes-compra', editId)
        await updateDoc(ordenRef, {
          proveedor,
          fecha,
          items,
          total,
          estado,
          updatedAt: new Date()
        })
        toast.success('Orden actualizada')
      } else {
        await addDoc(collection(db, 'ordenes-compra'), {
          proveedor,
          fecha,
          items,
          total,
          estado,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        toast.success('Orden agregada')
      }
      
      setProveedor('')
      setFecha('')
      setItems([])
      setEstado('PENDIENTE')
      setEditId(null)
      setOpen(false)
      fetchOrdenes()
    } catch (error) {
      console.error('Error saving orden:', error)
      toast.error('Error al guardar la orden')
    }
  }

  const handleEdit = (orden: OrdenForm) => {
    setEditId(orden.id)
    setProveedor(orden.proveedor)
    setFecha(orden.fecha)
    setItems(orden.items)
    setEstado(orden.estado)
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'ordenes-compra', id))
      toast.success('Orden eliminada')
      fetchOrdenes()
    } catch (error) {
      console.error('Error deleting orden:', error)
      toast.error('Error al eliminar la orden')
    }
  }

  const filtered = ordenes.filter(o =>
    o.proveedor.toLowerCase().includes(search.toLowerCase())
  )

  const actions = (
    <>
      <Button variant='outline'>Exportar Excel</Button>
      <Button variant='outline'>Exportar PDF</Button>
    </>
  )

  return (
    <FeatureLayout
      title="Órdenes de Compra"
      description="Administra las órdenes de compra de la empresa."
      actions={actions}
    >
      <div className='flex gap-4 items-center flex-wrap'>
        <Input
          placeholder='Buscar por proveedor...'
          value={search}
          onChange={e => setSearch(e.target.value)}
          className='max-w-xs'
        />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button className='ml-auto' onClick={() => { setEditId(null); setProveedor(''); setFecha(''); setItems([]); setEstado('PENDIENTE'); setOpen(true) }}>
              <Plus className='w-4 h-4 mr-2' /> Agregar orden
            </Button>
          </SheetTrigger>
          <SheetContent side='top' className='h-[600px] w-full max-w-4xl mx-auto rounded-b-xl border-t-0 animate-in slide-in-from-top duration-300'>
            <SheetHeader className='mb-6'>
              <SheetTitle className='text-2xl'>{editId ? 'Editar Orden' : 'Agregar Orden'}</SheetTitle>
            </SheetHeader>
            <div className='space-y-6'>
              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <label className='text-sm font-medium mb-1.5 block'>Proveedor</label>
                  <Input value={proveedor} onChange={e => setProveedor(e.target.value)} placeholder='Nombre del proveedor' />
                </div>
                <div>
                  <label className='text-sm font-medium mb-1.5 block'>Fecha</label>
                  <Input type='date' value={fecha} onChange={e => setFecha(e.target.value)} />
                </div>
                <div>
                  <label className='text-sm font-medium mb-1.5 block'>Estado</label>
                  <Select value={estado} onValueChange={setEstado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estados.map(e => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>Items</h3>
                <div className='grid grid-cols-4 gap-2 mb-2'>
                  <Input value={itemDesc} onChange={e => setItemDesc(e.target.value)} placeholder='Descripción' />
                  <Input type='number' value={itemCant} onChange={e => setItemCant(e.target.value)} placeholder='Cantidad' />
                  <Input type='number' value={itemPrecio} onChange={e => setItemPrecio(e.target.value)} placeholder='Precio Unitario' />
                  <Button type='button' onClick={handleAddItem}>Agregar Item</Button>
                </div>
                <div className='border rounded-lg p-4 space-y-2'>
                  {items.length === 0 ? (
                    <p className='text-muted-foreground text-sm'>No hay items agregados</p>
                  ) : (
                    items.map((item, i) => (
                      <div key={i} className='flex items-center justify-between bg-muted/50 p-2 rounded'>
                        <span>{item.descripcion} - {item.cantidad} x ${item.precioUnitario}</span>
                        <Button size='icon' variant='ghost' onClick={() => handleRemoveItem(i)}>
                          <X className='w-4 h-4' />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className='flex gap-2 justify-end'>
                <Button variant='outline' type='button' onClick={() => { setOpen(false); setEditId(null); }}>Cancelar</Button>
                <Button onClick={handleAddOrEdit}>{editId ? 'Actualizar' : 'Agregar'}</Button>
              </div>
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
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className='text-center text-muted-foreground py-8'>Cargando órdenes...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='text-center text-muted-foreground py-8'>No hay órdenes registradas.</TableCell>
              </TableRow>
            ) : filtered.map((orden) => (
              <TableRow key={orden.id}>
                <TableCell><span className='font-mono text-xs bg-muted px-2 py-1 rounded'>{orden.fecha}</span></TableCell>
                <TableCell>{orden.proveedor}</TableCell>
                <TableCell>
                  <ul className='list-disc pl-4'>
                    {orden.items.map((item, i) => (
                      <li key={i} className='text-sm'>{item.descripcion} - {item.cantidad} x ${item.precioUnitario}</li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell><span className='font-semibold text-primary'>${orden.total.toLocaleString()}</span></TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    orden.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                    orden.estado === 'APROBADA' ? 'bg-green-100 text-green-800' :
                    orden.estado === 'RECHAZADA' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {orden.estado}
                  </span>
                </TableCell>
                <TableCell className='flex gap-2'>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size='icon' variant='outline' onClick={() => handleEdit(orden)}>
                        <Edit className='w-4 h-4' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Editar</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size='icon' variant='destructive' onClick={() => handleDelete(orden.id)}>
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Eliminar</TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </FeatureLayout>
  )
} 