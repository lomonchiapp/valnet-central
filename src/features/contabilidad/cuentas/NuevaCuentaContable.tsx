import { useState, useEffect } from 'react'
import {
  Cuenta,
  TipoCuentaContable,
} from '@/types/interfaces/contabilidad/cuenta'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCrearCuenta, useActualizarCuenta } from './hooks'

interface NuevaCuentaContableProps {
  cuentas: (Cuenta & { parentId?: string })[]
  onSuccess?: () => void
  editCuenta?: (Cuenta & { parentId?: string }) | null
}

export function NuevaCuentaContable({
  cuentas,
  onSuccess,
  editCuenta,
}: NuevaCuentaContableProps) {
  const { crearCuenta } = useCrearCuenta()
  const { actualizarCuenta } = useActualizarCuenta()

  const [isOpen, setIsOpen] = useState(false)
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState<TipoCuentaContable>(
    TipoCuentaContable.ACTIVO
  )
  const [descripcion, setDescripcion] = useState('')
  const [balance, setBalance] = useState('0')
  const [parentId, setParentId] = useState<string>('none')
  const [editId, setEditId] = useState<string | null>(null)

  // Filtrar solo cuentas principales (sin parentId)
  const principales = cuentas.filter((c) => !c.parentId)

  useEffect(() => {
    if (editCuenta) {
      setEditId(editCuenta.id)
      setNombre(editCuenta.nombre)
      setTipo(editCuenta.tipo)
      setDescripcion(editCuenta.descripcion)
      setBalance(editCuenta.balance.toString())
      setParentId(editCuenta.parentId || 'none')
      setIsOpen(true)
    }
  }, [editCuenta])

  const resetForm = () => {
    setNombre('')
    setTipo(TipoCuentaContable.ACTIVO)
    setDescripcion('')
    setBalance('0')
    setParentId('none')
    setEditId(null)
  }

  const handleSubmit = async () => {
    if (!nombre || !tipo) {
      toast.error('Completa el nombre y tipo de cuenta')
      return
    }

    const cuentaData = {
      nombre,
      tipo,
      descripcion,
      balance: Number(balance),
      parentId: parentId === 'none' ? undefined : parentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    try {
      if (editId) {
        await actualizarCuenta(editId, cuentaData)
      } else {
        await crearCuenta(cuentaData)
      }
      resetForm()
      setIsOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error al guardar la cuenta:', error)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button onClick={() => resetForm()}>
          <Plus className='mr-2 h-4 w-4' />
          Nueva cuenta
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{editId ? 'Editar cuenta' : 'Nueva cuenta'}</SheetTitle>
          <SheetDescription>
            {editId
              ? 'Modifica los datos de la cuenta seleccionada'
              : 'Agrega una nueva cuenta al catálogo'}
          </SheetDescription>
        </SheetHeader>
        <div className='grid gap-4 py-4'>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Nombre</label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder='Nombre de la cuenta'
            />
          </div>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Tipo</label>
            <Select
              value={tipo}
              onValueChange={(value) => setTipo(value as TipoCuentaContable)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Selecciona el tipo' />
              </SelectTrigger>
              <SelectContent>
                {Object.values(TipoCuentaContable).map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Descripción</label>
            <Input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder='Descripción de la cuenta'
            />
          </div>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Balance inicial</label>
            <Input
              type='number'
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder='0.00'
            />
          </div>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Cuenta padre</label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger>
                <SelectValue placeholder='Selecciona cuenta padre' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='none'>Cuenta principal</SelectItem>
                {principales.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSubmit} className='w-full'>
            {editId ? 'Actualizar cuenta' : 'Agregar cuenta'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
