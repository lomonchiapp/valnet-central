import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { database } from '@/firebase';
import { TipoCuentaContable } from '@/types/interfaces/contabilidad/cuenta';
import { TipoIngreso } from '@/types/interfaces/contabilidad/ingreso';
import { collection, addDoc, updateDoc, doc, serverTimestamp, } from 'firebase/firestore';
import { Plus, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useContabilidadState } from '@/context/global/useContabilidadState';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useIngresos } from '../hooks/useIngresos';
const tipoIngresoLabels = {
    [TipoIngreso.VENTA_SERVICIO]: 'Venta de Servicio',
    [TipoIngreso.VENTA_PRODUCTO]: 'Venta de Producto',
    [TipoIngreso.INTERES]: 'Interés',
    [TipoIngreso.COMISION]: 'Comisión',
    [TipoIngreso.OTRO]: 'Otro',
};
export function NuevoIngresoForm({ open, onOpenChange, editIngreso, onSuccess, }) {
    const { cuentas, subscribeToCuentas } = useContabilidadState();
    const { isLoading, createIngreso, updateIngreso } = useIngresos();
    const [formData, setFormData] = useState({
        descripcion: '',
        monto: 0,
        fecha: new Date().toISOString().split('T')[0],
        idcuenta: '',
        tipo: TipoIngreso.VENTA_SERVICIO,
        referencia: '',
        notas: '',
    });
    // Estados para el modal de cuenta
    const [showCuentaForm, setShowCuentaForm] = useState(false);
    // Estados para el formulario de cuenta
    const [cuentaFormData, setCuentaFormData] = useState({
        nombre: '',
        tipo: TipoCuentaContable.ACTIVO,
        descripcion: '',
        balance: 0,
    });
    const [isCreatingCuenta, setIsCreatingCuenta] = useState(false);
    useEffect(() => {
        const unsubscribeCuentas = subscribeToCuentas();
        return () => {
            unsubscribeCuentas();
        };
    }, [subscribeToCuentas]);
    useEffect(() => {
        if (editIngreso) {
            setFormData({
                descripcion: editIngreso.descripcion,
                monto: editIngreso.monto,
                fecha: editIngreso.fecha.split('T')[0], // Convertir ISO string a formato date input
                idcuenta: editIngreso.idcuenta,
                tipo: editIngreso.tipo,
                referencia: editIngreso.referencia || '',
                notas: editIngreso.notas || '',
            });
        }
        else {
            setFormData({
                descripcion: '',
                monto: 0,
                fecha: new Date().toISOString().split('T')[0],
                idcuenta: '',
                tipo: TipoIngreso.VENTA_SERVICIO,
                referencia: '',
                notas: '',
            });
        }
    }, [editIngreso, open]);
    const handleSubmit = async () => {
        let result = null;
        if (editIngreso?.id) {
            result = await updateIngreso(editIngreso.id, formData);
        }
        else {
            result = await createIngreso(formData);
        }
        if (result) {
            onSuccess(result);
            onOpenChange(false);
        }
    };
    const handleCancel = () => {
        onOpenChange(false);
    };
    const handleFieldChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };
    const handleCreateCuenta = async () => {
        if (!cuentaFormData.nombre || !cuentaFormData.tipo) {
            toast.error('Completa el nombre y tipo de cuenta');
            return;
        }
        setIsCreatingCuenta(true);
        try {
            const docRef = await addDoc(collection(database, 'cuentas'), {
                ...cuentaFormData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            await updateDoc(doc(database, 'cuentas', docRef.id), {
                id: docRef.id,
            });
            // Auto-seleccionar la cuenta recién creada
            setFormData((prev) => ({ ...prev, idcuenta: docRef.id }));
            toast.success('Cuenta creada exitosamente');
            setCuentaFormData({
                nombre: '',
                tipo: TipoCuentaContable.ACTIVO,
                descripcion: '',
                balance: 0,
            });
            setShowCuentaForm(false);
        }
        catch (error) {
            console.error('Error al crear cuenta:', error);
            toast.error('Error al crear la cuenta');
        }
        finally {
            setIsCreatingCuenta(false);
        }
    };
    return (_jsxs(Sheet, { open: open, onOpenChange: onOpenChange, children: [_jsxs(SheetContent, { side: 'top', className: 'h-[600px] w-full max-w-4xl mx-auto rounded-b-xl border-t-0 animate-in slide-in-from-top duration-300', children: [_jsx(SheetHeader, { className: 'mb-6', children: _jsxs(SheetTitle, { className: 'text-2xl font-bold text-gray-900 flex items-center gap-2', children: [_jsx(TrendingUp, { className: 'h-6 w-6 text-green-600' }), editIngreso ? 'Editar Ingreso' : 'Nuevo Ingreso'] }) }), _jsxs("form", { onSubmit: (e) => {
                            e.preventDefault();
                            handleSubmit();
                        }, className: 'space-y-6', children: [_jsxs("div", { className: 'grid grid-cols-1 md:grid-cols-2 gap-6', children: [_jsxs("div", { className: 'space-y-4', children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: 'tipo', className: 'text-sm font-medium', children: "Tipo de Ingreso *" }), _jsxs(Select, { value: formData.tipo, onValueChange: (value) => handleFieldChange('tipo', value), disabled: isLoading, children: [_jsx(SelectTrigger, { className: 'mt-1', children: _jsx(SelectValue, { placeholder: 'Selecciona el tipo de ingreso' }) }), _jsx(SelectContent, { children: Object.entries(tipoIngresoLabels).map(([key, label]) => (_jsx(SelectItem, { value: key, children: label }, key))) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: 'cuenta', className: 'text-sm font-medium', children: "Cuenta Contable *" }), _jsxs("div", { className: 'flex gap-2 mt-1', children: [_jsxs(Select, { value: formData.idcuenta, onValueChange: (value) => handleFieldChange('idcuenta', value), disabled: isLoading, children: [_jsx(SelectTrigger, { className: 'flex-1', children: _jsx(SelectValue, { placeholder: 'Selecciona una cuenta' }) }), _jsx(SelectContent, { children: cuentas.map((cuenta) => (_jsx(SelectItem, { value: cuenta.id, children: _jsxs("div", { className: 'flex flex-col', children: [_jsxs("span", { className: 'font-medium', children: [cuenta.nombre, " - ($", cuenta.balance.toLocaleString(), ")"] }), _jsx("span", { className: 'text-xs text-gray-500', children: cuenta.descripcion })] }) }, cuenta.id))) })] }), _jsx(Button, { type: 'button', variant: 'outline', size: 'icon', onClick: () => setShowCuentaForm(true), disabled: isLoading, className: 'shrink-0', children: _jsx(Plus, { className: 'h-4 w-4' }) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: 'descripcion', className: 'text-sm font-medium', children: "Descripci\u00F3n *" }), _jsx(Textarea, { id: 'descripcion', value: formData.descripcion, onChange: (e) => handleFieldChange('descripcion', e.target.value), placeholder: 'Describe el concepto del ingreso...', disabled: isLoading, rows: 3, className: 'mt-1 resize-none' })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: 'referencia', className: 'text-sm font-medium', children: "Referencia" }), _jsx(Input, { id: 'referencia', value: formData.referencia, onChange: (e) => handleFieldChange('referencia', e.target.value), placeholder: 'N\u00FAmero de factura, recibo, etc.', disabled: isLoading, className: 'mt-1' })] })] }), _jsxs("div", { className: 'space-y-4', children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: 'monto', className: 'text-sm font-medium', children: "Monto *" }), _jsxs("div", { className: 'relative mt-1', children: [_jsx("span", { className: 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500', children: "$" }), _jsx(Input, { id: 'monto', type: 'number', step: '0.01', min: '0', value: formData.monto, onChange: (e) => handleFieldChange('monto', Number(e.target.value)), placeholder: '0.00', disabled: isLoading, className: 'pl-8' })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: 'fecha', className: 'text-sm font-medium', children: "Fecha *" }), _jsx(Input, { id: 'fecha', type: 'date', value: formData.fecha, onChange: (e) => handleFieldChange('fecha', e.target.value), disabled: isLoading, className: 'mt-1' })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: 'notas', className: 'text-sm font-medium', children: "Notas" }), _jsx(Textarea, { id: 'notas', value: formData.notas, onChange: (e) => handleFieldChange('notas', e.target.value), placeholder: 'Notas adicionales...', disabled: isLoading, rows: 3, className: 'mt-1 resize-none' })] }), _jsxs("div", { className: 'p-4 bg-green-50 rounded-lg border border-green-200', children: [_jsxs("h4", { className: 'text-sm font-medium text-green-900 mb-2 flex items-center gap-2', children: [_jsx(TrendingUp, { className: 'h-4 w-4' }), "Resumen del Ingreso"] }), _jsxs("div", { className: 'space-y-1 text-sm text-green-800', children: [_jsxs("div", { className: 'flex justify-between', children: [_jsx("span", { children: "Tipo:" }), _jsx("span", { className: 'font-medium', children: tipoIngresoLabels[formData.tipo] })] }), _jsxs("div", { className: 'flex justify-between', children: [_jsx("span", { children: "Cuenta:" }), _jsx("span", { className: 'font-medium', children: formData.idcuenta
                                                                            ? cuentas.find((c) => c.id === formData.idcuenta)
                                                                                ?.nombre || 'No seleccionada'
                                                                            : 'No seleccionada' })] }), formData.idcuenta && formData.monto > 0 && (_jsx(_Fragment, { children: _jsxs("div", { className: 'border-t border-green-300 pt-2 mt-2', children: [_jsxs("div", { className: 'flex justify-between text-xs', children: [_jsx("span", { children: "Balance actual:" }), _jsxs("span", { className: 'font-medium', children: ["$", (cuentas.find((c) => c.id === formData.idcuenta)
                                                                                            ?.balance || 0).toLocaleString()] })] }), _jsxs("div", { className: 'flex justify-between text-xs', children: [_jsx("span", { children: "Cr\u00E9dito (ingreso):" }), _jsxs("span", { className: 'font-medium text-green-700', children: ["+$", formData.monto.toLocaleString()] })] }), _jsxs("div", { className: 'flex justify-between text-xs font-semibold border-t border-green-300 pt-1 mt-1', children: [_jsx("span", { children: "Balance resultante:" }), _jsxs("span", { className: 'text-green-700', children: ["$", ((cuentas.find((c) => c.id === formData.idcuenta)
                                                                                            ?.balance || 0) + formData.monto).toLocaleString()] })] })] }) })), _jsx("div", { className: 'border-t border-green-300 pt-2 mt-3', children: _jsxs("div", { className: 'flex justify-between items-center', children: [_jsx("span", { className: 'font-semibold text-green-800', children: "Total del Ingreso:" }), _jsxs("span", { className: 'font-bold text-2xl text-green-600', children: ["$", formData.monto.toLocaleString()] })] }) })] })] })] })] }), _jsxs("div", { className: 'flex gap-3 justify-end pt-4 border-t border-gray-200', children: [_jsx(Button, { type: 'button', variant: 'outline', onClick: handleCancel, disabled: isLoading, children: "Cancelar" }), _jsx(Button, { type: 'submit', disabled: isLoading, className: 'bg-green-600 hover:bg-green-700', children: isLoading
                                            ? 'Guardando...'
                                            : editIngreso
                                                ? 'Actualizar'
                                                : 'Registrar Ingreso' })] })] })] }), _jsx(Dialog, { open: showCuentaForm, onOpenChange: setShowCuentaForm, children: _jsxs(DialogContent, { className: 'sm:max-w-[425px]', children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Nueva Cuenta Contable" }) }), _jsxs("div", { className: 'space-y-4 py-4', children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: 'nombre-cuenta', children: "Nombre *" }), _jsx(Input, { id: 'nombre-cuenta', value: cuentaFormData.nombre, onChange: (e) => setCuentaFormData((prev) => ({
                                                ...prev,
                                                nombre: e.target.value,
                                            })), placeholder: 'Nombre de la cuenta', disabled: isCreatingCuenta })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: 'tipo-cuenta', children: "Tipo *" }), _jsxs(Select, { value: cuentaFormData.tipo, onValueChange: (value) => setCuentaFormData((prev) => ({
                                                ...prev,
                                                tipo: value,
                                            })), disabled: isCreatingCuenta, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: 'Selecciona el tipo' }) }), _jsx(SelectContent, { children: Object.values(TipoCuentaContable).map((tipo) => (_jsx(SelectItem, { value: tipo, children: tipo }, tipo))) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: 'descripcion-cuenta', children: "Descripci\u00F3n" }), _jsx(Input, { id: 'descripcion-cuenta', value: cuentaFormData.descripcion, onChange: (e) => setCuentaFormData((prev) => ({
                                                ...prev,
                                                descripcion: e.target.value,
                                            })), placeholder: 'Descripci\u00F3n de la cuenta', disabled: isCreatingCuenta })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: 'balance-cuenta', children: "Balance inicial" }), _jsx(Input, { id: 'balance-cuenta', type: 'number', value: cuentaFormData.balance, onChange: (e) => setCuentaFormData((prev) => ({
                                                ...prev,
                                                balance: Number(e.target.value),
                                            })), placeholder: '0.00', disabled: isCreatingCuenta })] }), _jsxs("div", { className: 'flex gap-3 justify-end pt-4', children: [_jsx(Button, { type: 'button', variant: 'outline', onClick: () => setShowCuentaForm(false), disabled: isCreatingCuenta, children: "Cancelar" }), _jsx(Button, { onClick: handleCreateCuenta, disabled: isCreatingCuenta, children: isCreatingCuenta ? 'Creando...' : 'Crear Cuenta' })] })] })] }) })] }));
}
