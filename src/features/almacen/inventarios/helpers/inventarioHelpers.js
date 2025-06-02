import { jsx as _jsx } from "react/jsx-runtime";
import { TipoArticulo } from '@/types/interfaces/almacen/articulo';
import { TipoMovimiento } from '@/types/interfaces/almacen/movimiento';
import { Badge } from '@/components/ui/badge';
export function getArticuloInfo(articulos, articuloId) {
    const articulo = articulos.find((a) => a.id === articuloId);
    if (!articulo)
        return { nombre: 'Artículo desconocido' };
    if (articulo.tipo === TipoArticulo.EQUIPO) {
        let extra = articulo.serial ? `S/N: ${articulo.serial}` : 'Sin S/N';
        if (articulo.mac)
            extra += ` | MAC: ${articulo.mac}`;
        return { nombre: articulo.nombre, extra };
    }
    return { nombre: articulo.nombre };
}
// Helper para formatear fechas
export function formatDate(dateValue) {
    if (!dateValue)
        return 'N/A';
    try {
        // Firestore Timestamp
        if (typeof dateValue === 'object' &&
            dateValue !== null &&
            'toDate' in dateValue &&
            typeof dateValue.toDate === 'function') {
            return new Intl.DateTimeFormat('es-DO', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).format(dateValue.toDate());
        }
        // String ISO
        if (typeof dateValue === 'string') {
            const d = new Date(dateValue);
            if (isNaN(d.getTime()))
                return 'N/A';
            return new Intl.DateTimeFormat('es-DO', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).format(d);
        }
        // Date
        if (dateValue instanceof Date) {
            return new Intl.DateTimeFormat('es-DO', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).format(dateValue);
        }
        return 'N/A';
    }
    catch {
        return 'N/A';
    }
}
// Helper para obtener el badge de tipo de movimiento
export function getMovimientoBadge(tipo) {
    switch (tipo) {
        case TipoMovimiento.ENTRADA:
            return (_jsx(Badge, { className: 'bg-green-100 text-green-800 border-green-300', children: "Entrada" }));
        case TipoMovimiento.SALIDA:
            return (_jsx(Badge, { className: 'bg-red-100 text-red-800 border-red-300', children: "Salida" }));
        case TipoMovimiento.TRANSFERENCIA:
            return (_jsx(Badge, { className: 'bg-blue-100 text-blue-800 border-blue-300', children: "Transferencia" }));
        default:
            return _jsx(Badge, { children: "Desconocido" });
    }
}
