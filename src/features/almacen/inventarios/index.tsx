import { useEffect, useState } from 'react'
import {
  PlusCircle,
  Archive,
  Warehouse,
  MapPin,
  Tag,
  Truck,
  Edit,
  Settings,
  Trash2,
  MoreVertical,
  History,
} from 'lucide-react'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
// Iconos
import { Inventario, TipoInventario } from 'shared-types'
import { useAlmacenState } from '@/context/global/useAlmacenState'
import { useComprasState } from '@/context/global/useComprasState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NewInventoryForm } from './components/NewInventoryForm'
import { EditInventoryForm } from './components/EditInventoryForm'
import { DeleteInventoryDialog } from './components/DeleteInventoryDialog'
import { NoInventoriesWarning } from './components/NoInventoriesWarning'
import { useEliminarInventario } from './hooks/useEliminarInventario'

export default function InventoriosLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { inventarios: inventariosDelContexto, subscribeToInventarios } =
    useAlmacenState()
  const { subscribeToProveedores } = useComprasState()
  const { eliminarInventario, isLoading: isDeleting } = useEliminarInventario()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInventario, setEditingInventario] = useState<Inventario | null>(null)
  const [deletingInventario, setDeletingInventario] = useState<Inventario | null>(null)

  // Determine active tab based on current path
  const getActiveTab = () => {
    const path = location.pathname
    if (path.includes('/ubicaciones')) return 'ubicaciones'
    if (path.includes('/marcas')) return 'marcas'
    if (path.includes('/proveedores')) return 'proveedores'
    return 'inventarios'
  }

  const activeTab = getActiveTab()

  // Usamos directamente los inventarios del contexto. Aseguramos el tipo.
  const inventariosParaMostrar: Inventario[] = (inventariosDelContexto ||
    []) as Inventario[]

  useEffect(() => {
    const unsubscribe = subscribeToInventarios()
    const unsubscribeProveedores = subscribeToProveedores()
    return () => {
      unsubscribe()
      unsubscribeProveedores()
    }
  }, [subscribeToInventarios, subscribeToProveedores])

  const getIconForType = (tipo: TipoInventario | undefined) => {
    switch (tipo) {
      case TipoInventario.LOCAL:
        return <Warehouse className='w-5 h-5 mr-2' />
      case TipoInventario.BRIGADA:
        return <Archive className='w-5 h-5 mr-2' />
      default:
        return <Archive className='w-5 h-5 mr-2' />
    }
  }

  const getTypeName = (tipo: TipoInventario | undefined) => {
    switch (tipo) {
      case TipoInventario.LOCAL:
        return 'Local'
      case TipoInventario.BRIGADA:
        return 'Brigada'
      default:
        return 'Otro'
    }
  }

  // Check if we're at the main inventarios page (exactly)
  const isMainInventarioPage = location.pathname === '/almacen/inventarios'

  const handleDelete = async () => {
    if (!deletingInventario?.id) return
    const success = await eliminarInventario(deletingInventario.id)
    if (success) {
      setDeletingInventario(null)
    }
  }

  const handleEditSuccess = () => {
    setEditingInventario(null)
  }

  // Separar inventarios por tipo
  const inventariosLocales = inventariosParaMostrar.filter(
    (inv) => inv.tipo === TipoInventario.LOCAL
  )
  const inventariosBrigadas = inventariosParaMostrar.filter(
    (inv) => inv.tipo === TipoInventario.BRIGADA
  )

  // Render inventory list only on the main page
  const renderInventoryList = () => {
    if (inventariosParaMostrar.length > 0) {
      return (
        <div className='space-y-8'>
          {/* Inventarios Locales */}
          {inventariosLocales.length > 0 && (
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Warehouse className='w-5 h-5 text-primary' />
                <h2 className='text-xl font-semibold'>Inventarios Locales</h2>
                <Badge variant='secondary' className='ml-2'>
                  {inventariosLocales.length}
                </Badge>
              </div>
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {inventariosLocales.map((inventario) => (
                  <Card
                    key={inventario.id}
                    className='flex flex-col hover:shadow-lg transition-all hover:border-primary/50'
                  >
                    <CardHeader>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='flex-1 min-w-0'>
                          <CardTitle className='text-lg cursor-pointer hover:text-primary transition-colors' onClick={() => navigate(`/almacen/inventarios/${inventario.id}`)}>
                            {inventario.nombre}
                          </CardTitle>
                          {inventario.descripcion && (
                            <CardDescription className='text-sm pt-1'>
                              {inventario.descripcion}
                            </CardDescription>
                          )}
                        </div>
                        <div className='flex items-center gap-1'>
                          <span className='text-xs px-2 py-1 rounded-full bg-primary/10 text-primary flex items-center shrink-0'>
                            {getIconForType(inventario.tipo)}
                            {getTypeName(inventario.tipo)}
                          </span>
                          <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-8 w-8'
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                  }}
                                >
                                  <MoreVertical className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault()
                                    navigate(`/almacen/inventarios/${inventario.id}`)
                                  }}
                                >
                                  <Warehouse className='mr-2 h-4 w-4' />
                                  Abrir Inventario
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault()
                                    setEditingInventario(inventario)
                                  }}
                                >
                                  <Edit className='mr-2 h-4 w-4' />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault()
                                    navigate(`/almacen/inventarios/${inventario.id}/movimientos`)
                                  }}
                                >
                                  <History className='mr-2 h-4 w-4' />
                                  Movimientos
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault()
                                    // TODO: Implementar configuraciones
                                    console.log('Configuraciones para:', inventario.id)
                                  }}
                                >
                                  <Settings className='mr-2 h-4 w-4' />
                                  Configuraciones
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault()
                                    setDeletingInventario(inventario)
                                  }}
                                  className='text-destructive focus:text-destructive'
                                >
                                  <Trash2 className='mr-2 h-4 w-4' />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className='flex-grow cursor-pointer' onClick={() => navigate(`/almacen/inventarios/${inventario.id}`)}>
                      <p className='text-sm text-muted-foreground'>
                        Haz clic para ver los detalles y artículos.
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Inventarios de Brigadas */}
          {inventariosBrigadas.length > 0 && (
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Archive className='w-5 h-5 text-primary' />
                <h2 className='text-xl font-semibold'>Inventarios de Brigadas</h2>
                <Badge variant='secondary' className='ml-2'>
                  {inventariosBrigadas.length}
                </Badge>
              </div>
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {inventariosBrigadas.map((inventario) => (
                  <Card
                    key={inventario.id}
                    className='flex flex-col hover:shadow-lg transition-all hover:border-primary/50'
                  >
                    <CardHeader>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='flex-1 min-w-0'>
                          <CardTitle className='text-lg cursor-pointer hover:text-primary transition-colors' onClick={() => navigate(`/almacen/inventarios/${inventario.id}`)}>
                            {inventario.nombre}
                          </CardTitle>
                          {inventario.descripcion && (
                            <CardDescription className='text-sm pt-1'>
                              {inventario.descripcion}
                            </CardDescription>
                          )}
                        </div>
                        <div className='flex items-center gap-1'>
                          <span className='text-xs px-2 py-1 rounded-full bg-primary/10 text-primary flex items-center shrink-0'>
                            {getIconForType(inventario.tipo)}
                            {getTypeName(inventario.tipo)}
                          </span>
                          <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-8 w-8'
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                  }}
                                >
                                  <MoreVertical className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault()
                                    navigate(`/almacen/inventarios/${inventario.id}`)
                                  }}
                                >
                                  <Warehouse className='mr-2 h-4 w-4' />
                                  Abrir Inventario
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault()
                                    setEditingInventario(inventario)
                                  }}
                                >
                                  <Edit className='mr-2 h-4 w-4' />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault()
                                    navigate(`/almacen/inventarios/${inventario.id}/movimientos`)
                                  }}
                                >
                                  <History className='mr-2 h-4 w-4' />
                                  Movimientos
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault()
                                    // TODO: Implementar configuraciones
                                    console.log('Configuraciones para:', inventario.id)
                                  }}
                                >
                                  <Settings className='mr-2 h-4 w-4' />
                                  Configuraciones
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault()
                                    setDeletingInventario(inventario)
                                  }}
                                  className='text-destructive focus:text-destructive'
                                >
                                  <Trash2 className='mr-2 h-4 w-4' />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className='flex-grow cursor-pointer' onClick={() => navigate(`/almacen/inventarios/${inventario.id}`)}>
                      <p className='text-sm text-muted-foreground'>
                        Haz clic para ver los detalles y artículos.
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    } else {
      return <NoInventoriesWarning onCreateClick={() => setIsModalOpen(true)} />
    }
  }

  // Determine content to render based on the current path
  const renderContent = () => {
    // Only render inventory list on exact match for main inventory page
    if (isMainInventarioPage) {
      return renderInventoryList()
    }
    // For sub-routes (ubicaciones, marcas, proveedores), render the child route component
    return <Outlet />
  }

  // Get the title based on active tab
  const getTitle = () => {
    if (activeTab === 'ubicaciones') return null
    if (activeTab === 'marcas') return null
    if (activeTab === 'proveedores') return null
    return (
      <>
        <h1 className='text-2xl md:text-3xl font-bold tracking-tight'>
          Gestión de Inventarios
        </h1>
        <p className='text-muted-foreground'>
          Administra inventarios, ubicaciones, marcas y proveedores.
        </p>
      </>
    )
  }

  return (
    <div className='p-4 md:p-6 lg:p-8 space-y-6'>
      <Tabs
        value={activeTab}
        defaultValue={activeTab}
        className='max-w-7xl mx-auto'
        onValueChange={(value) => {
          switch (value) {
            case 'inventarios':
              navigate('/almacen/inventarios')
              break
            case 'ubicaciones':
              navigate('/almacen/inventarios/ubicaciones')
              break
            case 'marcas':
              navigate('/almacen/inventarios/marcas')
              break
            case 'proveedores':
              navigate('/almacen/inventarios/proveedores')
              break
          }
        }}
      >
        <TabsList className='grid w-full bg-white grid-cols-4 border-b border-slate-200'>
          <TabsTrigger
            value='inventarios'
            className='flex items-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm'
          >
            <Warehouse className='w-4 h-4 mr-2' /> Inventarios
          </TabsTrigger>
          <TabsTrigger
            value='ubicaciones'
            className='flex items-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm'
          >
            <MapPin className='w-4 h-4 mr-2' /> Ubicaciones
          </TabsTrigger>
          <TabsTrigger
            value='marcas'
            className='flex items-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm'
          >
            <Tag className='w-4 h-4 mr-2' /> Marcas
          </TabsTrigger>
          <TabsTrigger
            value='proveedores'
            className='flex items-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm'
          >
            <Truck className='w-4 h-4 mr-2' /> Proveedores
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {getTitle() && (
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <div>{getTitle()}</div>
          {isMainInventarioPage && inventariosParaMostrar.length > 0 && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className='w-full sm:w-auto'
            >
              <PlusCircle className='mr-2 h-4 w-4' /> Crear Nuevo Inventario
            </Button>
          )}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='sm:max-w-[480px]'>
          <NewInventoryForm
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => {}}
          />
        </DialogContent>
      </Dialog>

      {editingInventario && (
        <Dialog open={!!editingInventario} onOpenChange={(open) => !open && setEditingInventario(null)}>
          <DialogContent className='sm:max-w-[480px]'>
            <EditInventoryForm
              inventario={editingInventario}
              onClose={() => setEditingInventario(null)}
              onSuccess={handleEditSuccess}
            />
          </DialogContent>
        </Dialog>
      )}

      <DeleteInventoryDialog
        open={!!deletingInventario}
        onOpenChange={(open) => !open && setDeletingInventario(null)}
        inventario={deletingInventario}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />

      <div className='mt-6'>{renderContent()}</div>
    </div>
  )
}
