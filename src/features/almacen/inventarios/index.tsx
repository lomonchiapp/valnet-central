import { useEffect, useState } from 'react'
import {
  PlusCircle,
  Archive,
  Warehouse,
  MapPin,
  Tag,
  Truck,
} from 'lucide-react'
import { useNavigate, Outlet, useLocation } from 'react-router-dom'
// Iconos
import { Inventario, TipoInventario } from 'shared-types'
import { useAlmacenState } from '@/context/global/useAlmacenState'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NewInventoryForm } from './components/NewInventoryForm'
import { NoInventoriesWarning } from './components/NoInventoriesWarning'
import { useComprasState } from '@/context/global/useComprasState'

export default function InventoriosLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    inventarios: inventariosDelContexto,
    subscribeToInventarios,
  } = useAlmacenState()
  const { subscribeToProveedores } = useComprasState()
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  // Render inventory list only on the main page
  const renderInventoryList = () => {
    if (inventariosParaMostrar.length > 0) {
      return (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {inventariosParaMostrar.map((inventario) => (
            <Card key={inventario.id} className='flex flex-col'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-lg'>{inventario.nombre}</CardTitle>
                  <span className='text-xs px-2 py-1 rounded-full bg-primary/10 text-primary flex items-center'>
                    {getIconForType(inventario.tipo)}
                    {getTypeName(inventario.tipo)}
                  </span>
                </div>
                {inventario.descripcion && (
                  <CardDescription className='text-sm pt-1'>
                    {inventario.descripcion}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className='flex-grow'>
                <p className='text-sm text-muted-foreground'>
                  Haz clic en "Gestionar" para ver los detalles y artículos.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={() => {
                    navigate(`/almacen/inventarios/${inventario.id}`)
                  }}
                >
                  Gestionar Inventario
                </Button>
              </CardFooter>
            </Card>
          ))}
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
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='inventarios' className='flex items-center'>
            <Warehouse className='w-4 h-4 mr-2' /> Inventarios
          </TabsTrigger>
          <TabsTrigger value='ubicaciones' className='flex items-center'>
            <MapPin className='w-4 h-4 mr-2' /> Ubicaciones
          </TabsTrigger>
          <TabsTrigger value='marcas' className='flex items-center'>
            <Tag className='w-4 h-4 mr-2' /> Marcas
          </TabsTrigger>
          <TabsTrigger value='proveedores' className='flex items-center'>
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

      <div className='mt-6'>{renderContent()}</div>
    </div>
  )
}
