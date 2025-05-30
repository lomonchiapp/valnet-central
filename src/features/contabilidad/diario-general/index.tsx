import { useState } from 'react'
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

// import { useContabilidadState } from '@/context/global/useContabilidadState' // Para datos reales

// Placeholder de datos
const asientos = [
  {
    id: '1',
    fecha: '2024-06-01',
    descripcion: 'Pago de alquiler',
    movimientos: [
      { cuenta: 'Gastos de alquiler', debe: 1000, haber: 0 },
      { cuenta: 'Banco', debe: 0, haber: 1000 },
    ],
  },
  {
    id: '2',
    fecha: '2024-06-02',
    descripcion: 'Compra de suministros',
    movimientos: [
      { cuenta: 'Suministros', debe: 500, haber: 0 },
      { cuenta: 'Banco', debe: 0, haber: 500 },
    ],
  },
]

export default function DiarioGeneral() {
  // const { diarioGeneral } = useContabilidadState() // Para datos reales
  const [search, setSearch] = useState('')
  const [filtered, setFiltered] = useState(asientos)

  // Filtro básico por descripción
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setFiltered(
      asientos.filter((a) =>
        a.descripcion.toLowerCase().includes(e.target.value.toLowerCase())
      )
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold'>Diario General</h1>
          <p className='text-muted-foreground'>
            Consulta y administra el diario general contable.
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline'>Exportar Excel</Button>
          <Button variant='outline'>Exportar PDF</Button>
          <Button>Agregar Asiento</Button>
        </div>
      </div>
      <div className='flex gap-4 items-center'>
        <Input
          placeholder='Buscar por descripción...'
          value={search}
          onChange={handleSearch}
          className='max-w-xs'
        />
        {/* Aquí puedes agregar más filtros: por fecha, cuenta, etc. */}
      </div>
      <div className='border rounded-lg overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Movimientos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((asiento) => (
              <TableRow key={asiento.id}>
                <TableCell>{asiento.fecha}</TableCell>
                <TableCell>{asiento.descripcion}</TableCell>
                <TableCell>
                  <ul className='list-disc pl-4'>
                    {asiento.movimientos.map((m, i) => (
                      <li key={i}>
                        <span className='font-semibold'>{m.cuenta}:</span>
                        <span className='text-green-700'>Debe: {m.debe}</span> /
                        <span className='text-red-700'>Haber: {m.haber}</span>
                      </li>
                    ))}
                  </ul>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Paginación (placeholder) */}
      <div className='flex justify-end gap-2'>
        <Button variant='outline'>Anterior</Button>
        <Button variant='outline'>Siguiente</Button>
      </div>
    </div>
  )
}
