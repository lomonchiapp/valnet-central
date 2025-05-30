import {
  Plus,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Repeat,
  Package,
  PackageCheck,
  History,
  TrendingDown,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAlmacenState } from '@/context/global/useAlmacenState'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import WallNetFeed from '@/features/valnet/wallNet/WallNetFeed'

// Mock data for recent movements
const recentMovements = [
  {
    id: 1,
    type: 'Entrada',
    item: 'Cable UTP Cat6',
    quantity: 50,
    date: '2023-12-05',
    user: 'Juan Pérez',
  },
  {
    id: 2,
    type: 'Salida',
    item: 'Roseta RJ45',
    quantity: 20,
    date: '2023-12-04',
    user: 'María López',
  },
  {
    id: 3,
    type: 'Transferencia',
    item: 'Cable Coaxial',
    quantity: 100,
    date: '2023-12-03',
    from: 'Bodega Central',
    to: 'Brigada Norte',
  },
  {
    id: 4,
    type: 'Entrada',
    item: 'Splitter HDMI',
    quantity: 15,
    date: '2023-12-02',
    user: 'Pedro Ramírez',
  },
  {
    id: 5,
    type: 'Salida',
    item: 'Conector RJ45',
    quantity: 200,
    date: '2023-12-01',
    user: 'Ana Torres',
  },
]

// Mock data for low stock items
const lowStockItems = [
  {
    id: 1,
    name: 'Cable UTP Cat5e',
    currentStock: 5,
    minStock: 20,
    ubicacion: 'Bodega Principal',
  },
  {
    id: 2,
    name: 'Roseta RJ45',
    currentStock: 8,
    minStock: 25,
    ubicacion: 'Bodega Principal',
  },
  {
    id: 3,
    name: 'Conectores RJ11',
    currentStock: 15,
    minStock: 50,
    ubicacion: 'Almacén Este',
  },
  {
    id: 4,
    name: 'Splitter HDMI',
    currentStock: 2,
    minStock: 10,
    ubicacion: 'Bodega Norte',
  },
]

interface Inventario {
  id: string
  nombre: string
  descripcion?: string
}

function InventarioDashboard() {
  const navigate = useNavigate()
  const { inventarios } = useAlmacenState()

  // Function to navigate to inventory
  const navigateToInventario = (id: string) => {
    navigate(`/almacen/inventarios/${id}`)
  }

  return (
    <div className='space-y-6'>
      {/* Quick Stats */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-sm font-medium'>
              Total Inventarios
            </CardTitle>
            <Package className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{inventarios?.length || 0}</div>
            <p className='text-xs text-muted-foreground'>
              Inventarios registrados en el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-sm font-medium'>
              Artículos en Stock
            </CardTitle>
            <PackageCheck className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>1,245</div>
            <p className='text-xs text-muted-foreground'>
              Artículos disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-sm font-medium'>
              Movimientos Hoy
            </CardTitle>
            <History className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>24</div>
            <p className='text-xs text-muted-foreground'>
              Entradas, salidas y transferencias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
            <CardTitle className='text-sm font-medium'>Stock Mínimo</CardTitle>
            <TrendingDown className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{lowStockItems.length}</div>
            <p className='text-xs text-muted-foreground'>
              Artículos debajo del umbral mínimo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <div className='grid gap-4 md:grid-cols-9'>
        {/* Low Stock Items */}
        <Card className='md:col-span-3'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Materiales en Stock Mínimo</CardTitle>
              <AlertCircle className='h-4 w-4 text-amber-500' />
            </div>
            <CardDescription>
              Artículos que necesitan reabastecimiento urgente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className='flex justify-between items-center p-2 border-b'
                >
                  <div>
                    <p className='font-medium'>{item.name}</p>
                    <p className='text-sm text-muted-foreground'>
                      {item.ubicacion}
                    </p>
                  </div>
                  <div className='flex items-center'>
                    <span className='text-red-500 font-medium'>
                      {item.currentStock}
                    </span>
                    <span className='text-muted-foreground mx-1'>/</span>
                    <span className='text-muted-foreground'>
                      {item.minStock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant='ghost'
              className='w-full'
              onClick={() => navigate('/almacen/reportes/stock-minimo')}
            >
              Ver reporte completo
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Movements */}
        <Card className='md:col-span-4'>
          <CardHeader>
            <CardTitle>Últimos Movimientos</CardTitle>
            <CardDescription>
              Entradas, salidas y transferencias recientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {recentMovements.map((movement) => (
                <div
                  key={movement.id}
                  className='flex justify-between items-center p-2 border-b'
                >
                  <div>
                    <p className='font-medium'>{movement.item}</p>
                    <div className='flex items-center text-sm'>
                      <div
                        className={`mr-1 w-2 h-2 rounded-full ${
                          movement.type === 'Entrada'
                            ? 'bg-green-500'
                            : movement.type === 'Salida'
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                        }`}
                      ></div>
                      <span className='text-muted-foreground'>
                        {movement.type === 'Entrada' && (
                          <span className='flex items-center'>
                            <ArrowUpRight className='h-3 w-3 mr-1 text-green-500' />
                            Entrada: {movement.quantity} unidades
                          </span>
                        )}
                        {movement.type === 'Salida' && (
                          <span className='flex items-center'>
                            <ArrowDownRight className='h-3 w-3 mr-1 text-red-500' />
                            Salida: {movement.quantity} unidades
                          </span>
                        )}
                        {movement.type === 'Transferencia' && (
                          <span className='flex items-center'>
                            <Repeat className='h-3 w-3 mr-1 text-blue-500' />
                            Transferencia: {movement.quantity} unidades
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm'>{movement.date}</p>
                    <p className='text-xs text-muted-foreground'>
                      {movement.user
                        ? `Por: ${movement.user}`
                        : `De: ${movement.from} a ${movement.to}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant='ghost'
              className='w-full'
              onClick={() => navigate('/almacen/reportes/movimientos')}
            >
              Ver todos los movimientos
            </Button>
          </CardFooter>
        </Card>

        {/* WallNet Feed */}
        <div className='md:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle>Muro WallNet</CardTitle>
              <CardDescription>
                Comunicados y mensajes recientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WallNetFeed />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Inventory Selection Section */}
      <Card>
        <CardHeader>
          <CardTitle>Inventarios Disponibles</CardTitle>
          <CardDescription>
            Selecciona un inventario para gestionar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {inventarios && inventarios.length > 0 ? (
              inventarios.map((inventario: Inventario) => (
                <Card
                  key={inventario.id}
                  className='hover:bg-accent/50 cursor-pointer transition-colors'
                >
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-base'>
                      {inventario.nombre}
                    </CardTitle>
                    {inventario.descripcion && (
                      <CardDescription className='text-sm'>
                        {inventario.descripcion}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardFooter>
                    <Button
                      variant='outline'
                      className='w-full'
                      onClick={() => navigateToInventario(inventario.id)}
                    >
                      Gestionar
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <p className='col-span-full text-center py-8 text-muted-foreground'>
                No hay inventarios disponibles. Crea un nuevo inventario para
                empezar.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => navigate('/almacen/inventarios')}>
            <Plus className='mr-2 h-4 w-4' />
            Crear nuevo inventario
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

// Export as both named and default export
export { InventarioDashboard }
export default InventarioDashboard
