import { useState, useEffect } from 'react'
import {
  Edit,
  Trash2,
  Eye,
  Grid3X3,
  List,
  Filter,
  ArrowUpDown,
  Wifi,
  Package,
  Layers,
  ArrowUpRight,
} from 'lucide-react'
import { Search } from 'lucide-react'
import { Articulo, TipoArticulo } from 'shared-types'
import { useAlmacenState } from '@/context/global/useAlmacenState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { EditEquipoForm } from './EditEquipoForm'
import { SalidaArticuloForm } from './SalidaArticuloForm'

interface ArticulosTableProps {
  articulos: Articulo[]
}

// Extended type for our UI that includes additional fields
interface ExtendedArticulo extends Articulo {
  codigoBarras?: string
  mac?: string
  wirelessKey?: string
  garantia?: number
  imagenUrl?: string
}

// Interface for grouped equipment
interface GroupedEquipo {
  key: string
  nombre: string
  marca: string
  marcaNombre: string
  modelo: string
  equipos: ExtendedArticulo[]
  totalCosto: number
}

export function ArticulosTable({ articulos }: ArticulosTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'todos' | 'equipos' | 'materiales'>(
    'todos'
  )
  const [displayStyle, setDisplayStyle] = useState<'tabla' | 'tarjetas'>(
    'tabla'
  )
  const [sortField, setSortField] = useState<string>('nombre')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [selectedGroup, setSelectedGroup] = useState<GroupedEquipo | null>(null)
  const [showSerialDetails, setShowSerialDetails] = useState(false)
  const [editingEquipo, setEditingEquipo] = useState<ExtendedArticulo | null>(
    null
  )
  const [showEditForm, setShowEditForm] = useState(false)
  const [selectedArticulo, setSelectedArticulo] =
    useState<ExtendedArticulo | null>(null)
  const [showSalidaForm, setShowSalidaForm] = useState(false)

  // Get marcas from global state
  const { marcas, subscribeToMarcas } = useAlmacenState()

  // Subscribe to marcas on component mount
  useEffect(() => {
    const unsubscribe = subscribeToMarcas()
    return () => unsubscribe()
  }, [subscribeToMarcas])

  // Function to get brand name from brand ID
  const getBrandName = (brandId: string): string => {
    const brand = marcas.find((m) => m.id === brandId)
    return brand ? brand.nombre : brandId
  }

  // Cast to our extended type for UI purposes
  const articulosExtended = articulos as ExtendedArticulo[]

  const equipos = articulosExtended.filter(
    (articulo) => articulo.tipo === TipoArticulo.EQUIPO
  )
  const materiales = articulosExtended.filter(
    (articulo) => articulo.tipo === TipoArticulo.MATERIAL
  )

  // Group equipos by name, model and brand
  const groupedEquipos: GroupedEquipo[] = equipos.reduce(
    (groups: GroupedEquipo[], equipo) => {
      const key = `${equipo.nombre}-${equipo.marca}-${equipo.modelo}`
      const existingGroup = groups.find((group) => group.key === key)

      if (existingGroup) {
        existingGroup.equipos.push(equipo)
        existingGroup.totalCosto += equipo.costo
      } else {
        groups.push({
          key,
          nombre: equipo.nombre,
          marca: equipo.marca || '',
          marcaNombre: getBrandName(equipo.marca || ''),
          modelo: equipo.modelo || '',
          equipos: [equipo],
          totalCosto: equipo.costo,
        })
      }

      return groups
    },
    []
  )

  const filteredArticulos = articulosExtended.filter(
    (articulo) =>
      articulo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      articulo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      articulo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      articulo.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      articulo.serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      articulo.codigoBarras?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      articulo.mac?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter grouped equipos
  const filteredGroupedEquipos = groupedEquipos.filter(
    (group) =>
      group.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.equipos.some(
        (equipo) =>
          equipo.serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          equipo.mac?.toLowerCase().includes(searchTerm.toLowerCase())
      )
  )

  const filteredEquipos = equipos.filter(
    (articulo) =>
      articulo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      articulo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      articulo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      articulo.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      articulo.serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      articulo.mac?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredMateriales = materiales.filter(
    (articulo) =>
      articulo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      articulo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      articulo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      articulo.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      articulo.codigoBarras?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  const getArticulosToDisplay = () => {
    let articulos
    switch (viewMode) {
      case 'equipos':
        // When in equipos view, we'll use the grouped view in table mode
        // but keep the original list for card view for now
        articulos = displayStyle === 'tabla' ? [] : filteredEquipos
        break
      case 'materiales':
        articulos = filteredMateriales
        break
      default:
        articulos = filteredArticulos
        break
    }

    // Apply sorting
    return [...articulos].sort((a, b) => {
      const fieldA = a[sortField as keyof typeof a]
      const fieldB = b[sortField as keyof typeof b]

      // Handle null or undefined values
      if (!fieldA && !fieldB) return 0
      if (!fieldA) return sortDirection === 'asc' ? -1 : 1
      if (!fieldB) return sortDirection === 'asc' ? 1 : -1

      // Sort by data type
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc'
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA)
      }

      // For numbers
      if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        return sortDirection === 'asc' ? fieldA - fieldB : fieldB - fieldA
      }

      return 0
    })
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const renderSortIcon = (field: string) => {
    if (sortField !== field)
      return (
        <ArrowUpDown className='ml-1 h-3 w-3 text-muted-foreground opacity-50' />
      )
    return sortDirection === 'asc' ? (
      <ArrowUpDown className='ml-1 h-3 w-3 text-primary' />
    ) : (
      <ArrowUpDown className='ml-1 h-3 w-3 text-primary rotate-180' />
    )
  }

  const renderEquipoCard = (articulo: ExtendedArticulo) => {
    const defaultImage = 'https://placehold.co/400x300?text=Sin+Imagen'
    const brandName = getBrandName(articulo.marca)

    return (
      <Card
        key={articulo.id}
        className='overflow-hidden hover:shadow-md transition-all'
      >
        <div className='aspect-video bg-muted relative overflow-hidden'>
          {articulo.imagenUrl ? (
            <img
              src={articulo.imagenUrl}
              alt={articulo.nombre}
              className='object-cover w-full h-full'
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = defaultImage
              }}
            />
          ) : (
            <div className='flex items-center justify-center h-full bg-muted'>
              <Package className='h-12 w-12 text-muted-foreground opacity-50' />
            </div>
          )}
          <Badge
            className='absolute top-2 right-2'
            variant={articulo.serial ? 'default' : 'outline'}
          >
            {articulo.serial ? 'S/N: ' + articulo.serial : 'Sin S/N'}
          </Badge>
        </div>

        <CardHeader className='p-4 pb-2'>
          <div className='flex justify-between items-start'>
            <CardTitle className='text-base line-clamp-1'>
              {articulo.nombre}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' className='h-8 w-8'>
                  <Eye className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Eye className='h-4 w-4 mr-2' />
                  Ver detalles
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className='h-4 w-4 mr-2' />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem className='text-destructive'>
                  <Trash2 className='h-4 w-4 mr-2' />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription className='line-clamp-1'>
            {brandName} {articulo.modelo}
          </CardDescription>
        </CardHeader>

        <CardContent className='p-4 pt-0 space-y-2'>
          <div className='grid grid-cols-2 gap-1 text-xs'>
            {articulo.mac && (
              <div className='flex items-center space-x-1'>
                <Wifi className='h-3 w-3 text-muted-foreground' />
                <span className='font-mono'>{articulo.mac}</span>
              </div>
            )}
            {articulo.ubicacion && (
              <div className='flex items-center space-x-1 col-span-2'>
                <Layers className='h-3 w-3 text-muted-foreground' />
                <span className='truncate'>{articulo.ubicacion}</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className='p-4 pt-0 flex justify-between text-sm'>
          <span className='text-muted-foreground'>
            {formatCurrency(articulo.costo)}
          </span>
          {articulo.garantia && articulo.garantia > 0 && (
            <span className='text-xs text-green-600'>
              Garantía: {articulo.garantia} meses
            </span>
          )}
        </CardFooter>
      </Card>
    )
  }

  const renderTable = (articulos: ExtendedArticulo[]) => {
    return (
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className='cursor-pointer'
                onClick={() => handleSort('nombre')}
              >
                Nombre {renderSortIcon('nombre')}
              </TableHead>
              {viewMode !== 'equipos' && <TableHead>Tipo</TableHead>}
              {viewMode !== 'equipos' && (
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('cantidad')}
                >
                  Cantidad {renderSortIcon('cantidad')}
                </TableHead>
              )}
              {viewMode !== 'equipos' && <TableHead>Unidad</TableHead>}
              <TableHead
                className='cursor-pointer'
                onClick={() => handleSort('marca')}
              >
                Marca {renderSortIcon('marca')}
              </TableHead>
              <TableHead
                className='cursor-pointer'
                onClick={() => handleSort('modelo')}
              >
                Modelo {renderSortIcon('modelo')}
              </TableHead>
              {viewMode !== 'materiales' && (
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('serial')}
                >
                  Serial {renderSortIcon('serial')}
                </TableHead>
              )}
              {viewMode === 'equipos' && <TableHead>MAC</TableHead>}
              <TableHead
                className='cursor-pointer'
                onClick={() => handleSort('costo')}
              >
                Costo {renderSortIcon('costo')}
              </TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead className='text-right'>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articulos.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={viewMode === 'todos' ? 10 : 9}
                  className='h-24 text-center'
                >
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            ) : (
              articulos.map((articulo) => (
                <TableRow key={articulo.id}>
                  <TableCell className='font-medium'>
                    <div>
                      <div>{articulo.nombre}</div>
                      <div className='text-xs text-muted-foreground'>
                        {articulo.descripcion}
                      </div>
                      {articulo.codigoBarras && (
                        <div className='text-xs text-muted-foreground'>
                          Código: {articulo.codigoBarras}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  {viewMode !== 'equipos' && (
                    <TableCell>
                      <Badge variant={getBadgeVariant(articulo.tipo)}>
                        {articulo.tipo}
                      </Badge>
                    </TableCell>
                  )}
                  {viewMode !== 'equipos' && (
                    <TableCell>{articulo.cantidad}</TableCell>
                  )}
                  {viewMode !== 'equipos' && (
                    <TableCell>{articulo.unidad}</TableCell>
                  )}
                  <TableCell>{getBrandName(articulo.marca)}</TableCell>
                  <TableCell>{articulo.modelo}</TableCell>
                  {viewMode !== 'materiales' && (
                    <TableCell>{articulo.serial}</TableCell>
                  )}
                  {viewMode === 'equipos' && (
                    <TableCell>{articulo.mac}</TableCell>
                  )}
                  <TableCell>{formatCurrency(articulo.costo)}</TableCell>
                  <TableCell>{articulo.ubicacion}</TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end space-x-1'>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => handleOpenSalidaForm(articulo)}
                            >
                              <ArrowUpRight className='h-4 w-4' />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Salida / Transferencia</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon'>
                            <Eye className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className='h-4 w-4 mr-2' />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className='h-4 w-4 mr-2' />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className='text-destructive'>
                            <Trash2 className='h-4 w-4 mr-2' />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    )
  }

  const renderCards = (articulos: ExtendedArticulo[]) => {
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {articulos.length === 0 ? (
          <div className='col-span-full text-center py-10 text-muted-foreground'>
            No se encontraron resultados.
          </div>
        ) : (
          articulos.map(renderEquipoCard)
        )}
      </div>
    )
  }

  // Handler to open the serial details dialog
  const handleViewSerials = (group: GroupedEquipo) => {
    setSelectedGroup(group)
    setShowSerialDetails(true)
  }

  // Handler to close the serial details dialog
  const handleCloseSerialDetails = () => {
    setShowSerialDetails(false)
    setSelectedGroup(null)
    setEditingEquipo(null)
  }

  // Handler to edit a specific equipment
  const handleEditEquipo = (equipo: ExtendedArticulo) => {
    setEditingEquipo(equipo)
    setShowEditForm(true)
  }

  const handleEquipoUpdated = () => {
    // Close the edit form
    setShowEditForm(false)
    setEditingEquipo(null)

    // Close the serial details dialog if it's open
    if (showSerialDetails) {
      setShowSerialDetails(false)
      setSelectedGroup(null)
    }
  }

  // Handler to open the salida form
  const handleOpenSalidaForm = (articulo: ExtendedArticulo) => {
    setSelectedArticulo(articulo)
    setShowSalidaForm(true)
  }

  // Render the table with grouped equipment
  const renderGroupedEquiposTable = () => {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className='w-[200px] cursor-pointer'
              onClick={() => handleSort('nombre')}
            >
              Nombre {renderSortIcon('nombre')}
            </TableHead>
            <TableHead
              className='cursor-pointer'
              onClick={() => handleSort('marca')}
            >
              Marca {renderSortIcon('marca')}
            </TableHead>
            <TableHead
              className='cursor-pointer'
              onClick={() => handleSort('modelo')}
            >
              Modelo {renderSortIcon('modelo')}
            </TableHead>
            <TableHead className='text-center'>Cantidad</TableHead>
            <TableHead className='text-center'>Series</TableHead>
            <TableHead className='text-right'>Costo Total</TableHead>
            <TableHead className='w-[100px] text-right'>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredGroupedEquipos.map((group) => (
            <TableRow key={group.key}>
              <TableCell className='font-medium'>{group.nombre}</TableCell>
              <TableCell>{group.marcaNombre}</TableCell>
              <TableCell>{group.modelo}</TableCell>
              <TableCell className='text-center'>
                {group.equipos.length}
              </TableCell>
              <TableCell className='text-center'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleViewSerials(group)}
                >
                  Ver {group.equipos.length} series
                </Button>
              </TableCell>
              <TableCell className='text-right'>
                {formatCurrency(group.totalCosto)}
              </TableCell>
              <TableCell className='text-right'>
                <div className='flex justify-end space-x-1'>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleViewSerials(group)}
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ver detalles</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  // Render the serial details dialog
  const renderSerialDetailsDialog = () => {
    if (!selectedGroup) return null

    return (
      <Dialog open={showSerialDetails} onOpenChange={handleCloseSerialDetails}>
        <DialogContent className='max-w-3xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='text-xl'>
              {selectedGroup.nombre} - {selectedGroup.marcaNombre}{' '}
              {selectedGroup.modelo}
            </DialogTitle>
          </DialogHeader>

          <div className='grid grid-cols-2 gap-2 mb-4'>
            <div>
              <p className='text-sm font-medium text-muted-foreground'>
                Cantidad
              </p>
              <p>{selectedGroup.equipos.length} unidades</p>
            </div>
            <div>
              <p className='text-sm font-medium text-muted-foreground'>
                Costo Total
              </p>
              <p>{formatCurrency(selectedGroup.totalCosto)}</p>
            </div>
          </div>

          <Separator className='my-4' />

          <h3 className='text-lg font-medium mb-4'>Números de Serie</h3>

          <div className='space-y-4'>
            {selectedGroup.equipos.map((equipo) => (
              <Card
                key={equipo.id}
                className='p-4 hover:shadow-md transition-all'
              >
                <div className='flex justify-between items-start'>
                  <div className='space-y-2 flex-1'>
                    <div className='flex items-center space-x-2'>
                      <Badge variant='outline' className='font-mono'>
                        S/N: {equipo.serial || 'No disponible'}
                      </Badge>
                      {equipo.mac && (
                        <Badge variant='secondary' className='font-mono'>
                          MAC: {equipo.mac}
                        </Badge>
                      )}
                    </div>

                    {equipo.descripcion && (
                      <div>
                        <p className='text-sm font-medium text-muted-foreground'>
                          Descripción
                        </p>
                        <p className='text-sm'>{equipo.descripcion}</p>
                      </div>
                    )}

                    {equipo.ubicacion && (
                      <div>
                        <p className='text-sm font-medium text-muted-foreground'>
                          Ubicación
                        </p>
                        <p className='text-sm'>{equipo.ubicacion}</p>
                      </div>
                    )}

                    {equipo.garantia && equipo.garantia > 0 && (
                      <div>
                        <p className='text-sm font-medium text-muted-foreground'>
                          Garantía
                        </p>
                        <p className='text-sm'>{equipo.garantia} meses</p>
                      </div>
                    )}

                    <div>
                      <p className='text-sm font-medium text-muted-foreground'>
                        Costo
                      </p>
                      <p className='text-sm'>{formatCurrency(equipo.costo)}</p>
                    </div>
                  </div>

                  <div className='flex space-x-1'>
                    <Button
                      variant='outline'
                      size='icon'
                      onClick={() => handleEditEquipo(equipo)}
                    >
                      <Edit className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='relative w-full max-w-sm'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Buscar artículos...'
            className='pl-8'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className='flex items-center space-x-2'>
          <Tabs
            value={viewMode}
            onValueChange={(value) =>
              setViewMode(value as 'todos' | 'equipos' | 'materiales')
            }
            className='w-[400px]'
          >
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='todos'>Todos</TabsTrigger>
              <TabsTrigger value='equipos'>Equipos</TabsTrigger>
              <TabsTrigger value='materiales'>Materiales</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant='outline'
            size='icon'
            onClick={() =>
              setDisplayStyle(displayStyle === 'tabla' ? 'tarjetas' : 'tabla')
            }
          >
            {displayStyle === 'tabla' ? (
              <Grid3X3 className='h-4 w-4' />
            ) : (
              <List className='h-4 w-4' />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='icon'>
                <Filter className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSort('nombre')}>
                Nombre{' '}
                {sortField === 'nombre' &&
                  (sortDirection === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('marca')}>
                Marca{' '}
                {sortField === 'marca' && (sortDirection === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('modelo')}>
                Modelo{' '}
                {sortField === 'modelo' &&
                  (sortDirection === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('costo')}>
                Costo{' '}
                {sortField === 'costo' && (sortDirection === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className='rounded-md border'>
        <ScrollArea className='h-[600px]'>
          {viewMode === 'equipos' && displayStyle === 'tabla'
            ? renderGroupedEquiposTable()
            : displayStyle === 'tabla'
              ? renderTable(getArticulosToDisplay())
              : renderCards(getArticulosToDisplay())}
        </ScrollArea>
      </div>

      {renderSerialDetailsDialog()}

      <EditEquipoForm
        equipo={editingEquipo}
        open={showEditForm}
        onOpenChange={setShowEditForm}
        onEquipoUpdated={handleEquipoUpdated}
      />

      {selectedArticulo && (
        <SalidaArticuloForm
          articulo={selectedArticulo}
          inventarioId={selectedArticulo.idinventario}
          open={showSalidaForm}
          onOpenChange={setShowSalidaForm}
          onSalidaCompletada={() => {
            setSelectedArticulo(null)
            // You might want to refresh the data here
          }}
          usuarioId='current-user-id' // Replace with actual user ID from auth context
        />
      )}
    </div>
  )
}
