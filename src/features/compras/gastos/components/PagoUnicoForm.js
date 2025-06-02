import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { database } from '@/firebase';
import { TipoCuentaContable } from '@/types/interfaces/contabilidad/cuenta';
import { collection, addDoc, updateDoc, doc, serverTimestamp, } from 'firebase/firestore';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useComprasState } from '@/context/global/useComprasState';
import { useContabilidadState } from '@/context/global/useContabilidadState';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { NuevoProveedorForm } from '@/features/almacen/inventarios/proveedores/NuevoProveedorForm';
import { usePagosUnicos } from '../hooks/usePagosUnicos';
export function PagoUnicoForm({ open, onOpenChange, editPago, onSuccess, }) {
    const { proveedores, subscribeToProveedores } = useComprasState();
    const { cuentas, subscribeToCuentas } = useContabilidadState();
    const { isLoading, createPago, updatePago } = usePagosUnicos();
    const [formData, setFormData] = useState({
        descripcion: '',
        monto: 0,
        fecha: new Date().toISOString().split('T')[0],
        idcuenta: '',
        idproveedor: '',
    });
    // Estados para los modales
    const [showProveedorForm, setShowProveedorForm] = useState(false);
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
        const unsubscribeProveedores = subscribeToProveedores();
        return () => {
            unsubscribeCuentas();
            unsubscribeProveedores();
        };
    }, [subscribeToCuentas, subscribeToProveedores]);
    useEffect(() => {
        if (editPago) {
            setFormData({
                descripcion: editPago.descripcion,
                monto: editPago.monto,
                fecha: editPago.fecha.split('T')[0], // Convertir ISO string a formato date input
                idcuenta: editPago.idcuenta,
                idproveedor: editPago.idproveedor,
            });
        }
        else {
            setFormData({
                descripcion: '',
                monto: 0,
                fecha: new Date().toISOString().split('T')[0],
                idcuenta: '',
                idproveedor: '',
            });
        }
    }, [editPago, open]);
    const handleSubmit = async () => {
        let result = null;
        if (editPago?.id) {
            result = await updatePago(editPago.id, formData);
        }
        else {
            result = await createPago(formData);
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
    const handleProveedorCreated = (proveedor) => {
        setFormData((prev) => ({ ...prev, idproveedor: proveedor.id }));
        setShowProveedorForm(false);
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
    return (_jsxs(Sheet, { open: open, onOpenChange: onOpenChange, children: [_jsxs(SheetContent, { side: 'top', className: 'h-[550px] w-full max-w-3xl mx-auto rounded-b-xl border-t-0 animate-in slide-in-from-top duration-300', children: [_jsx(SheetHeader, { className: 'mb-6', children: _jsx(SheetTitle, { className: 'text-2xl font-bold text-gray-900', children: editPago ? 'Editar Pago/Gasto' : 'Nuevo Pago/Gasto' }) }), _jsxs("form", { onSubmit: (e) => {
                            e.preventDefault();
                            handleSubmit();
                        }, className: 'space-y-6', children: [_jsxs("div", { className: 'grid grid-cols-1 md:grid-cols-2 gap-6', children: [_jsxs("div", { className: 'space-y-4', children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: 'proveedor', className: 'text-sm font-medium', children: "Proveedor *" }), _jsxs("div", { className: 'flex gap-2 mt-1', children: [_jsxs(Select, { value: formData.idproveedor, onValueChange: (value) => handleFieldChange('idproveedor', value), disabled: isLoading, children: [_jsx(SelectTrigger, { className: 'flex-1', children: _jsx(SelectValue, { placeholder: 'Selecciona un proveedor' }) }), _jsx(SelectContent, { children: proveedores.map((proveedor) => (_jsx(SelectItem, { value: proveedor.id, children: proveedor.nombre }, proveedor.id))) })] }), _jsx(Button, { type: 'button', variant: 'outline', size: 'icon', onClick: () => setShowProveedorForm(true), disabled: isLoading, className: 'shrink-0', children: _jsx(Plus, { className: 'h-4 w-4' }) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: 'cuenta', className: 'text-sm font-medium', children: "Cuenta Contable *" }), _jsxs("div", { className: 'flex gap-2 mt-1', children: [_jsxs(Select, { value: formData.idcuenta, onValueChange: (value) => handleFieldChange('idcuenta', value), disabled: isLoading, children: [_jsx(SelectTrigger, { className: 'flex-1', children: _jsx(SelectValue, { placeholder: 'Selecciona una cuenta' }) }), _jsx(SelectContent, { children: cuentas.map((cuenta) => (_jsx(SelectItem, { value: cuenta.id, children: _jsxs("div", { className: 'flex flex-col', children: [_jsxs("span", { className: 'font-medium', children: [cuenta.nombre, " - ($", cuenta.balance.toLocaleString(), ")"] }), _jsx("span", { className: 'text-xs text-gray-500', children: cuenta.descripcion })] }) }, cuenta.id))) })] }), _jsx(Button, { type: 'button', variant: 'outline', size: 'icon', onClick: () => setShowCuentaForm(true), disabled: isLoading, className: 'shrink-0', children: _jsx(Plus, { className: 'h-4 w-4' }) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: 'descripcion', className: 'text-sm font-medium', children: "Descripci\u00F3n *" }), _jsx(Textarea, { id: 'descripcion', value: formData.descripcion, onChange: (e) => handleFieldChange('descripcion', e.target.value), placeholder: 'Describe el concepto del pago o gasto...', disabled: isLoading, rows: 3, className: 'mt-1 resize-none' })] })] }), _jsxs("div", { className: 'space-y-4', children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: 'monto', className: 'text-sm font-medium', children: "Monto *" }), _jsxs("div", { className: 'relative mt-1', children: [_jsx("span", { className: 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500', children: "$" }), _jsx(Input, { id: 'monto', type: 'number', step: '0.01', min: '0', value: formData.monto, onChange: (e) => handleFieldChange('monto', Number(e.target.value)), placeholder: '0.00', disabled: isLoading, className: 'pl-8' })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: 'fecha', className: 'text-sm font-medium', children: "Fecha *" }), _jsx(Input, { id: 'fecha', type: 'date', value: formData.fecha, onChange: (e) => handleFieldChange('fecha', e.target.value), disabled: isLoading, className: 'mt-1' })] }), _jsxs("div", { className: 'p-4 bg-gray-50 rounded-lg border', children: [_jsx("h4", { className: 'text-sm font-medium text-gray-900 mb-2', children: "Resumen del Pago" }), _jsxs("div", { className: 'space-y-1 text-sm text-gray-600', children: [_jsxs("div", { className: 'flex justify-between', children: [_jsx("span", { children: "Proveedor:" }), _jsx("span", { className: 'font-medium', children: formData.idproveedor
                                                                            ? proveedores.find((p) => p.id === formData.idproveedor)
                                                                                ?.nombre || 'No seleccionado'
                                                                            : 'No seleccionado' })] }), _jsxs("div", { className: 'flex justify-between', children: [_jsx("span", { children: "Cuenta:" }), _jsx("span", { className: 'font-medium', children: formData.idcuenta
                                                                            ? cuentas.find((c) => c.id === formData.idcuenta)
                                                                                ?.nombre || 'No seleccionada'
                                                                            : 'No seleccionada' })] }), formData.idcuenta && formData.monto > 0 && (_jsx(_Fragment, { children: _jsxs("div", { className: 'border-t border-gray-200 pt-2 mt-2', children: [_jsxs("div", { className: 'flex justify-between text-xs', children: [_jsx("span", { children: "Balance actual:" }), _jsxs("span", { className: 'font-medium', children: ["$", (cuentas.find((c) => c.id === formData.idcuenta)
                                                                                            ?.balance || 0).toLocaleString()] })] }), _jsxs("div", { className: 'flex justify-between text-xs', children: [_jsx("span", { children: "D\u00E9bito (pago):" }), _jsxs("span", { className: 'font-medium text-red-600', children: ["-$", formData.monto.toLocaleString()] })] }), _jsxs("div", { className: 'flex justify-between text-xs font-semibold border-t border-gray-200 pt-1 mt-1', children: [_jsx("span", { children: "Balance resultante:" }), _jsxs("span", { className: `${(cuentas.find((c) => c.id === formData.idcuenta)
                                                                                        ?.balance || 0) -
                                                                                        formData.monto <
                                                                                        0
                                                                                        ? 'text-red-600'
                                                                                        : 'text-green-600'}`, children: ["$", ((cuentas.find((c) => c.id === formData.idcuenta)
                                                                                            ?.balance || 0) - formData.monto).toLocaleString()] })] })] }) })), _jsx("div", { className: 'border-t border-gray-200 pt-2 mt-3', children: _jsxs("div", { className: 'flex justify-between items-center', children: [_jsx("span", { className: 'font-semibold text-gray-700', children: "Total del Pago:" }), _jsxs("span", { className: 'font-bold text-2xl text-primary', children: ["$", formData.monto.toLocaleString()] })] }) })] })] })] })] }), _jsxs("div", { className: 'flex gap-3 justify-end pt-4 border-t border-gray-200', children: [_jsx(Button, { type: 'button', variant: 'outline', onClick: handleCancel, disabled: isLoading, children: "Cancelar" }), _jsx(Button, { type: 'submit', disabled: isLoading, children: isLoading ? 'Guardando...' : editPago ? 'Actualizar' : 'Guardar' })] })] })] }), _jsx(NuevoProveedorForm, { open: showProveedorForm, onOpenChange: setShowProveedorForm, onProveedorCreado: handleProveedorCreated }), _jsx(Dialog, { open: showCuentaForm, onOpenChange: setShowCuentaForm, children: _jsxs(DialogContent, { className: 'sm:max-w-[425px]', children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Nueva Cuenta Contable" }) }), _jsxs("div", { className: 'space-y-4 py-4', children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: 'nombre-cuenta', children: "Nombre *" }), _jsx(Input, { id: 'nombre-cuenta', value: cuentaFormData.nombre, onChange: (e) => setCuentaFormData((prev) => ({
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
