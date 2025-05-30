import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { Edit, Trash2, Plus } from 'lucide-react'
import { FeatureLayout } from '@/components/layout/feature-layout'
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy } from 'firebase/firestore'
import { database as db } from '@/firebase'

interface ProveedorForm {
  id: string
  nombre: string
  rnc: string
  telefono: string
  email: string
}

export default function Proveedores() {
  const [proveedores, setProveedores] = useState<ProveedorForm[]>([])
  const [nombre, setNombre] = useState('')
  const [rnc, setRnc] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProveedores()
  }, [])

  const fetchProveedores = async () => {
    try {
      const q = query(collection(db, 'proveedores'), orderBy('nombre'))
      const querySnapshot = await getDocs(q)
      const proveedoresData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProveedorForm[]
      setProveedores(proveedoresData)
    } catch (error) {
      console.error('Error fetching proveedores:', error)
      toast.error('Error al cargar los proveedores')
    } finally {
      setLoading(false)
    }
  }

  const handleAddOrEdit = async () => {
    if (!nombre || !rnc || !telefono || !email) {
      toast.error('Completa todos los campos')
      return
    }

    try {
      if (editId) {
        const proveedorRef = doc(db, 'proveedores', editId)
        await updateDoc(proveedorRef, {
          nombre,
          rnc,
          telefono,
          email,
          updatedAt: new Date()
        })
        toast.success('Proveedor actualizado')
      } else {
        await addDoc(collection(db, 'proveedores'), {
          nombre,
          rnc,
          telefono,
          email,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        toast.success('Proveedor agregado')
      }
      
      setNombre('')
      setRnc('')
      setTelefono('')
      setEmail('')
      setEditId(null)
      setOpen(false)
      fetchProveedores()
    } catch (error) {
      console.error('Error saving proveedor:', error)
      toast.error('Error al guardar el proveedor')
    }
  }

  const handleEdit = (proveedor: ProveedorForm) => {
    setEditId(proveedor.id)
    setNombre(proveedor.nombre)
    setRnc(proveedor.rnc)
    setTelefono(proveedor.telefono)
    setEmail(proveedor.email)
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'proveedores', id))
      toast.success('Proveedor eliminado')
      fetchProveedores()
    } catch (error) {
      console.error('Error deleting proveedor:', error)
      toast.error('Error al eliminar el proveedor')
    }
  }

  const filtered = proveedores.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.rnc.toLowerCase().includes(search.toLowerCase())
  )

  const actions = (
    <>
      <Button variant='outline'>Exportar Excel</Button>
      <Button variant='outline'>Exportar PDF</Button>
    </>
  )

  return (
    <FeatureLayout
      title="Proveedores"
      description="Administra los proveedores de la empresa."
      actions={actions}
    >
      <div className='flex gap-4 items-center flex-wrap'>
        <Input
          placeholder='Buscar por nombre o RNC...'
          value={search}
          onChange={e => setSearch(e.target.value)}
          className='max-w-xs'
        />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button className='ml-auto' onClick={() => { setEditId(null); setNombre(''); setRnc(''); setTelefono(''); setEmail(''); setOpen(true) }}>
              <Plus className='w-4 h-4 mr-2' /> Agregar proveedor
            </Button>
          </SheetTrigger>
          <SheetContent side='top' className='h-[400px] w-full max-w-2xl mx-auto rounded-b-xl border-t-0 animate-in slide-in-from-top duration-300'>
            <SheetHeader className='mb-6'>
              <SheetTitle className='text-2xl'>{editId ? 'Editar Proveedor' : 'Agregar Proveedor'}</SheetTitle>
            </SheetHeader>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-4'>
                <div>
                  <label className='text-sm font-medium mb-1.5 block'>Nombre</label>
                  <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder='Nombre del proveedor' />
                </div>
                <div>
                  <label className='text-sm font-medium mb-1.5 block'>RNC</label>
                  <Input value={rnc} onChange={e => setRnc(e.target.value)} placeholder='RNC del proveedor' />
                </div>
              </div>
              <div className='space-y-4'>
                <div>
                  <label className='text-sm font-medium mb-1.5 block'>Teléfono</label>
                  <Input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder='Teléfono de contacto' />
                </div>
                <div>
                  <label className='text-sm font-medium mb-1.5 block'>Email</label>
                  <Input type='email' value={email} onChange={e => setEmail(e.target.value)} placeholder='correo@ejemplo.com' />
                </div>
              </div>
            </div>
            <div className='flex gap-2 justify-end mt-6'>
              <Button variant='outline' type='button' onClick={() => { setOpen(false); setEditId(null); }}>Cancelar</Button>
              <Button onClick={handleAddOrEdit}>{editId ? 'Actualizar' : 'Agregar'}</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className='border rounded-lg overflow-x-auto bg-white'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>RNC</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className='text-center text-muted-foreground py-8'>Cargando proveedores...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='text-center text-muted-foreground py-8'>No hay proveedores registrados.</TableCell>
              </TableRow>
            ) : filtered.map((proveedor) => (
              <TableRow key={proveedor.id}>
                <TableCell>{proveedor.nombre}</TableCell>
                <TableCell>{proveedor.rnc}</TableCell>
                <TableCell>{proveedor.telefono}</TableCell>
                <TableCell>{proveedor.email}</TableCell>
                <TableCell className='flex gap-2'>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size='icon' variant='outline' onClick={() => handleEdit(proveedor)}>
                        <Edit className='w-4 h-4' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Editar</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size='icon' variant='destructive' onClick={() => handleDelete(proveedor.id)}>
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