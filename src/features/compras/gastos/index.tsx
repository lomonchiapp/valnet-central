import { useEffect, useState } from 'react'
import { Edit, Trash2, Plus, Search, FileDown, FileText } from 'lucide-react'
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { FeatureLayout } from '@/components/layout/feature-layout'
import { PagoUnico } from '@/types/interfaces/contabilidad/pagoUnico'
import { PagoUnicoForm } from './components/PagoUnicoForm'
import { useComprasState } from '@/context/global/useComprasState'
import { useContabilidadState } from '@/context/global/useContabilidadState'
import { usePagosUnicos } from './hooks/usePagosUnicos'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function Gastos() {
  const { proveedores, subscribeToProveedores } = useComprasState()
  const { cuentas, pagosUnicos, subscribeToPagosUnicos } = useContabilidadState()
  const { deletePago } = usePagosUnicos()
  
  useEffect(() => {
    const unsubscribeProveedores = subscribeToProveedores()
    const unsubscribePagosUnicos = subscribeToPagosUnicos()

    return () => {
      unsubscribeProveedores()
      unsubscribePagosUnicos()
    }
  }, [subscribeToProveedores, subscribeToPagosUnicos])

  
  const [editPago, setEditPago] = useState<PagoUnico | null>(null)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)

  const handleAddPago = () => {
    setEditPago(null)
    setFormOpen(true)
  }

  const handleEditPago = (pago: PagoUnico) => {
    setEditPago(pago)
    setFormOpen(true)
  }

  const handleDeletePago = async (id: string) => {
    const success = await deletePago(id)
    if (success) {
      // El toast ya se muestra en el hook usePagosUnicos
      console.log('Pago eliminado exitosamente')
    }
  }

  const handleFormSuccess = () => {
    setEditPago(null)
    setFormOpen(false)
  }

  const filtered = pagosUnicos.filter(
    (pago) =>
      pago.descripcion.toLowerCase().includes(search.toLowerCase()) ||
      getProveedorNombre(pago.idproveedor).toLowerCase().includes(search.toLowerCase())
  )

  const getProveedorNombre = (idproveedor: string) => {
    const proveedor = proveedores.find(p => p.id === idproveedor)
    return proveedor?.nombre || 'Proveedor desconocido'
  }

  const getCuentaNombre = (idcuenta: string) => {
    const cuenta = cuentas.find(c => c.id === idcuenta)
    return cuenta?.nombre || 'Cuenta desconocida'
  }

  const formatFecha = (fecha: string) => {
    try {
      return format(new Date(fecha), 'dd MMM yyyy', { locale: es })
    } catch {
      return fecha
    }
  }

  const calcularTotal = () => {
    return filtered.reduce((total, pago) => total + pago.monto, 0)
  }

  const actions = (
    <div className="flex gap-2">
      <Button variant='outline' size="sm">
        <FileDown className='w-4 h-4 mr-2' />
        Exportar Excel
      </Button>
      <Button variant='outline' size="sm">
        <FileText className='w-4 h-4 mr-2' />
        Exportar PDF
      </Button>
    </div>
  )

  return (
    <FeatureLayout
      title='Gastos / Pagos Únicos'
      description='Administra los gastos y pagos únicos realizados por la empresa.'
      actions={actions}
    >
      {/* Controles superiores */}
      <div className='flex gap-4 items-center justify-between mb-6'>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder='Buscar por descripción o proveedor...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='pl-10 max-w-sm'
            />
          </div>
          
          {/* Estadísticas rápidas */}
          <div className="flex gap-4 items-center text-sm text-gray-600">
            <span className="bg-blue-50 px-3 py-1 rounded-full">
              <strong>{filtered.length}</strong> pagos
            </span>
            <span className="bg-green-50 px-3 py-1 rounded-full">
              Total: <strong>${calcularTotal().toLocaleString()}</strong>
            </span>
          </div>
        </div>

        <Button onClick={handleAddPago} className="flex items-center gap-2">
          <Plus className='w-4 h-4' />
          Nuevo Pago/Gasto
        </Button>
      </div>

      {/* Tabla de pagos */}
      <div className='border rounded-lg overflow-hidden bg-white shadow-sm'>
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold">Fecha</TableHead>
              <TableHead className="font-semibold">Proveedor</TableHead>
              <TableHead className="font-semibold">Descripción</TableHead>
              <TableHead className="font-semibold">Cuenta</TableHead>
              <TableHead className="font-semibold text-right">Monto</TableHead>
              <TableHead className="font-semibold text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className='text-center text-muted-foreground py-12'
                >
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-8 h-8 text-gray-300" />
                    <p>No hay pagos registrados</p>
                    {search && (
                      <p className="text-xs">
                        Intenta con otros términos de búsqueda
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((pago) => (
                <TableRow key={pago.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {formatFecha(pago.fecha)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {getProveedorNombre(pago.idproveedor)}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={pago.descripcion}>
                      {pago.descripcion}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {getCuentaNombre(pago.idcuenta)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className='font-bold text-lg text-red-600'>
                      ${pago.monto.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className='flex gap-1 justify-center'>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size='icon'
                            variant='outline'
                            onClick={() => handleEditPago(pago)}
                            className="h-8 w-8"
                          >
                            <Edit className='w-3 h-3' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar pago</TooltipContent>
                      </Tooltip>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size='icon'
                                variant='destructive'
                                className="h-8 w-8"
                              >
                                <Trash2 className='w-3 h-3' />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Eliminar pago</TooltipContent>
                          </Tooltip>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar pago?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará permanentemente el pago
                              de <strong>{getProveedorNombre(pago.idproveedor)}</strong> por 
                              <strong> ${pago.monto.toLocaleString()}</strong>.
                              <br /><br />
                              <em>Nota: También se revertirá el movimiento contable asociado.</em>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePago(pago.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Footer con total */}
        {filtered.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                Mostrando {filtered.length} de {pagosUnicos.length} pagos
              </span>
              <span className="font-semibold">
                Total mostrado: <span className="text-red-600">${calcularTotal().toLocaleString()}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Formulario */}
      <PagoUnicoForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editPago={editPago}
        onSuccess={handleFormSuccess}
      />
    </FeatureLayout>
  )
}
