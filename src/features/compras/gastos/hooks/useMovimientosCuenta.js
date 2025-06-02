import { useMemo, useEffect } from 'react';
import { TipoMovimiento, } from '@/types/interfaces/contabilidad/movimientoCuenta';
import { useContabilidadState } from '@/context/global/useContabilidadState';
export function useMovimientosCuenta() {
    const { movimientosCuenta, subscribeToMovimientosCuenta } = useContabilidadState();
    useEffect(() => {
        const unsubscribe = subscribeToMovimientosCuenta();
        return () => unsubscribe();
    }, [subscribeToMovimientosCuenta]);
    const movimientosPorCuenta = useMemo(() => {
        return (idcuenta) => {
            return movimientosCuenta
                .filter((m) => m.idcuenta === idcuenta)
                .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        };
    }, [movimientosCuenta]);
    const movimientosPorOrigen = useMemo(() => {
        return (origen) => {
            return movimientosCuenta
                .filter((m) => m.origen === origen)
                .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        };
    }, [movimientosCuenta]);
    const movimientosPorTipo = useMemo(() => {
        return (tipo) => {
            return movimientosCuenta
                .filter((m) => m.tipo === tipo)
                .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        };
    }, [movimientosCuenta]);
    const movimientosDelDia = useMemo(() => {
        return (fecha) => {
            const fechaObj = new Date(fecha);
            const fechaStr = fechaObj.toISOString().split('T')[0];
            return movimientosCuenta
                .filter((m) => m.fecha.split('T')[0] === fechaStr)
                .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        };
    }, [movimientosCuenta]);
    const estadisticas = useMemo(() => {
        const totalDebitos = movimientosCuenta
            .filter((m) => m.tipo === TipoMovimiento.DEBITO)
            .reduce((sum, m) => sum + m.monto, 0);
        const totalCreditos = movimientosCuenta
            .filter((m) => m.tipo === TipoMovimiento.CREDITO)
            .reduce((sum, m) => sum + m.monto, 0);
        const saldoNeto = totalCreditos - totalDebitos;
        return { totalDebitos, totalCreditos, saldoNeto };
    }, [movimientosCuenta]);
    return {
        movimientos: movimientosCuenta.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
        movimientosPorCuenta,
        movimientosPorOrigen,
        movimientosPorTipo,
        movimientosDelDia,
        ...estadisticas,
    };
}
