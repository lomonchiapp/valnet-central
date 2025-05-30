import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface CuentaForm {
  id: string
  nombre: string
  tipo: string
  descripcion: string
  balance: number
  parentId?: string // Para jerarquía
}

const tipos = ['ACTIVO', 'PASIVO', 'PATRIMONIO', 'INGRESO', 'COSTO', 'GASTO']

export default function Cuentas() {
  const [cuentas, setCuentas] = useState<CuentaForm[]>([
    {
      id: '1',
      nombre: 'Activos',
      tipo: 'ACTIVO',
      descripcion: 'Activos de la empresa',
      balance: 0,
    },
    {
      id: '2',
      nombre: 'Caja',
      tipo: 'ACTIVO',
      descripcion: 'Efectivo en caja',
      balance: 1000,
      parentId: '1',
    },
    {
      id: '3',
      nombre: 'Banco',
      tipo: 'ACTIVO',
      descripcion: 'Cuenta bancaria',
      balance: 5000,
      parentId: '1',
    },
    {
      id: '4',
      nombre: 'Pasivos',
      tipo: 'PASIVO',
      descripcion: 'Pasivos de la empresa',
      balance: 0,
    },
    {
      id: '5',
      nombre: 'Proveedores',
      tipo: 'PASIVO',
      descripcion: 'Deudas con proveedores',
      balance: 2000,
      parentId: '4',
    },
  ])
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState('ACTIVO')
  const [descripcion, setDescripcion] = useState('')
  const [balance, setBalance] = useState('0')
  const [parentId, setParentId] = useState<string>('')
  const [editId, setEditId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  // Filtrar solo cuentas principales (sin parentId)
  const principales = cuentas.filter((c) => !c.parentId)
  // Subcuentas de una cuenta
  const getSubcuentas = (id: string) => cuentas.filter((c) => c.parentId === id)

  const handleAddOrEdit = () => {
    if (!nombre || !tipo) {
      toast.error('Completa el nombre y tipo de cuenta')
      return
    }
    if (editId) {
      setCuentas(
        cuentas.map((c) =>
          c.id === editId
            ? {
                id: editId,
                nombre,
                tipo,
                descripcion,
                balance: Number(balance),
                parentId: parentId || undefined,
              }
            : c
        )
      )
      setEditId(null)
      toast.success('Cuenta actualizada')
    } else {
      setCuentas([
        ...cuentas,
        {
          id: Date.now().toString(),
          nombre,
          tipo,
          descripcion,
          balance: Number(balance),
          parentId: parentId || undefined,
        },
      ])
      toast.success('Cuenta agregada')
    }
    setNombre('')
    setTipo('ACTIVO')
    setDescripcion('')
    setBalance('0')
    setParentId('')
  }

  const handleEdit = (cuenta: CuentaForm) => {
    setEditId(cuenta.id)
    setNombre(cuenta.nombre)
    setTipo(cuenta.tipo)
    setDescripcion(cuenta.descripcion)
    setBalance(cuenta.balance.toString())
    setParentId(cuenta.parentId || '')
  }

  const handleDelete = (id: string) => {
    setCuentas(cuentas.filter((c) => c.id !== id && c.parentId !== id)) // Elimina cuenta y sus subcuentas
    toast.success('Cuenta eliminada')
  }

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Catálogo de cuentas</h1>
        <p className='text-muted-foreground mb-4'>
          Configura y personaliza las cuentas contables que hacen parte de tu
          catálogo.
        </p>
        <div className='grid grid-cols-1 md:grid-cols-6 gap-4 mt-4'>
          <Input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder='Nombre'
          />
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className='border rounded px-2 py-1'
          >
            {tipos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <Input
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder='Descripción'
          />
          <Input
            type='number'
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder='Balance inicial'
          />
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className='border rounded px-2 py-1'
          >
            <option value=''>Cuenta principal</option>
            {principales.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <Button onClick={handleAddOrEdit}>
            {editId ? 'Actualizar' : 'Agregar'}
          </Button>
        </div>
      </div>
      <div>
        <h2 className='text-2xl font-bold mb-2'>Catálogo de cuentas</h2>
        <div className='border rounded-lg overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {principales.map((cuenta) => (
                <>
                  <TableRow key={cuenta.id} className='bg-gray-50'>
                    <TableCell>
                      {getSubcuentas(cuenta.id).length > 0 && (
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() => toggleExpand(cuenta.id)}
                        >
                          {expanded[cuenta.id] ? '−' : '+'}
                        </Button>
                      )}
                      <span className='font-semibold ml-2'>
                        {cuenta.nombre}
                      </span>
                    </TableCell>
                    <TableCell>{cuenta.tipo}</TableCell>
                    <TableCell>{cuenta.descripcion}</TableCell>
                    <TableCell>${cuenta.balance.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleEdit(cuenta)}
                      >
                        Editar
                      </Button>
                      <Button
                        size='sm'
                        variant='destructive'
                        onClick={() => handleDelete(cuenta.id)}
                        className='ml-2'
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expanded[cuenta.id] &&
                    getSubcuentas(cuenta.id).map((sub) => (
                      <TableRow key={sub.id} className='bg-white'>
                        <TableCell className='pl-8'>↳ {sub.nombre}</TableCell>
                        <TableCell>{sub.tipo}</TableCell>
                        <TableCell>{sub.descripcion}</TableCell>
                        <TableCell>${sub.balance.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => handleEdit(sub)}
                          >
                            Editar
                          </Button>
                          <Button
                            size='sm'
                            variant='destructive'
                            onClick={() => handleDelete(sub.id)}
                            className='ml-2'
                          >
                            Eliminar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
