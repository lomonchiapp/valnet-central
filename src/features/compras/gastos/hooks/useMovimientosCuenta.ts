import { useMemo, useEffect } from 'react'
import { useContabilidadState } from '@/context/global/useContabilidadState'
import { MovimientoCuenta, TipoMovimiento, OrigenMovimiento } from '@/types/interfaces/contabilidad/movimientoCuenta'

interface UseMovimientosCuentaReturn {
  movimientos: MovimientoCuenta[]
  movimientosPorCuenta: (idcuenta: string) => MovimientoCuenta[]
  movimientosPorOrigen: (origen: OrigenMovimiento) => MovimientoCuenta[]
  movimientosPorTipo: (tipo: TipoMovimiento) => MovimientoCuenta[]
  movimientosDelDia: (fecha: string) => MovimientoCuenta[]
  totalDebitos: number
  totalCreditos: number
  saldoNeto: number
}

export function useMovimientosCuenta(): UseMovimientosCuentaReturn {
  const { movimientosCuenta, subscribeToMovimientosCuenta } = useContabilidadState()

  useEffect(() => {
    const unsubscribe = subscribeToMovimientosCuenta()
    return () => unsubscribe()
  }, [subscribeToMovimientosCuenta])

  const movimientosPorCuenta = useMemo(() => {
    return (idcuenta: string) => {
      return movimientosCuenta
        .filter(m => m.idcuenta === idcuenta)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    }
  }, [movimientosCuenta])

  const movimientosPorOrigen = useMemo(() => {
    return (origen: OrigenMovimiento) => {
      return movimientosCuenta
        .filter(m => m.origen === origen)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    }
  }, [movimientosCuenta])

  const movimientosPorTipo = useMemo(() => {
    return (tipo: TipoMovimiento) => {
      return movimientosCuenta
        .filter(m => m.tipo === tipo)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    }
  }, [movimientosCuenta])

  const movimientosDelDia = useMemo(() => {
    return (fecha: string) => {
      const fechaObj = new Date(fecha)
      const fechaStr = fechaObj.toISOString().split('T')[0]
      
      return movimientosCuenta
        .filter(m => m.fecha.split('T')[0] === fechaStr)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    }
  }, [movimientosCuenta])

  const estadisticas = useMemo(() => {
    const totalDebitos = movimientosCuenta
      .filter(m => m.tipo === TipoMovimiento.DEBITO)
      .reduce((sum, m) => sum + m.monto, 0)

    const totalCreditos = movimientosCuenta
      .filter(m => m.tipo === TipoMovimiento.CREDITO)
      .reduce((sum, m) => sum + m.monto, 0)

    const saldoNeto = totalCreditos - totalDebitos

    return { totalDebitos, totalCreditos, saldoNeto }
  }, [movimientosCuenta])

  return {
    movimientos: movimientosCuenta.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
    movimientosPorCuenta,
    movimientosPorOrigen,
    movimientosPorTipo,
    movimientosDelDia,
    ...estadisticas,
  }
} 