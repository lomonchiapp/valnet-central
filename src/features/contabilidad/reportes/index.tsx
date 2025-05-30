import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const tiposReporte = [
  { value: 'balance', label: 'Balance de Sumas y Saldos' },
  { value: 'mayor', label: 'Libro Mayor' },
  { value: 'resultados', label: 'Estado de Resultados' },
]

// Placeholder de datos para balance
const balanceData = [
  { cuenta: 'Banco', debe: 5000, haber: 0, saldo: 5000 },
  { cuenta: 'Gastos de alquiler', debe: 1000, haber: 0, saldo: 1000 },
  { cuenta: 'Ingresos', debe: 0, haber: 2000, saldo: -2000 },
]

export default function Reportes() {
  const [tipo, setTipo] = useState('balance')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [cuenta, setCuenta] = useState('')

  // Aquí puedes cambiar el dataset según el tipo de reporte
  const data = balanceData // Placeholder

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold'>Reportes Contables</h1>
          <p className='text-muted-foreground'>Genera y consulta reportes contables.</p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline'>Exportar Excel</Button>
          <Button variant='outline'>Exportar PDF</Button>
        </div>
      </div>
      <div className='flex gap-4 items-center flex-wrap'>
        <select value={tipo} onChange={e => setTipo(e.target.value)} className='border rounded px-2 py-1'>
          {tiposReporte.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <Input type='date' value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} placeholder='Desde' />
        <Input type='date' value={fechaFin} onChange={e => setFechaFin(e.target.value)} placeholder='Hasta' />
        <Input value={cuenta} onChange={e => setCuenta(e.target.value)} placeholder='Cuenta (opcional)' />
        <Button>Filtrar</Button>
      </div>
      <div className='border rounded-lg overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cuenta</TableHead>
              <TableHead>Debe</TableHead>
              <TableHead>Haber</TableHead>
              <TableHead>Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={i}>
                <TableCell>{row.cuenta}</TableCell>
                <TableCell>{row.debe}</TableCell>
                <TableCell>{row.haber}</TableCell>
                <TableCell>{row.saldo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 