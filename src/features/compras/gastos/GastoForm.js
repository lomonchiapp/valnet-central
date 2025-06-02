import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { database } from '@/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp, } from 'firebase/firestore';
import { toast } from 'sonner';
import { useComprasState } from '@/context/global/useComprasState';
import { useContabilidadState } from '@/context/global/useContabilidadState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, } from '@/components/ui/sheet';
export function GastoForm({ open, onOpenChange, editGasto, onSuccess, }) {
    const { proveedores, subscribeToProveedores } = useComprasState();
    const { cuentas, subscribeToCuentas } = useContabilidadState();
    useEffect(() => {
        console.log('Iniciando suscripciones...');
        const unsubscribeProveedores = subscribeToProveedores();
        const unsubscribeCuentas = subscribeToCuentas();
        return () => {
            console.log('Limpiando suscripciones...');
            unsubscribeProveedores();
            unsubscribeCuentas();
        };
    }, [subscribeToProveedores, subscribeToCuentas]);
    // Debug: Log para verificar las cuentas
    useEffect(() => {
        console.log('Cuentas disponibles:', cuentas);
        console.log('Número de cuentas:', cuentas.length);
        console.log('Proveedores disponibles:', proveedores);
        console.log('Número de proveedores:', proveedores.length);
    }, [cuentas, proveedores]);
    const [formData, setFormData] = useState({
        proveedorId: '',
        cuentaId: '',
        descripcion: '',
        monto: 0,
        fecha: new Date().toISOString().split('T')[0],
    });
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        if (editGasto) {
            setFormData(editGasto);
        }
        else {
            setFormData({
                proveedorId: '',
                cuentaId: '',
                descripcion: '',
                monto: 0,
                fecha: new Date().toISOString().split('T')[0],
            });
        }
    }, [editGasto, open]);
    const handleSubmit = async () => {
        if (!formData.proveedorId ||
            !formData.cuentaId ||
            !formData.descripcion ||
            !formData.monto ||
            !formData.fecha) {
            toast.error('Completa todos los campos');
            return;
        }
        setIsLoading(true);
        try {
            const gastoData = {
                proveedorId: formData.proveedorId,
                cuentaId: formData.cuentaId,
                descripcion: formData.descripcion,
                monto: Number(formData.monto),
                fecha: new Date(formData.fecha),
                updatedAt: serverTimestamp(),
            };
            if (editGasto?.id) {
                await updateDoc(doc(database, 'gastosMenores', editGasto.id), gastoData);
                toast.success('Gasto actualizado exitosamente');
            }
            else {
                const docRef = await addDoc(collection(database, 'gastosMenores'), {
                    ...gastoData,
                    createdAt: serverTimestamp(),
                });
                await updateDoc(doc(database, 'gastosMenores', docRef.id), {
                    id: docRef.id,
                });
                toast.success('Gasto creado exitosamente');
            }
            onOpenChange(false);
            onSuccess?.();
        }
        catch (error) {
            console.error('Error al guardar gasto:', error);
            toast.error('Error al guardar el gasto');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCancel = () => {
        onOpenChange(false);
    };
    return (_jsx(Sheet, { open: open, onOpenChange: onOpenChange, children: _jsxs(SheetContent, { side: 'top', className: 'h-[600px] w-full max-w-5xl mx-auto rounded-b-2xl border-t-0 shadow-2xl animate-in slide-in-from-top-full duration-500 ease-out data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top-full data-[state=closed]:duration-300', children: [_jsxs(SheetHeader, { className: 'mb-8 pb-4 border-b border-gray-100', children: [_jsx(SheetTitle, { className: 'text-3xl font-bold text-gray-900 text-center', children: editGasto ? 'Editar Gasto' : 'Agregar Nuevo Gasto' }), _jsx("p", { className: 'text-gray-600 text-center mt-2', children: "Complete todos los campos para registrar el gasto" })] }), _jsxs("div", { className: 'grid grid-cols-1 lg:grid-cols-2 gap-8 px-4', children: [_jsxs("div", { className: 'space-y-6', children: [_jsxs("div", { className: 'transform transition-all duration-200 hover:scale-[1.02]', children: [_jsx("label", { className: 'text-sm font-semibold mb-2 block text-gray-700', children: "Proveedor *" }), _jsxs(Select, { value: formData.proveedorId, onValueChange: (value) => setFormData((prev) => ({ ...prev, proveedorId: value })), disabled: isLoading, children: [_jsx(SelectTrigger, { className: 'h-12 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors duration-200', children: _jsx(SelectValue, { placeholder: 'Selecciona un proveedor' }) }), _jsx(SelectContent, { className: 'animate-in slide-in-from-top-2 duration-200', children: proveedores.map((proveedor) => (_jsx(SelectItem, { value: proveedor.id, className: 'hover:bg-blue-50 transition-colors duration-150', children: proveedor.nombre }, proveedor.id))) })] })] }), _jsxs("div", { className: 'transform transition-all duration-200 hover:scale-[1.02]', children: [_jsx("label", { className: 'text-sm font-semibold mb-2 block text-gray-700', children: "Cuenta contable *" }), _jsxs(Select, { value: formData.cuentaId, onValueChange: (value) => setFormData((prev) => ({ ...prev, cuentaId: value })), disabled: isLoading, children: [_jsx(SelectTrigger, { className: 'h-12 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors duration-200', children: _jsx(SelectValue, { placeholder: 'Selecciona una cuenta', children: formData.cuentaId && (_jsxs("div", { className: 'flex flex-col text-left', children: [_jsx("span", { className: 'font-medium', children: cuentas.find((c) => c.id === formData.cuentaId)
                                                                        ?.nombre }), _jsx("span", { className: 'text-xs text-gray-500', children: cuentas.find((c) => c.id === formData.cuentaId)
                                                                        ?.descripcion })] })) }) }), _jsx(SelectContent, { className: 'animate-in slide-in-from-top-2 duration-200', children: cuentas.length === 0 ? (_jsx("div", { className: 'p-4 text-center text-gray-500', children: "No hay cuentas disponibles" })) : (cuentas.map((cuenta) => (_jsx(SelectItem, { value: cuenta.id, className: 'hover:bg-blue-50 transition-colors duration-150 cursor-pointer', children: _jsxs("div", { className: 'flex flex-col py-1 w-full', children: [_jsx("span", { className: 'font-medium text-gray-900', children: cuenta.nombre }), _jsx("span", { className: 'text-xs text-gray-500 mt-1', children: cuenta.descripcion })] }) }, cuenta.id)))) })] })] }), _jsxs("div", { className: 'transform transition-all duration-200 hover:scale-[1.02]', children: [_jsx("label", { className: 'text-sm font-semibold mb-2 block text-gray-700', children: "Descripci\u00F3n *" }), _jsx(Input, { value: formData.descripcion, onChange: (e) => setFormData((prev) => ({
                                                ...prev,
                                                descripcion: e.target.value,
                                            })), placeholder: 'Descripci\u00F3n del gasto', disabled: isLoading, className: 'h-12 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200' })] })] }), _jsxs("div", { className: 'space-y-6', children: [_jsxs("div", { className: 'transform transition-all duration-200 hover:scale-[1.02]', children: [_jsx("label", { className: 'text-sm font-semibold mb-2 block text-gray-700', children: "Monto *" }), _jsxs("div", { className: 'relative', children: [_jsx("span", { className: 'absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold text-lg', children: "$" }), _jsx(Input, { type: 'number', step: '0.01', value: formData.monto, onChange: (e) => setFormData((prev) => ({
                                                        ...prev,
                                                        monto: Number(e.target.value),
                                                    })), placeholder: '0.00', disabled: isLoading, className: 'h-12 pl-8 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200 text-lg font-semibold' })] })] }), _jsxs("div", { className: 'transform transition-all duration-200 hover:scale-[1.02]', children: [_jsx("label", { className: 'text-sm font-semibold mb-2 block text-gray-700', children: "Fecha *" }), _jsx(Input, { type: 'date', value: formData.fecha, onChange: (e) => setFormData((prev) => ({ ...prev, fecha: e.target.value })), disabled: isLoading, className: 'h-12 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200' })] }), _jsxs("div", { className: 'p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 transform transition-all duration-300 hover:shadow-lg', children: [_jsxs("h4", { className: 'text-sm font-bold text-gray-900 mb-3 flex items-center', children: [_jsx("span", { className: 'w-2 h-2 bg-blue-500 rounded-full mr-2' }), "Resumen del Gasto"] }), _jsxs("div", { className: 'space-y-2 text-sm', children: [_jsxs("div", { className: 'flex justify-between items-center', children: [_jsx("span", { className: 'text-gray-600', children: "Proveedor:" }), _jsx("span", { className: 'font-medium text-gray-900', children: formData.proveedorId
                                                                ? proveedores.find((p) => p.id === formData.proveedorId)
                                                                    ?.nombre || 'No seleccionado'
                                                                : 'No seleccionado' })] }), _jsxs("div", { className: 'flex justify-between items-center', children: [_jsx("span", { className: 'text-gray-600', children: "Cuenta:" }), _jsx("span", { className: 'font-medium text-gray-900', children: formData.cuentaId
                                                                ? cuentas.find((c) => c.id === formData.cuentaId)
                                                                    ?.nombre || 'No seleccionada'
                                                                : 'No seleccionada' })] }), _jsx("div", { className: 'border-t border-blue-200 pt-2 mt-3', children: _jsxs("div", { className: 'flex justify-between items-center', children: [_jsx("span", { className: 'font-semibold text-gray-700', children: "Total:" }), _jsxs("span", { className: 'font-bold text-2xl text-blue-600', children: ["$", formData.monto.toLocaleString()] })] }) })] })] })] })] }), _jsxs("div", { className: 'flex gap-4 justify-end mt-8 pt-6 border-t border-gray-100 px-4', children: [_jsx(Button, { variant: 'outline', type: 'button', onClick: handleCancel, disabled: isLoading, className: 'px-8 py-3 h-12 border-2 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105', children: "Cancelar" }), _jsx(Button, { onClick: handleSubmit, disabled: isLoading, className: 'px-8 py-3 h-12 bg-blue-600 hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl', children: isLoading ? (_jsxs("div", { className: 'flex items-center gap-2', children: [_jsx("div", { className: 'w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' }), "Guardando..."] })) : editGasto ? ('Actualizar Gasto') : ('Agregar Gasto') })] })] }) }));
}
