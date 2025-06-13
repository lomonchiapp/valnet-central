import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  Plus,
  FileText,
  Download,
  Search,
  BarChart3
} from 'lucide-react'
import { Inventario } from '@/types/interfaces/almacen/inventario'
import { Articulo, TipoArticulo } from '@/types/interfaces/almacen/articulo'
import { useAlmacenState } from '@/context/global/useAlmacenState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArticulosTable } from './components/ArticulosTable'
import { NuevoArticuloForm } from './components/NuevoArticuloForm'
import { useEliminarArticulo } from './hooks/useEliminarArticulo'

export default function InventarioPage() {
  const { id: inventarioId } = useParams<{ id: string }>()
  const [openNewForm, setOpenNewForm] = useState(false)
  
  const {
    inventarios,  
    articulos,
    subscribeToInventarios,
    subscribeToArticulos,
  } = useAlmacenState()

  const { eliminarArticulo, error: errorEliminar } = useEliminarArticulo()

  useEffect(() => {
    const unsubscribeInventarios = subscribeToInventarios()
    const unsubscribeArticulos = subscribeToArticulos()

    return () => {
      unsubscribeInventarios()
      unsubscribeArticulos()
    }
  }, [subscribeToInventarios, subscribeToArticulos])

  // DEBUG: Mostrar inventarios y el id buscado
  console.log('INVENTARIOS:', inventarios)
  console.log('inventarioId recibido:', inventarioId)

  const inventario = inventarios.find((inv: Inventario) => inv.id === inventarioId)
  const articulosInventario = articulos.filter((art: Articulo) => art.idinventario === inventarioId)

  if (!inventario) {
    return (
      <div className='flex items-center justify-center py-20'>
        <Card className='max-w-md'>
          <CardHeader>
            <CardTitle>Inventario no encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p>El inventario solicitado no existe o no tienes permisos para verlo.</p>
            <Button asChild className='mt-4'>
              <Link to='/almacen/inventarios'>Volver a inventarios</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calcular estadísticas
  const totalArticulos = articulosInventario.length
  const valorTotal = articulosInventario.reduce((sum: number, articulo: Articulo) => sum + (articulo.costo * (articulo.cantidad || 1)), 0)
  const articulosBajoStock = articulosInventario.filter((articulo: Articulo) => 
    articulo.cantidad_minima && articulo.cantidad <= articulo.cantidad_minima
  )
  const equipos = articulosInventario.filter((a: Articulo) => a.tipo === TipoArticulo.EQUIPO).length
  const materiales = articulosInventario.filter((a: Articulo) => a.tipo === TipoArticulo.MATERIAL).length

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value)
  }

  const formatDate = (dateString: string | Date) => {
    const date = dateString instanceof Date ? dateString : new Date(dateString)
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className='container mx-auto p-6 space-y-8'>
      {/* Mostrar error al eliminar */}
      {errorEliminar && (
        <Alert className='border-red-200 bg-red-50 shadow-lg mb-4'>
          <AlertTriangle className='h-5 w-5 text-red-600' />
          <AlertDescription className='text-red-800'>
            Error al eliminar artículo: {errorEliminar}
          </AlertDescription>
        </Alert>
      )}
      {/* Header Principal */}
      <div className='bg-gradient-to-r from-white to-blue-50 border border-gray-200 rounded-xl p-6 shadow-lg'>
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6'>
          <div className='flex-1'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='p-2 bg-primary/10 rounded-lg'>
                <Package className='h-6 w-6 text-primary' />
              </div>
              <div>
                <h1 className='text-3xl font-bold text-gray-900 tracking-tight'>
                  {inventario.nombre}
                </h1>
                <div className='flex items-center gap-4 text-sm text-muted-foreground mt-1'>
                  <span className='flex items-center gap-1'>
                    <FileText className='h-4 w-4' />
                    ID: {inventario.id}
                  </span>
                  <span className='flex items-center gap-1'>
                    <Package className='h-4 w-4' />
                    Tipo: {inventario.tipo}
                  </span>
                  <span className='flex items-center gap-1'>
                    <Calendar className='h-4 w-4' />
                    {formatDate(inventario.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className='flex items-center gap-3'>
            <Button variant='outline' size='sm'>
              <Download className='h-4 w-4 mr-2' />
              Exportar
            </Button>
            <Button variant='outline' size='sm'>
              <BarChart3 className='h-4 w-4 mr-2' />
              Reportes
            </Button>
            <Button onClick={() => setOpenNewForm(true)} size='sm'>
              <Plus className='h-4 w-4 mr-2' />
              Agregar Material
            </Button>
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card className='bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow'>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-sm font-medium text-blue-100'>Total Artículos</CardTitle>
              <Package className='h-5 w-5 text-blue-200' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>{totalArticulos}</div>
            <p className='text-xs text-blue-100 mt-1'>
              {equipos} equipos • {materiales} materiales
            </p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow'>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-sm font-medium text-green-100'>Valor Total</CardTitle>
              <TrendingUp className='h-5 w-5 text-green-200' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>{formatCurrency(valorTotal)}</div>
            <p className='text-xs text-green-100 mt-1'>
              Valor del inventario completo
            </p>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-lg hover:shadow-xl transition-shadow ${
          articulosBajoStock.length > 0 
            ? 'bg-gradient-to-br from-red-500 to-red-600 text-white'
            : 'bg-gradient-to-br from-gray-500 to-gray-600 text-white'
        }`}>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-sm font-medium opacity-90'>Bajo Stock</CardTitle>
              <AlertTriangle className='h-5 w-5 opacity-75' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-3xl font-bold'>{articulosBajoStock.length}</div>
            <p className='text-xs opacity-75 mt-1'>
              {articulosBajoStock.length > 0 ? 'Artículos necesitan reposición' : 'Todo en orden'}
            </p>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow'>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-sm font-medium text-purple-100'>Descripción</CardTitle>
              <FileText className='h-5 w-5 text-purple-200' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-lg font-bold truncate'>{inventario.descripcion || 'Sin descripción'}</div>
            <p className='text-xs text-purple-100 mt-1'>
              Información del inventario
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de bajo stock */}
      {articulosBajoStock.length > 0 && (
        <Alert className='border-amber-200 bg-amber-50 shadow-lg'>
          <AlertTriangle className='h-5 w-5 text-amber-600' />
          <AlertDescription className='text-amber-800'>
            <div className='flex items-center justify-between'>
              <div>
                <span className='font-semibold'>¡Atención!</span> {articulosBajoStock.length} artículo(s) tienen bajo stock:
                <div className='mt-2 flex flex-wrap gap-2'>
                  {articulosBajoStock.slice(0, 5).map((articulo) => (
                    <Badge key={articulo.id} variant='outline' className='border-amber-300 text-amber-700'>
                      {articulo.nombre} ({articulo.cantidad} disponibles)
                    </Badge>
                  ))}
                  {articulosBajoStock.length > 5 && (
                    <Badge variant='outline' className='border-amber-300 text-amber-700'>
                      +{articulosBajoStock.length - 5} más
                    </Badge>
                  )}
                </div>
              </div>
              <Button variant='outline' size='sm' className='border-amber-300 text-amber-700 hover:bg-amber-100'>
                <Search className='h-4 w-4 mr-2' />
                Ver todos
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Sección de artículos */}
      <Card className='shadow-xl border border-gray-200 overflow-hidden'>
        <CardHeader className='border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-2xl font-bold text-gray-900'>Artículos del Inventario</CardTitle>
              <p className='text-sm text-muted-foreground mt-1'>
                Gestiona todos los materiales y equipos de este inventario
              </p>
            </div>
            <div className='flex items-center gap-2'>
              <Badge variant='outline' className='text-sm px-3 py-1'>
                {totalArticulos} total
              </Badge>
              {articulosBajoStock.length > 0 && (
                <Badge variant='destructive' className='text-sm px-3 py-1'>
                  {articulosBajoStock.length} bajo stock
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className='p-6'>
          <ArticulosTable 
            articulos={articulosInventario} 
            onEliminar={async (articulo: Articulo) => {
              if (window.confirm('¿Seguro que deseas eliminar este artículo?')) {
                try {
                  await eliminarArticulo(articulo.id)
                } catch (error) {
                  console.error('Error al eliminar artículo:', error)
                }
              }
            }}
            onVer={(articulo: Articulo) => alert('Ver detalles de: ' + articulo.nombre)}
            onEditar={(articulo: Articulo) => alert('Editar: ' + articulo.nombre)}
            onTransferir={(articulo: Articulo) => alert('Transferir: ' + articulo.nombre)}
          />
        </CardContent>
      </Card>

      {/* Modal de nuevo artículo */}
      <NuevoArticuloForm
        inventarioId={inventario.id}
        open={openNewForm}
        onOpenChange={setOpenNewForm}
      />
    </div>
  )
}
