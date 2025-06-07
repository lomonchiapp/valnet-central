import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Ingreso, TipoIngreso } from '@/types/interfaces/contabilidad/ingreso'
import { es } from 'date-fns/locale'
import {
  Edit,
  Trash2,
  Search,
  FileDown,
  FileText,
  TrendingUp,
} from 'lucide-react'
import { useContabilidadState } from '@/context/global/useContabilidadState'
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
import { FeatureLayout } from '@/components/layout/feature-layout'
import { NuevoIngresoForm } from './components/NuevoIngresoForm'
import { useIngresos } from './hooks/useIngresos'

const tipoIngresoLabels: Record<TipoIngreso, string> = {
  [TipoIngreso.VENTA_SERVICIO]: 'Venta de Servicio',
  [TipoIngreso.VENTA_PRODUCTO]: 'Venta de Producto',
  [TipoIngreso.INTERES]: 'Interés',
  [TipoIngreso.COMISION]: 'Comisión',
  [TipoIngreso.OTRO]: 'Otro',
}

const tipoIngresoBadgeColor: Record<TipoIngreso, string> = {
  [TipoIngreso.VENTA_SERVICIO]: 'bg-blue-100 text-blue-800',
  [TipoIngreso.VENTA_PRODUCTO]: 'bg-green-100 text-green-800',
  [TipoIngreso.INTERES]: 'bg-yellow-100 text-yellow-800',
  [TipoIngreso.COMISION]: 'bg-purple-100 text-purple-800',
  [TipoIngreso.OTRO]: 'bg-gray-100 text-gray-800',
}

export default function Ingresos() {
  const { cuentas, ingresos, subscribeToIngresos } = useContabilidadState()
  const { deleteIngreso } = useIngresos()

  useEffect(() => {
    const unsubscribeIngresos = subscribeToIngresos()

    return () => {
      unsubscribeIngresos()
    }
  }, [])

  const [editIngreso, setEditIngreso] = useState<Ingreso | null>(null)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)

  const handleAddIngreso = () => {
    setEditIngreso(null)
    setFormOpen(true)
  }

  const handleEditIngreso = (ingreso: Ingreso) => {
    setEditIngreso(ingreso)
    setFormOpen(true)
  }

  const handleDeleteIngreso = async (id: string) => {
    const success = await deleteIngreso(id)
    if (success) {
      console.log('Ingreso eliminado exitosamente')
    }
  }

  const handleFormSuccess = () => {
    setEditIngreso(null)
    setFormOpen(false)
  }

  const filtered = ingresos.filter(
    (ingreso) =>
      ingreso.descripcion.toLowerCase().includes(search.toLowerCase()) ||
      getCuentaNombre(ingreso.idcuenta)
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      tipoIngresoLabels[ingreso.tipo]
        .toLowerCase()
        .includes(search.toLowerCase())
  )

  const getCuentaNombre = (idcuenta: string) => {
    const cuenta = cuentas.find((c) => c.id === idcuenta)
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
    return filtered.reduce((total, ingreso) => total + ingreso.monto, 0)
  }

  const getEstadisticas = () => {
    const totalIngresos = ingresos.length
    const totalMonto = ingresos.reduce((sum, ingreso) => sum + ingreso.monto, 0)
    const ingresosPorTipo = ingresos.reduce(
      (acc, ingreso) => {
        acc[ingreso.tipo] = (acc[ingreso.tipo] || 0) + 1
        return acc
      },
      {} as Record<TipoIngreso, number>
    )

    const tipoMasComun = Object.entries(ingresosPorTipo).reduce((a, b) =>
      ingresosPorTipo[a[0] as TipoIngreso] >
      ingresosPorTipo[b[0] as TipoIngreso]
        ? a
        : b
    )?.[0] as TipoIngreso

    return {
      totalIngresos,
      totalMonto,
      tipoMasComun: tipoMasComun ? tipoIngresoLabels[tipoMasComun] : 'N/A',
    }
  }

  const stats = getEstadisticas()

  const actions = (
    <div className='flex gap-2'>
      <Button variant='outline' size='sm'>
        <FileDown className='w-4 h-4 mr-2' />
        Exportar Excel
      </Button>
      <Button variant='outline' size='sm'>
        <FileText className='w-4 h-4 mr-2' />
        Exportar PDF
      </Button>
    </div>
  )

  return (
    <FeatureLayout
      title='Ingresos'
      description='Registra y gestiona todos los ingresos de la empresa.'
      actions={actions}
    >
      {/* Controles superiores */}
      <div className='flex gap-4 items-center justify-between mb-6'>
        <div className='flex gap-3 items-center'>
          <div className='relative'>
            <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <Input
              placeholder='Buscar por descripción, cuenta o tipo...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='pl-10 max-w-sm'
            />
          </div>

          {/* Estadísticas rápidas */}
          <div className='flex gap-4 items-center text-sm text-gray-600'>
            <span className='bg-green-50 px-3 py-1 rounded-full text-green-700'>
              <strong>{filtered.length}</strong> ingresos
            </span>
            <span className='bg-blue-50 px-3 py-1 rounded-full text-blue-700'>
              Total: <strong>${calcularTotal().toLocaleString()}</strong>
            </span>
            <span className='bg-purple-50 px-3 py-1 rounded-full text-purple-700'>
              Tipo común: <strong>{stats.tipoMasComun}</strong>
            </span>
          </div>
        </div>

        <Button
          onClick={handleAddIngreso}
          className='flex items-center gap-2 bg-green-600 hover:bg-green-700'
        >
          <TrendingUp className='w-4 h-4' />
          Nuevo Ingreso
        </Button>
      </div>

      {/* Tabla de ingresos */}
      <div className='border rounded-lg overflow-hidden bg-white shadow-sm'>
        <Table>
          <TableHeader className='bg-green-50'>
            <TableRow>
              <TableHead className='font-semibold'>Fecha</TableHead>
              <TableHead className='font-semibold'>Tipo</TableHead>
              <TableHead className='font-semibold'>Descripción</TableHead>
              <TableHead className='font-semibold'>Cuenta</TableHead>
              <TableHead className='font-semibold'>Referencia</TableHead>
              <TableHead className='font-semibold text-right'>Monto</TableHead>
              <TableHead className='font-semibold text-center'>
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className='text-center text-muted-foreground py-12'
                >
                  <div className='flex flex-col items-center gap-2'>
                    <TrendingUp className='w-8 h-8 text-gray-300' />
                    <p>No hay ingresos registrados</p>
                    {search && (
                      <p className='text-xs'>
                        Intenta con otros términos de búsqueda
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((ingreso) => (
                <TableRow key={ingreso.id} className='hover:bg-green-50'>
                  <TableCell>
                    <Badge variant='outline' className='font-mono text-xs'>
                      {formatFecha(ingreso.fecha)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={tipoIngresoBadgeColor[ingreso.tipo]}>
                      {tipoIngresoLabels[ingreso.tipo]}
                    </Badge>
                  </TableCell>
                  <TableCell className='max-w-xs'>
                    <div className='truncate' title={ingreso.descripcion}>
                      <span className='font-medium'>{ingreso.descripcion}</span>
                      {ingreso.notas && (
                        <div className='text-xs text-gray-500 mt-1'>
                          {ingreso.notas}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='text-sm text-gray-600'>
                    {getCuentaNombre(ingreso.idcuenta)}
                  </TableCell>
                  <TableCell className='text-sm text-gray-500'>
                    {ingreso.referencia || '-'}
                  </TableCell>
                  <TableCell className='text-right'>
                    <span className='font-bold text-lg text-green-600'>
                      ${ingreso.monto.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className='flex gap-1 justify-center'>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size='icon'
                            variant='outline'
                            onClick={() => handleEditIngreso(ingreso)}
                            className='h-8 w-8'
                          >
                            <Edit className='w-3 h-3' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar ingreso</TooltipContent>
                      </Tooltip>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size='icon'
                                variant='destructive'
                                className='h-8 w-8'
                              >
                                <Trash2 className='w-3 h-3' />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Eliminar ingreso</TooltipContent>
                          </Tooltip>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              ¿Eliminar ingreso?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará
                              permanentemente el ingreso de{' '}
                              <strong>"{ingreso.descripcion}"</strong> por
                              <strong>
                                {' '}
                                ${ingreso.monto.toLocaleString()}
                              </strong>
                              .
                              <br />
                              <br />
                              <em>
                                Nota: También se revertirá el movimiento
                                contable asociado.
                              </em>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteIngreso(ingreso.id)}
                              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
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
          <div className='bg-green-50 px-4 py-3 border-t'>
            <div className='flex justify-between items-center text-sm'>
              <span className='text-gray-600'>
                Mostrando {filtered.length} de {ingresos.length} ingresos
              </span>
              <span className='font-semibold'>
                Total mostrado:{' '}
                <span className='text-green-600'>
                  ${calcularTotal().toLocaleString()}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Formulario */}
      <NuevoIngresoForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editIngreso={editIngreso}
        onSuccess={handleFormSuccess}
      />
    </FeatureLayout>
  )
}
