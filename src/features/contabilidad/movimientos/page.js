import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { OrigenMovimiento, TipoMovimiento, } from '@/types/interfaces/contabilidad/movimientoCuenta';
import { es } from 'date-fns/locale';
import { Search } from 'lucide-react';
import { useContabilidadState } from '@/context/global/useContabilidadState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { useObtenerMovimientosCuenta } from './hooks';
export default function MovimientosPage() {
    const { cuentas } = useContabilidadState();
    const { obtenerMovimientosCuenta } = useObtenerMovimientosCuenta();
    const [movimientos, setMovimientos] = useState([]);
    const [selectedCuenta, setSelectedCuenta] = useState('');
    const [selectedOrigen, setSelectedOrigen] = useState('TODOS');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const loadMovimientos = useCallback(async () => {
        try {
            setIsLoading(true);
            const movs = await obtenerMovimientosCuenta(selectedCuenta);
            setMovimientos(movs);
        }
        catch (error) {
            console.error('Error al cargar movimientos:', error);
        }
        finally {
            setIsLoading(false);
        }
    }, [selectedCuenta, obtenerMovimientosCuenta]);
    useEffect(() => {
        if (selectedCuenta) {
            loadMovimientos();
        }
    }, [selectedCuenta, loadMovimientos]);
    const filteredMovimientos = movimientos.filter((mov) => {
        const matchesOrigen = selectedOrigen === 'TODOS' || mov.origen === selectedOrigen;
        const matchesSearch = searchTerm === '' ||
            mov.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mov.idOrigen.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesOrigen && matchesSearch;
    });
    const getOrigenLabel = (origen) => {
        switch (origen) {
            case OrigenMovimiento.PAGO_RECURRENTE:
                return 'Pago Recurrente';
            case OrigenMovimiento.PAGO_UNICO:
                return 'Pago Único';
            case OrigenMovimiento.GASTO_MENOR:
                return 'Gasto Menor';
            case OrigenMovimiento.AJUSTE:
                return 'Ajuste';
            case OrigenMovimiento.REVERSA_PAGO:
                return 'Reversión de Pago';
            case OrigenMovimiento.INGRESO:
                return 'Ingreso';
            default:
                return origen;
        }
    };
    const getTipoLabel = (tipo) => {
        return tipo === TipoMovimiento.DEBITO ? 'Débito' : 'Crédito';
    };
    return (_jsxs("div", { className: 'container mx-auto py-6 space-y-6', children: [_jsx("div", { className: 'flex justify-between items-center', children: _jsx("h1", { className: 'text-2xl font-bold', children: "Movimientos de Cuenta" }) }), _jsxs("div", { className: 'flex gap-4 items-center', children: [_jsxs(Select, { value: selectedCuenta, onValueChange: setSelectedCuenta, children: [_jsx(SelectTrigger, { className: 'w-[200px]', children: _jsx(SelectValue, { placeholder: 'Selecciona una cuenta' }) }), _jsx(SelectContent, { children: cuentas.map((cuenta) => (_jsx(SelectItem, { value: cuenta.id, children: cuenta.nombre }, cuenta.id))) })] }), _jsxs(Select, { value: selectedOrigen, onValueChange: (value) => setSelectedOrigen(value), children: [_jsx(SelectTrigger, { className: 'w-[200px]', children: _jsx(SelectValue, { placeholder: 'Filtrar por origen' }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: 'TODOS', children: "Todos" }), Object.values(OrigenMovimiento).map((origen) => (_jsx(SelectItem, { value: origen, children: getOrigenLabel(origen) }, origen)))] })] }), _jsxs("div", { className: 'relative flex-1', children: [_jsx(Search, { className: 'absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' }), _jsx(Input, { placeholder: 'Buscar por descripci\u00F3n o ID...', value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: 'pl-8' })] }), _jsx(Button, { onClick: loadMovimientos, disabled: isLoading, children: isLoading ? 'Cargando...' : 'Actualizar' })] }), _jsx("div", { className: 'rounded-md border', children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Fecha" }), _jsx(TableHead, { children: "Descripci\u00F3n" }), _jsx(TableHead, { children: "Origen" }), _jsx(TableHead, { children: "Tipo" }), _jsx(TableHead, { className: 'text-right', children: "Monto" }), _jsx(TableHead, { className: 'text-right', children: "Balance Anterior" }), _jsx(TableHead, { className: 'text-right', children: "Balance Nuevo" })] }) }), _jsx(TableBody, { children: filteredMovimientos.map((movimiento) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: format(new Date(movimiento.fecha), 'PPP', { locale: es }) }), _jsx(TableCell, { children: movimiento.descripcion }), _jsx(TableCell, { children: getOrigenLabel(movimiento.origen) }), _jsx(TableCell, { children: getTipoLabel(movimiento.tipo) }), _jsx(TableCell, { className: 'text-right', children: movimiento.monto.toLocaleString('es-MX', {
                                            style: 'currency',
                                            currency: 'MXN',
                                        }) }), _jsx(TableCell, { className: 'text-right', children: movimiento.balanceAnterior.toLocaleString('es-MX', {
                                            style: 'currency',
                                            currency: 'MXN',
                                        }) }), _jsx(TableCell, { className: 'text-right', children: movimiento.balanceNuevo.toLocaleString('es-MX', {
                                            style: 'currency',
                                            currency: 'MXN',
                                        }) })] }, movimiento.id))) })] }) })] }));
}
