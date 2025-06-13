import { useState, useEffect } from 'react'
import { Search, Grid3X3, List, ArrowUpDown, Eye, Pencil, Repeat, Trash2 } from 'lucide-react'
import { Articulo, TipoArticulo } from 'shared-types'
import { useAlmacenState } from '@/context/global/useAlmacenState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ArticulosTableProps {
  articulos: Articulo[]
  onEliminarArticulo?: (articulo: Articulo) => void
}

// Extensión de Articulo para incluir campos opcionales como cantidad_minima
interface ExtendedArticulo extends Articulo {
  cantidad_minima?: number
  codigoBarras?: string
  mac?: string
  wirelessKey?: string
  garantia?: number
  imagenUrl?: string
}



export function ArticulosTable({ articulos, onEliminarArticulo }: ArticulosTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'todos' | 'equipos' | 'materiales'>('todos')
  const [displayStyle, setDisplayStyle] = useState<'tabla' | 'tarjetas'>('tabla')
  const [sortField, setSortField] = useState<string>('nombre')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const { marcas, subscribeToMarcas, ubicaciones, subscribeToUbicaciones } = useAlmacenState()

  useEffect(() => {
    const unsubscribeMarcas = subscribeToMarcas()
    const unsubscribeUbicaciones = subscribeToUbicaciones()
    return () => {
      unsubscribeMarcas()
      unsubscribeUbicaciones()
    }
  }, [subscribeToMarcas, subscribeToUbicaciones])

  // Cast articulos to extended type
  const articulosExtended = articulos as ExtendedArticulo[]

  const getBrandName = (brandId: string): string => {
    if (!brandId) return ''
    const brand = marcas.find((m) => m.id === brandId)
    return brand ? brand.nombre : brandId
  }


  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value)
  }

  const getBadgeVariant = (tipo: TipoArticulo) => {
    switch (tipo) {
      case TipoArticulo.EQUIPO:
        return 'default'
      case TipoArticulo.MATERIAL:
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const filteredArticulos = articulosExtended.filter((articulo) => {
    const matchesSearch = 
      articulo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      articulo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      articulo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      articulo.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      articulo.serial?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesView = 
      viewMode === 'todos' ||
      (viewMode === 'equipos' && articulo.tipo === TipoArticulo.EQUIPO) ||
      (viewMode === 'materiales' && articulo.tipo === TipoArticulo.MATERIAL)

    return matchesSearch && matchesView
  })

  const sortedArticulos = [...filteredArticulos].sort((a, b) => {
    const fieldA = a[sortField as keyof typeof a]
    const fieldB = b[sortField as keyof typeof b]

    if (!fieldA && !fieldB) return 0
    if (!fieldA) return sortDirection === 'asc' ? -1 : 1
    if (!fieldB) return sortDirection === 'asc' ? 1 : -1

    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortDirection === 'asc'
        ? fieldA.localeCompare(fieldB)
        : fieldB.localeCompare(fieldA)
    }

    if (typeof fieldA === 'number' && typeof fieldB === 'number') {
      return sortDirection === 'asc' ? fieldA - fieldB : fieldB - fieldA
    }

    return 0
  })

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getUbicacionNombre = (ubicacionId: string): string => {
    if (!ubicacionId) return 'Sin ubicación'
    const ubicacion = ubicaciones.find((u) => u.id === ubicacionId)
    return ubicacion ? ubicacion.nombre : 'Sin ubicación'
  }

  const renderSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className='ml-1 h-3 w-3 text-muted-foreground opacity-50' />
    }
    return (
      <ArrowUpDown 
        className={`ml-1 h-3 w-3 text-primary ${sortDirection === 'desc' ? 'rotate-180' : ''}`} 
      />
    )
  }

  const handleVer = (articulo: Articulo) => {
    // Aquí puedes abrir un modal o navegar a la vista de detalle
    alert('Ver detalles de: ' + articulo.nombre)
  }
  const handleEditar = (articulo: Articulo) => {
    // Aquí puedes abrir un modal de edición
    alert('Editar: ' + articulo.nombre)
  }
  const handleTransferir = (articulo: Articulo) => {
    // Aquí puedes abrir un modal de transferencia
    alert('Transferir: ' + articulo.nombre)
  }
  const handleEliminar = (articulo: Articulo) => {
    if (window.confirm('¿Seguro que deseas eliminar este artículo?')) {
      if (onEliminarArticulo) {
        onEliminarArticulo(articulo)
      }
    }
  }

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

  // Vista de tarjetas
  if (displayStyle === 'tarjetas') {
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
        {sortedArticulos.map((articulo) => (
          <Card key={articulo.id} className='flex flex-col'>
            <CardHeader>
              <CardTitle>{articulo.nombre}</CardTitle>
              <CardDescription>{articulo.descripcion}</CardDescription>
            </CardHeader>
            <div className='flex-1 p-4'>
              <div className='mb-2'><Badge variant={getBadgeVariant(articulo.tipo)}>{articulo.tipo}</Badge></div>
              <div>Marca: {getBrandName(articulo.marca)}</div>
              <div>Modelo: {articulo.modelo}</div>
              <div>Serial: {articulo.serial || 'N/A'}</div>
              <div>Cantidad: {articulo.cantidad}</div>
              <div>Costo: {formatCurrency(articulo.costo)}</div>
              <div>Ubicación: {getUbicacionNombre(articulo.ubicacion)}</div>
            </div>
            <div className='flex gap-2 p-4 border-t'>
              <Button variant='ghost' size='icon' onClick={() => handleVer(articulo)}><Eye className='w-4 h-4' /></Button>
              <Button variant='ghost' size='icon' onClick={() => handleEditar(articulo)}><Pencil className='w-4 h-4' /></Button>
              <Button variant='ghost' size='icon' onClick={() => handleTransferir(articulo)}><Repeat className='w-4 h-4' /></Button>
              <Button variant='ghost' size='icon' onClick={() => handleEliminar(articulo)}><Trash2 className='w-4 h-4 text-red-600' /></Button>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Controles */}
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
        <div className='relative w-full max-w-sm'>
          <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Buscar artículos...'
            className='pl-10'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className='flex items-center gap-2'>
          <Tabs
            value={viewMode}
            onValueChange={(value) => setViewMode(value as 'todos' | 'equipos' | 'materiales')}
          >
            <TabsList>
              <TabsTrigger value='todos'>Todos</TabsTrigger>
              <TabsTrigger value='equipos'>Equipos</TabsTrigger>
              <TabsTrigger value='materiales'>Materiales</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button
            variant='outline'
            size='icon'
            onClick={() => setDisplayStyle(displayStyle === 'tabla' ? 'tarjetas' : 'tabla')}
          >
            {displayStyle === 'tabla' ? <Grid3X3 className='h-4 w-4' /> : <List className='h-4 w-4' />}
          </Button>
        </div>
      </div>

      {/* Tabla responsiva */}
      <div className='border rounded-lg overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className='cursor-pointer whitespace-nowrap'
                onClick={() => handleSort('nombre')}
              >
                Nombre {renderSortIcon('nombre')}
              </TableHead>
              <TableHead>Tipo</TableHead>
              {viewMode !== 'equipos' && (
                <TableHead 
                  className='cursor-pointer whitespace-nowrap text-center'
                  onClick={() => handleSort('cantidad')}
                >
                  Cantidad {renderSortIcon('cantidad')}
                </TableHead>
              )}
              <TableHead 
                className='cursor-pointer whitespace-nowrap'
                onClick={() => handleSort('marca')}
              >
                Marca {renderSortIcon('marca')}
              </TableHead>
              <TableHead className='whitespace-nowrap'>Modelo</TableHead>
              {viewMode !== 'materiales' && (
                <TableHead className='whitespace-nowrap'>Serial</TableHead>
              )}
              <TableHead 
                className='cursor-pointer whitespace-nowrap text-right'
                onClick={() => handleSort('costo')}
              >
                Costo {renderSortIcon('costo')}
              </TableHead>
              <TableHead className='whitespace-nowrap'>Ubicación</TableHead>
              <TableHead className='whitespace-nowrap text-center'>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedArticulos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className='h-24 text-center'>
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            ) : (
              sortedArticulos.map((articulo) => (
                <TableRow key={articulo.id}>
                  <TableCell className='font-medium'>
                    <div>
                      <div className='font-semibold'>{articulo.nombre}</div>
                      {articulo.descripcion && (
                        <div className='text-xs text-muted-foreground'>{articulo.descripcion}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(articulo.tipo)}>
                      {articulo.tipo}
                    </Badge>
                  </TableCell>
                  {viewMode !== 'equipos' && (
                    <TableCell className='text-center'>
                      <div className='flex flex-col items-center'>
                        <span className={
                          articulo.cantidad_minima && articulo.cantidad <= articulo.cantidad_minima
                            ? 'text-red-600 font-bold'
                            : ''
                        }>
                          {articulo.cantidad}
                        </span>
                        {articulo.cantidad_minima && articulo.cantidad <= articulo.cantidad_minima && (
                          <Badge variant='destructive' className='text-xs mt-1'>
                            Bajo stock
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  )}
                  <TableCell>{getBrandName(articulo.marca)}</TableCell>
                  <TableCell>{articulo.modelo}</TableCell>
                  {viewMode !== 'materiales' && (
                    <TableCell>{articulo.serial || 'N/A'}</TableCell>
                  )}
                  <TableCell className='text-right'>{formatCurrency(articulo.costo)}</TableCell>
                  <TableCell>{getUbicacionNombre(articulo.ubicacion)}</TableCell>
                  <TableCell className='text-center'>
                    <div className='flex gap-2 justify-center'>
                      <Button variant='ghost' size='icon' onClick={() => handleVer(articulo)}><Eye className='w-4 h-4' /></Button>
                      <Button variant='ghost' size='icon' onClick={() => handleEditar(articulo)}><Pencil className='w-4 h-4' /></Button>
                      <Button variant='ghost' size='icon' onClick={() => handleTransferir(articulo)}><Repeat className='w-4 h-4' /></Button>
                      <Button variant='ghost' size='icon' onClick={() => handleEliminar(articulo)}><Trash2 className='w-4 h-4 text-red-600' /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
