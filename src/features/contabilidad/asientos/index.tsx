import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { AsientoContable } from '@/types/interfaces/contabilidad/asientoContable'

interface MovimientoForm {
  cuenta: string
  debe: number
  haber: number
}

export default function AsientosContables() {
  const [asientos, setAsientos] = useState<AsientoContable[]>([])
  const [fecha, setFecha] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [movimientos, setMovimientos] = useState<MovimientoForm[]>([])
  const [cuenta, setCuenta] = useState('')
  const [debe, setDebe] = useState('')
  const [haber, setHaber] = useState('')

  const handleAddMovimiento = () => {
    if (!cuenta || (!debe && !haber)) {
      toast.error('Completa la cuenta y el debe o haber')
      return
    }
    setMovimientos([...movimientos, { cuenta, debe: Number(debe) || 0, haber: Number(haber) || 0 }])
    setCuenta('')
    setDebe('')
    setHaber('')
  }

  const handleAddAsiento = () => {
    const totalDebe = movimientos.reduce((acc, m) => acc + m.debe, 0)
    const totalHaber = movimientos.reduce((acc, m) => acc + m.haber, 0)
    if (!fecha || !descripcion || movimientos.length < 2) {
      toast.error('Completa todos los campos y al menos dos movimientos')
      return
    }
    if (totalDebe !== totalHaber) {
      toast.error('El debe y el haber deben ser iguales')
      return
    }
    const now = new Date()
    setAsientos([
      ...asientos,
      {
        id: Date.now().toString(),
        fecha: new Date(fecha),
        descripcion,
        movimientos: movimientos.map(m => ({ cuentaId: m.cuenta, debe: m.debe, haber: m.haber })),
        referencia: '',
        createdAt: now,
        updatedAt: now,
      },
    ])
    setFecha('')
    setDescripcion('')
    setMovimientos([])
    toast.success('Asiento registrado')
  }

  return (
    <div className='flex flex-col items-center w-full min-h-screen bg-muted py-8'>
      <div className='w-full max-w-4xl bg-white rounded-lg shadow p-8'>
        <h1 className='text-2xl font-bold mb-6 text-center'>Nuevo Asiento Contable</h1>
        <form className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
          <div className='space-y-4'>
            <div>
              <label className='block font-medium mb-1'>Fecha *</label>
              <Input type='date' value={fecha} onChange={e => setFecha(e.target.value)} />
            </div>
            <div>
              <label className='block font-medium mb-1'>Descripción *</label>
              <Input value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder='Descripción' />
            </div>
          </div>
          <div className='space-y-4'>
            <div>
              <label className='block font-medium mb-1'>Agregar Movimiento</label>
              <div className='flex gap-2'>
                <Input value={cuenta} onChange={e => setCuenta(e.target.value)} placeholder='Cuenta' />
                <Input type='number' value={debe} onChange={e => setDebe(e.target.value)} placeholder='Debe' />
                <Input type='number' value={haber} onChange={e => setHaber(e.target.value)} placeholder='Haber' />
                <Button type='button' onClick={handleAddMovimiento}>Agregar</Button>
              </div>
            </div>
          </div>
        </form>
        <div className='bg-muted rounded-lg p-4 mb-8'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cuenta</TableHead>
                <TableHead>Debe</TableHead>
                <TableHead>Haber</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimientos.map((m, i) => (
                <TableRow key={i}>
                  <TableCell>{m.cuenta}</TableCell>
                  <TableCell>{m.debe}</TableCell>
                  <TableCell>{m.haber}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className='flex justify-end'>
          <Button onClick={handleAddAsiento}>Registrar Asiento</Button>
        </div>
      </div>
      <div className='w-full max-w-4xl mt-8'>
        <h2 className='text-2xl font-bold mb-2'>Asientos Registrados</h2>
        <div className='border rounded-lg overflow-x-auto bg-white p-4'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Movimientos</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {asientos.map((asiento) => (
                <TableRow key={asiento.id}>
                  <TableCell>{asiento.fecha.toLocaleDateString()}</TableCell>
                  <TableCell>{asiento.descripcion}</TableCell>
                  <TableCell>
                    <ul className='list-disc pl-4'>
                      {asiento.movimientos.map((m, i) => (
                        <li key={i}>{m.cuentaId} - Debe: {m.debe} / Haber: {m.haber}</li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>
                    <Button variant='destructive' size='sm' onClick={() => setAsientos(asientos.filter(a => a.id !== asiento.id))}>Eliminar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
} 