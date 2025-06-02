import { useCallback, useEffect, useState } from 'react'
import { useContabilidadState } from '@/context/global/useContabilidadState'
import { MovimientoCuenta, OrigenMovimiento, TipoMovimiento } from '@/types/interfaces/contabilidad/movimientoCuenta'
import { useObtenerMovimientosCuenta } from './hooks'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export default function MovimientosPage() {
  const { cuentas } = useContabilidadState()
  const { obtenerMovimientosCuenta } = useObtenerMovimientosCuenta()
  const [movimientos, setMovimientos] = useState<MovimientoCuenta[]>([])
  const [selectedCuenta, setSelectedCuenta] = useState<string>('')
  const [selectedOrigen, setSelectedOrigen] = useState<OrigenMovimiento | 'TODOS'>('TODOS')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)



  const loadMovimientos = useCallback(async () => {
    try {
      setIsLoading(true)
      const movs = await obtenerMovimientosCuenta(selectedCuenta)
      setMovimientos(movs)
    } catch (error) {
      console.error('Error al cargar movimientos:', error)
    } finally {
      setIsLoading(false)
    }
  }, [ selectedCuenta, obtenerMovimientosCuenta ])

  useEffect(() => {
    if (selectedCuenta) {
      loadMovimientos()
    }
  }, [ selectedCuenta, loadMovimientos ])

  const filteredMovimientos = movimientos.filter(mov => {
    const matchesOrigen = selectedOrigen === 'TODOS' || mov.origen === selectedOrigen
    const matchesSearch = searchTerm === '' || 
      mov.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.idOrigen.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesOrigen && matchesSearch
  })

  const getOrigenLabel = (origen: OrigenMovimiento) => {
    switch (origen) {
      case OrigenMovimiento.PAGO_RECURRENTE:
        return 'Pago Recurrente'
      case OrigenMovimiento.PAGO_UNICO:
        return 'Pago Único'
      case OrigenMovimiento.GASTO_MENOR:
        return 'Gasto Menor'
      case OrigenMovimiento.AJUSTE:
        return 'Ajuste'
      case OrigenMovimiento.REVERSA_PAGO:
        return 'Reversión de Pago'
      case OrigenMovimiento.INGRESO:
        return 'Ingreso'
      default:
        return origen
    }
  }

  const getTipoLabel = (tipo: TipoMovimiento) => {
    return tipo === TipoMovimiento.DEBITO ? 'Débito' : 'Crédito'
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Movimientos de Cuenta</h1>
      </div>

      <div className="flex gap-4 items-center">
        <Select value={selectedCuenta} onValueChange={setSelectedCuenta}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecciona una cuenta" />
          </SelectTrigger>
          <SelectContent>
            {cuentas.map((cuenta) => (
              <SelectItem key={cuenta.id} value={cuenta.id}>
                {cuenta.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedOrigen} onValueChange={(value) => setSelectedOrigen(value as OrigenMovimiento | 'TODOS')}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por origen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos</SelectItem>
            {Object.values(OrigenMovimiento).map((origen) => (
              <SelectItem key={origen} value={origen}>
                {getOrigenLabel(origen)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descripción o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <Button onClick={loadMovimientos} disabled={isLoading}>
          {isLoading ? 'Cargando...' : 'Actualizar'}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="text-right">Balance Anterior</TableHead>
              <TableHead className="text-right">Balance Nuevo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMovimientos.map((movimiento) => (
              <TableRow key={movimiento.id}>
                <TableCell>
                  {format(new Date(movimiento.fecha), 'PPP', { locale: es })}
                </TableCell>
                <TableCell>{movimiento.descripcion}</TableCell>
                <TableCell>{getOrigenLabel(movimiento.origen)}</TableCell>
                <TableCell>{getTipoLabel(movimiento.tipo)}</TableCell>
                <TableCell className="text-right">
                  {movimiento.monto.toLocaleString('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                  })}
                </TableCell>
                <TableCell className="text-right">
                  {movimiento.balanceAnterior.toLocaleString('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                  })}
                </TableCell>
                <TableCell className="text-right">
                  {movimiento.balanceNuevo.toLocaleString('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 