import { useState, useMemo } from 'react'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { Articulo } from 'shared-types'
import { getArticulosColumns } from './columns'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Grid3X3, List, Pencil, Repeat, Trash2 } from 'lucide-react'

interface ArticulosTableProps {
  articulos: Articulo[]
  onVer?: (articulo: Articulo) => void
  onEditar?: (articulo: Articulo) => void
  onTransferir?: (articulo: Articulo) => void
  onEliminar?: (articulo: Articulo) => void
}

export function ArticulosTable({ articulos, onVer, onEditar, onTransferir, onEliminar }: ArticulosTableProps) {
  const [search, setSearch] = useState('')
  const [displayStyle, setDisplayStyle] = useState<'tabla' | 'tarjetas'>('tabla')

  const filteredArticulos = useMemo(() => {
    return articulos.filter(a =>
      a.nombre.toLowerCase().includes(search.toLowerCase()) ||
      a.descripcion?.toLowerCase().includes(search.toLowerCase())
    )
  }, [articulos, search])

  const table = useReactTable({
    data: filteredArticulos,
    columns: getArticulosColumns({ onVer, onEditar, onTransferir, onEliminar }),
    getCoreRowModel: getCoreRowModel(),
  })

  if (articulos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No hay artículos</CardTitle>
          <CardDescription>
            Este inventario aún no tiene artículos registrados.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <Input
          placeholder='Buscar artículos...'
          value={search}
          onChange={e => setSearch(e.target.value)}
          className='max-w-xs'
        />
        <Button
          variant='outline'
          size='icon'
          onClick={() => setDisplayStyle(displayStyle === 'tabla' ? 'tarjetas' : 'tabla')}
        >
          {displayStyle === 'tabla' ? <Grid3X3 className='h-4 w-4' /> : <List className='h-4 w-4' />}
        </Button>
      </div>
      {displayStyle === 'tabla' ? (
        <div className='border rounded-lg overflow-x-auto'>
          <table className='min-w-full'>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className='px-4 py-2 text-left'>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className='px-4 py-2'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 transition-all duration-300'>
          {filteredArticulos.map((articulo: Articulo) => (
            <Card key={articulo.id} className='flex flex-col'>
              <CardHeader>
                <CardTitle>{articulo.nombre}</CardTitle>
                <CardDescription>{articulo.descripcion}</CardDescription>
              </CardHeader>
              {typeof (articulo as any).imagenUrl === 'string' && (articulo as any).imagenUrl.length > 0 && (
                <img src={(articulo as any).imagenUrl} alt={articulo.nombre} className='w-full h-40 object-cover rounded-b' />
              )}
              <div className='flex-1 p-4'>
                <div className='mb-2'><span className='font-bold'>Tipo:</span> {articulo.tipo}</div>
                <div><span className='font-bold'>Marca:</span> {articulo.marca}</div>
                <div><span className='font-bold'>Modelo:</span> {articulo.modelo}</div>
                <div><span className='font-bold'>Serial:</span> {articulo.serial || 'N/A'}</div>
                <div><span className='font-bold'>Cantidad:</span> {articulo.cantidad}</div>
                <div><span className='font-bold'>Costo:</span> {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(articulo.costo))}</div>
                <div><span className='font-bold'>Ubicación:</span> {articulo.ubicacion}</div>
              </div>
              {/* Acciones */}
              <div className='flex gap-2 p-4 border-t'>
                <Button variant='ghost' size='icon' onClick={() => onVer?.(articulo)}><Grid3X3 className='w-4 h-4' /></Button>
                <Button variant='ghost' size='icon' onClick={() => onEditar?.(articulo)}><Pencil className='w-4 h-4' /></Button>
                <Button variant='ghost' size='icon' onClick={() => onTransferir?.(articulo)}><Repeat className='w-4 h-4' /></Button>
                <Button variant='ghost' size='icon' onClick={() => onEliminar?.(articulo)}><Trash2 className='w-4 h-4 text-red-600' /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 