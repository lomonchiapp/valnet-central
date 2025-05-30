import { useEffect, useState } from 'react'
import { useCoordinacionState } from '@/context/global/useCoordinacionState'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

// Defino el tipo CombustibleRegistroGeneral
interface CombustibleRegistroGeneral {
  id: string
  brigadaId: string
  brigadaNombre: string
  fecha: string
  galones: number
  km_inicial: number
  km_final: number
  referencia: string
}

// Simulación de hook para obtener todos los registros de combustible (reemplazar por hook real)
const useAllCombustible = () => {
  // TODO: Reemplazar por fetch real
  const [registros, setRegistros] = useState<CombustibleRegistroGeneral[]>([])
  useEffect(() => {
    setRegistros([
      {
        id: '1',
        brigadaId: 'A',
        brigadaNombre: 'Brigada Alfa',
        fecha: '2024-06-01',
        galones: 10,
        km_inicial: 1000,
        km_final: 1200,
        referencia: 'Ticket 123',
      },
      {
        id: '2',
        brigadaId: 'B',
        brigadaNombre: 'Brigada Beta',
        fecha: '2024-06-02',
        galones: 15,
        km_inicial: 2000,
        km_final: 2300,
        referencia: 'Ticket 222',
      },
      {
        id: '3',
        brigadaId: 'A',
        brigadaNombre: 'Brigada Alfa',
        fecha: '2024-06-10',
        galones: 12,
        km_inicial: 1200,
        km_final: 1450,
        referencia: 'Ticket 124',
      },
    ])
  }, [])
  return registros
}

export default function CombustibleDashboard() {
  const { brigadas } = useCoordinacionState()
  const registros = useAllCombustible()
  const [filtroBrigada, setFiltroBrigada] = useState('')

  const registrosFiltrados = filtroBrigada
    ? registros.filter((r) => r.brigadaId === filtroBrigada)
    : registros

  // Calcular consumo total por brigada
  const consumoPorBrigada = brigadas.map((b) => {
    const registrosB = registros.filter((r) => r.brigadaId === b.id)
    const totalGalones = registrosB.reduce((acc, r) => acc + r.galones, 0)
    const totalKm = registrosB.reduce(
      (acc, r) => acc + ((r.km_final || 0) - (r.km_inicial || 0)),
      0
    )
    const rendimiento =
      totalGalones > 0 ? (totalKm / totalGalones).toFixed(2) : '-'
    return { nombre: b.nombre, totalGalones, totalKm, rendimiento }
  })

  return (
    <div className='p-4 md:p-6 lg:p-8 space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Dashboard de Combustible de Brigadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='mb-4 flex gap-4 items-center'>
            <label htmlFor='filtroBrigada'>Filtrar por brigada:</label>
            <select
              id='filtroBrigada'
              value={filtroBrigada}
              onChange={(e) => setFiltroBrigada(e.target.value)}
              className='border rounded px-2 py-1'
            >
              <option value=''>Todas</option>
              {brigadas.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className='overflow-x-auto mb-8'>
            <table className='min-w-full text-sm border'>
              <thead>
                <tr className='bg-muted'>
                  <th className='px-2 py-1 border'>Brigada</th>
                  <th className='px-2 py-1 border'>Fecha</th>
                  <th className='px-2 py-1 border'>Galones</th>
                  <th className='px-2 py-1 border'>Km inicial</th>
                  <th className='px-2 py-1 border'>Km final</th>
                  <th className='px-2 py-1 border'>Referencia</th>
                  <th className='px-2 py-1 border'>Rendimiento</th>
                </tr>
              </thead>
              <tbody>
                {registrosFiltrados.map((r) => (
                  <tr key={r.id}>
                    <td className='px-2 py-1 border'>{r.brigadaNombre}</td>
                    <td className='px-2 py-1 border'>{r.fecha}</td>
                    <td className='px-2 py-1 border'>{r.galones}</td>
                    <td className='px-2 py-1 border'>{r.km_inicial}</td>
                    <td className='px-2 py-1 border'>{r.km_final}</td>
                    <td className='px-2 py-1 border'>{r.referencia}</td>
                    <td className='px-2 py-1 border'>
                      {r.km_final && r.km_inicial
                        ? ((r.km_final - r.km_inicial) / r.galones).toFixed(2)
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='mb-4'>
            <h3 className='font-bold mb-2'>
              Comparativo de consumo por brigada
            </h3>
            <table className='min-w-full text-sm border'>
              <thead>
                <tr className='bg-muted'>
                  <th className='px-2 py-1 border'>Brigada</th>
                  <th className='px-2 py-1 border'>Total galones</th>
                  <th className='px-2 py-1 border'>Total km</th>
                  <th className='px-2 py-1 border'>Rendimiento (km/galón)</th>
                </tr>
              </thead>
              <tbody>
                {consumoPorBrigada.map((c) => (
                  <tr key={c.nombre}>
                    <td className='px-2 py-1 border'>{c.nombre}</td>
                    <td className='px-2 py-1 border'>{c.totalGalones}</td>
                    <td className='px-2 py-1 border'>{c.totalKm}</td>
                    <td className='px-2 py-1 border'>{c.rendimiento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
