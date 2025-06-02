import { useState } from 'react'
import { format } from 'date-fns'
import {
  TipoMovimiento,
  OrigenMovimiento,
} from '@/types/interfaces/contabilidad/movimientoCuenta'
import { es } from 'date-fns/locale'
import { useContabilidadState } from '@/context/global/useContabilidadState'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMovimientosCuenta } from '@/features/compras/gastos/hooks/useMovimientosCuenta'

interface HistorialMovimientosProps {
  idcuenta?: string
  titulo?: string
}

export function HistorialMovimientos({
  idcuenta,
  titulo = 'Historial de Movimientos',
}: HistorialMovimientosProps) {
  const {
    movimientos,
    movimientosPorCuenta,
    totalDebitos,
    totalCreditos,
    saldoNeto,
  } = useMovimientosCuenta()
  const { cuentas } = useContabilidadState()

  const [filtroOrigen, setFiltroOrigen] = useState<string>('todos')
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')

  const movimientosMostrar = idcuenta
    ? movimientosPorCuenta(idcuenta)
    : movimientos

  const movimientosFiltrados = movimientosMostrar
    .filter((m) => filtroOrigen === 'todos' || m.origen === filtroOrigen)
    .filter((m) => filtroTipo === 'todos' || m.tipo === filtroTipo)

  const getCuentaNombre = (idcuenta: string) => {
    return (
      cuentas.find((c) => c.id === idcuenta)?.nombre || 'Cuenta no encontrada'
    )
  }

  const getOrigenBadgeColor = (origen: OrigenMovimiento) => {
    switch (origen) {
      case OrigenMovimiento.PAGO_UNICO:
        return 'bg-blue-100 text-blue-800'
      case OrigenMovimiento.PAGO_RECURRENTE:
        return 'bg-purple-100 text-purple-800'
      case OrigenMovimiento.GASTO_MENOR:
        return 'bg-orange-100 text-orange-800'
      case OrigenMovimiento.AJUSTE:
        return 'bg-gray-100 text-gray-800'
      case OrigenMovimiento.REVERSA_PAGO:
        return 'bg-red-100 text-red-800'
      case OrigenMovimiento.INGRESO:
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTipoBadgeColor = (tipo: TipoMovimiento) => {
    return tipo === TipoMovimiento.DEBITO
      ? 'bg-red-100 text-red-800'
      : 'bg-green-100 text-green-800'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>{titulo}</span>
          {!idcuenta && (
            <div className='flex gap-4 text-sm'>
              <span className='text-red-600'>
                Débitos: ${totalDebitos.toLocaleString()}
              </span>
              <span className='text-green-600'>
                Créditos: ${totalCreditos.toLocaleString()}
              </span>
              <span
                className={`font-bold ${saldoNeto >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                Saldo Neto: ${saldoNeto.toLocaleString()}
              </span>
            </div>
          )}
        </CardTitle>

        {/* Filtros */}
        <div className='flex gap-4'>
          <Select value={filtroOrigen} onValueChange={setFiltroOrigen}>
            <SelectTrigger className='w-48'>
              <SelectValue placeholder='Filtrar por origen' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='todos'>Todos los orígenes</SelectItem>
              {Object.values(OrigenMovimiento).map((origen) => (
                <SelectItem key={origen} value={origen}>
                  {origen.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className='w-48'>
              <SelectValue placeholder='Filtrar por tipo' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='todos'>Todos los tipos</SelectItem>
              <SelectItem value={TipoMovimiento.DEBITO}>Débitos</SelectItem>
              <SelectItem value={TipoMovimiento.CREDITO}>Créditos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              {!idcuenta && <TableHead>Cuenta</TableHead>}
              <TableHead>Descripción</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className='text-right'>Monto</TableHead>
              <TableHead className='text-right'>Balance Anterior</TableHead>
              <TableHead className='text-right'>Balance Nuevo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movimientosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={idcuenta ? 7 : 8}
                  className='text-center text-gray-500 py-6'
                >
                  No hay movimientos registrados
                </TableCell>
              </TableRow>
            ) : (
              movimientosFiltrados.map((movimiento) => (
                <TableRow key={movimiento.id}>
                  <TableCell>
                    {format(new Date(movimiento.fecha), 'dd/MM/yyyy HH:mm', {
                      locale: es,
                    })}
                  </TableCell>
                  {!idcuenta && (
                    <TableCell className='font-medium'>
                      {getCuentaNombre(movimiento.idcuenta)}
                    </TableCell>
                  )}
                  <TableCell>
                    <div>
                      <div className='font-medium'>
                        {movimiento.descripcion}
                      </div>
                      {movimiento.notas && (
                        <div className='text-sm text-gray-500'>
                          {movimiento.notas}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getOrigenBadgeColor(movimiento.origen)}>
                      {movimiento.origen.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTipoBadgeColor(movimiento.tipo)}>
                      {movimiento.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right font-mono'>
                    <span
                      className={
                        movimiento.tipo === TipoMovimiento.DEBITO
                          ? 'text-red-600'
                          : 'text-green-600'
                      }
                    >
                      {movimiento.tipo === TipoMovimiento.DEBITO ? '-' : '+'}$
                      {movimiento.monto.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className='text-right font-mono'>
                    ${movimiento.balanceAnterior.toLocaleString()}
                  </TableCell>
                  <TableCell className='text-right font-mono font-semibold'>
                    ${movimiento.balanceNuevo.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
