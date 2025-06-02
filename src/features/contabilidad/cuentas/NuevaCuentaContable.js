import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { TipoCuentaContable, } from '@/types/interfaces/contabilidad/cuenta';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, } from '@/components/ui/sheet';
import { useCrearCuenta, useActualizarCuenta } from './hooks';
export function NuevaCuentaContable({ cuentas, onSuccess, editCuenta, }) {
    const { crearCuenta } = useCrearCuenta();
    const { actualizarCuenta } = useActualizarCuenta();
    const [isOpen, setIsOpen] = useState(false);
    const [nombre, setNombre] = useState('');
    const [tipo, setTipo] = useState(TipoCuentaContable.ACTIVO);
    const [descripcion, setDescripcion] = useState('');
    const [balance, setBalance] = useState('0');
    const [parentId, setParentId] = useState('none');
    const [editId, setEditId] = useState(null);
    // Filtrar solo cuentas principales (sin parentId)
    const principales = cuentas.filter((c) => !c.parentId);
    useEffect(() => {
        if (editCuenta) {
            setEditId(editCuenta.id);
            setNombre(editCuenta.nombre);
            setTipo(editCuenta.tipo);
            setDescripcion(editCuenta.descripcion);
            setBalance(editCuenta.balance.toString());
            setParentId(editCuenta.parentId || 'none');
            setIsOpen(true);
        }
    }, [editCuenta]);
    const resetForm = () => {
        setNombre('');
        setTipo(TipoCuentaContable.ACTIVO);
        setDescripcion('');
        setBalance('0');
        setParentId('none');
        setEditId(null);
    };
    const handleSubmit = async () => {
        if (!nombre || !tipo) {
            toast.error('Completa el nombre y tipo de cuenta');
            return;
        }
        const cuentaData = {
            nombre,
            tipo,
            descripcion,
            balance: Number(balance),
            parentId: parentId === 'none' ? undefined : parentId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        try {
            if (editId) {
                await actualizarCuenta(editId, cuentaData);
            }
            else {
                await crearCuenta(cuentaData);
            }
            resetForm();
            setIsOpen(false);
            onSuccess?.();
        }
        catch (error) {
            console.error('Error al guardar la cuenta:', error);
        }
    };
    return (_jsxs(Sheet, { open: isOpen, onOpenChange: setIsOpen, children: [_jsx(SheetTrigger, { asChild: true, children: _jsxs(Button, { onClick: () => resetForm(), children: [_jsx(Plus, { className: 'mr-2 h-4 w-4' }), "Nueva cuenta"] }) }), _jsxs(SheetContent, { children: [_jsxs(SheetHeader, { children: [_jsx(SheetTitle, { children: editId ? 'Editar cuenta' : 'Nueva cuenta' }), _jsx(SheetDescription, { children: editId
                                    ? 'Modifica los datos de la cuenta seleccionada'
                                    : 'Agrega una nueva cuenta al catálogo' })] }), _jsxs("div", { className: 'grid gap-4 py-4', children: [_jsxs("div", { className: 'space-y-2', children: [_jsx("label", { className: 'text-sm font-medium', children: "Nombre" }), _jsx(Input, { value: nombre, onChange: (e) => setNombre(e.target.value), placeholder: 'Nombre de la cuenta' })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx("label", { className: 'text-sm font-medium', children: "Tipo" }), _jsxs(Select, { value: tipo, onValueChange: (value) => setTipo(value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: 'Selecciona el tipo' }) }), _jsx(SelectContent, { children: Object.values(TipoCuentaContable).map((t) => (_jsx(SelectItem, { value: t, children: t }, t))) })] })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx("label", { className: 'text-sm font-medium', children: "Descripci\u00F3n" }), _jsx(Input, { value: descripcion, onChange: (e) => setDescripcion(e.target.value), placeholder: 'Descripci\u00F3n de la cuenta' })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx("label", { className: 'text-sm font-medium', children: "Balance inicial" }), _jsx(Input, { type: 'number', value: balance, onChange: (e) => setBalance(e.target.value), placeholder: '0.00' })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx("label", { className: 'text-sm font-medium', children: "Cuenta padre" }), _jsxs(Select, { value: parentId, onValueChange: setParentId, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: 'Selecciona cuenta padre' }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: 'none', children: "Cuenta principal" }), principales.map((c) => (_jsx(SelectItem, { value: c.id, children: c.nombre }, c.id)))] })] })] }), _jsx(Button, { onClick: handleSubmit, className: 'w-full', children: editId ? 'Actualizar cuenta' : 'Agregar cuenta' })] })] })] }));
}
