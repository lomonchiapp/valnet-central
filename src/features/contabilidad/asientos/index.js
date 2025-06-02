import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
export default function AsientosContables() {
    const [asientos, setAsientos] = useState([]);
    const [fecha, setFecha] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [movimientos, setMovimientos] = useState([]);
    const [cuenta, setCuenta] = useState('');
    const [debe, setDebe] = useState('');
    const [haber, setHaber] = useState('');
    const handleAddMovimiento = () => {
        if (!cuenta || (!debe && !haber)) {
            toast.error('Completa la cuenta y el debe o haber');
            return;
        }
        setMovimientos([
            ...movimientos,
            { cuenta, debe: Number(debe) || 0, haber: Number(haber) || 0 },
        ]);
        setCuenta('');
        setDebe('');
        setHaber('');
    };
    const handleAddAsiento = () => {
        const totalDebe = movimientos.reduce((acc, m) => acc + m.debe, 0);
        const totalHaber = movimientos.reduce((acc, m) => acc + m.haber, 0);
        if (!fecha || !descripcion || movimientos.length < 2) {
            toast.error('Completa todos los campos y al menos dos movimientos');
            return;
        }
        if (totalDebe !== totalHaber) {
            toast.error('El debe y el haber deben ser iguales');
            return;
        }
        const now = new Date();
        setAsientos([
            ...asientos,
            {
                id: Date.now().toString(),
                fecha: new Date(fecha),
                descripcion,
                movimientos: movimientos.map((m) => ({
                    cuentaId: m.cuenta,
                    debe: m.debe,
                    haber: m.haber,
                })),
                referencia: '',
                createdAt: now,
                updatedAt: now,
            },
        ]);
        setFecha('');
        setDescripcion('');
        setMovimientos([]);
        toast.success('Asiento registrado');
    };
    return (_jsxs("div", { className: 'flex flex-col items-center w-full min-h-screen bg-muted py-8', children: [_jsxs("div", { className: 'w-full max-w-4xl bg-white rounded-lg shadow p-8', children: [_jsx("h1", { className: 'text-2xl font-bold mb-6 text-center', children: "Nuevo Asiento Contable" }), _jsxs("form", { className: 'grid grid-cols-1 md:grid-cols-2 gap-6 mb-8', children: [_jsxs("div", { className: 'space-y-4', children: [_jsxs("div", { children: [_jsx("label", { className: 'block font-medium mb-1', children: "Fecha *" }), _jsx(Input, { type: 'date', value: fecha, onChange: (e) => setFecha(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: 'block font-medium mb-1', children: "Descripci\u00F3n *" }), _jsx(Input, { value: descripcion, onChange: (e) => setDescripcion(e.target.value), placeholder: 'Descripci\u00F3n' })] })] }), _jsx("div", { className: 'space-y-4', children: _jsxs("div", { children: [_jsx("label", { className: 'block font-medium mb-1', children: "Agregar Movimiento" }), _jsxs("div", { className: 'flex gap-2', children: [_jsx(Input, { value: cuenta, onChange: (e) => setCuenta(e.target.value), placeholder: 'Cuenta' }), _jsx(Input, { type: 'number', value: debe, onChange: (e) => setDebe(e.target.value), placeholder: 'Debe' }), _jsx(Input, { type: 'number', value: haber, onChange: (e) => setHaber(e.target.value), placeholder: 'Haber' }), _jsx(Button, { type: 'button', onClick: handleAddMovimiento, children: "Agregar" })] })] }) })] }), _jsx("div", { className: 'bg-muted rounded-lg p-4 mb-8', children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Cuenta" }), _jsx(TableHead, { children: "Debe" }), _jsx(TableHead, { children: "Haber" })] }) }), _jsx(TableBody, { children: movimientos.map((m, i) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: m.cuenta }), _jsx(TableCell, { children: m.debe }), _jsx(TableCell, { children: m.haber })] }, i))) })] }) }), _jsx("div", { className: 'flex justify-end', children: _jsx(Button, { onClick: handleAddAsiento, children: "Registrar Asiento" }) })] }), _jsxs("div", { className: 'w-full max-w-4xl mt-8', children: [_jsx("h2", { className: 'text-2xl font-bold mb-2', children: "Asientos Registrados" }), _jsx("div", { className: 'border rounded-lg overflow-x-auto bg-white p-4', children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Fecha" }), _jsx(TableHead, { children: "Descripci\u00F3n" }), _jsx(TableHead, { children: "Movimientos" }), _jsx(TableHead, { children: "Acciones" })] }) }), _jsx(TableBody, { children: asientos.map((asiento) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: asiento.fecha.toLocaleDateString() }), _jsx(TableCell, { children: asiento.descripcion }), _jsx(TableCell, { children: _jsx("ul", { className: 'list-disc pl-4', children: asiento.movimientos.map((m, i) => (_jsxs("li", { children: [m.cuentaId, " - Debe: ", m.debe, " / Haber: ", m.haber] }, i))) }) }), _jsx(TableCell, { children: _jsx(Button, { variant: 'destructive', size: 'sm', onClick: () => setAsientos(asientos.filter((a) => a.id !== asiento.id)), children: "Eliminar" }) })] }, asiento.id))) })] }) })] })] }));
}
