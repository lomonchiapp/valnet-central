import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { FrecuenciaPago, MetodoPago, TipoMonto, EstadoPagoRecurrente, } from '@/types/interfaces/contabilidad/pagoRecurrente';
import { es } from 'date-fns/locale';
import { CalendarIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useComprasState } from '@/context/global/useComprasState';
import { useContabilidadState } from '@/context/global/useContabilidadState';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger, } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { NuevoProveedorForm } from '@/features/almacen/inventarios/proveedores/NuevoProveedorForm';
import { NuevaCuentaContable } from '@/features/contabilidad/cuentas/NuevaCuentaContable';
import { useCrearPagoRecurrente } from './hooks';
export default function NuevoPagoRecurrenteForm({ onClose, }) {
    const { cuentas, subscribeToCuentas } = useContabilidadState();
    const { proveedores, subscribeToProveedores } = useComprasState();
    const { crearPagoRecurrente } = useCrearPagoRecurrente();
    const [form, setForm] = useState({
        idcuenta: '',
        idproveedor: '',
        descripcion: '',
        tipoMonto: TipoMonto.FIJO,
        monto: 0,
        fechaInicio: new Date(),
        frecuencia: FrecuenciaPago.MENSUAL,
        fechaProximoPago: new Date(),
        estado: EstadoPagoRecurrente.ACTIVO,
        metodoPago: MetodoPago.TRANSFERENCIA,
        notas: '',
    });
    // Estados para los modales
    const [showNuevaCuenta, setShowNuevaCuenta] = useState(false);
    const [showNuevoProveedor, setShowNuevoProveedor] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    useEffect(() => {
        const unsubscribeCuentas = subscribeToCuentas();
        const unsubscribeProveedores = subscribeToProveedores();
        return () => {
            unsubscribeCuentas();
            unsubscribeProveedores();
        };
    }, [subscribeToCuentas, subscribeToProveedores]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted', form);
        // Validate required fields
        const missingFields = [];
        if (!form.idcuenta)
            missingFields.push('Cuenta Contable');
        if (!form.idproveedor)
            missingFields.push('Proveedor');
        if (!form.descripcion)
            missingFields.push('Descripción');
        if (missingFields.length > 0) {
            console.log('Validation failed - missing fields:', missingFields);
            toast.error(`Por favor completa los siguientes campos: ${missingFields.join(', ')}`);
            return;
        }
        if (form.tipoMonto === TipoMonto.FIJO && !form.monto) {
            console.log('Monto validation failed', {
                tipoMonto: form.tipoMonto,
                monto: form.monto,
            });
            toast.error('El monto es requerido para pagos fijos');
            return;
        }
        try {
            setIsSubmitting(true);
            console.log('Creating pago recurrente...');
            // Convert all dates to ISO strings
            const fechaInicio = form.fechaInicio.toISOString();
            const fechaProximoPago = form.fechaProximoPago.toISOString();
            const fechaFin = form.fechaFin?.toISOString();
            const pagoData = {
                idcuenta: form.idcuenta,
                idproveedor: form.idproveedor,
                descripcion: form.descripcion,
                tipoMonto: form.tipoMonto,
                monto: form.monto,
                frecuencia: form.frecuencia,
                estado: form.estado,
                metodoPago: form.metodoPago,
                fechaInicio,
                fechaProximoPago,
                ...(fechaFin && { fechaFin }),
                ...(form.notas && form.notas.trim() && { notas: form.notas.trim() }),
            };
            console.log('Pago data:', pagoData);
            await crearPagoRecurrente(pagoData);
            console.log('Pago recurrente created successfully');
            onClose();
        }
        catch (error) {
            console.error('Error al crear el pago recurrente:', error);
            toast.error('Error al crear el pago recurrente');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: 'mt-6', children: [_jsxs("div", { className: 'grid grid-cols-1 md:grid-cols-2 gap-10', children: [_jsx("div", { className: 'space-y-8', children: _jsxs("div", { className: 'bg-white p-8 rounded-lg border space-y-8', children: [_jsx("h3", { className: 'text-xl font-semibold', children: "Informaci\u00F3n B\u00E1sica" }), _jsxs("div", { children: [_jsx("label", { className: 'block text-sm font-medium mb-2', children: "Cuenta Contable *" }), _jsxs("div", { className: 'flex gap-2', children: [_jsxs(Select, { value: form.idcuenta, onValueChange: (value) => setForm({ ...form, idcuenta: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: 'Selecciona una cuenta' }) }), _jsx(SelectContent, { children: cuentas.map((cuenta) => (_jsx(SelectItem, { value: cuenta.id, children: cuenta.nombre }, cuenta.id))) })] }), _jsxs(Dialog, { open: showNuevaCuenta, onOpenChange: setShowNuevaCuenta, children: [_jsx(DialogTrigger, { asChild: true, children: _jsx(Button, { variant: 'outline', size: 'icon', children: _jsx(Plus, { className: 'h-4 w-4' }) }) }), _jsx(DialogContent, { children: _jsx(NuevaCuentaContable, { cuentas: cuentas, onSuccess: () => setShowNuevaCuenta(false) }) })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: 'block text-sm font-medium mb-2', children: "Proveedor *" }), _jsxs("div", { className: 'flex gap-2', children: [_jsxs(Select, { value: form.idproveedor, onValueChange: (value) => setForm({ ...form, idproveedor: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: 'Selecciona un proveedor' }) }), _jsx(SelectContent, { children: proveedores.map((proveedor) => (_jsx(SelectItem, { value: proveedor.id, children: proveedor.nombre }, proveedor.id))) })] }), _jsxs(Dialog, { open: showNuevoProveedor, onOpenChange: setShowNuevoProveedor, children: [_jsx(DialogTrigger, { asChild: true, children: _jsx(Button, { variant: 'outline', size: 'icon', children: _jsx(Plus, { className: 'h-4 w-4' }) }) }), _jsx(DialogContent, { children: _jsx(NuevoProveedorForm, { open: showNuevoProveedor, onOpenChange: setShowNuevoProveedor }) })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: 'block text-sm font-medium mb-2', children: "Descripci\u00F3n *" }), _jsx(Textarea, { value: form.descripcion, onChange: (e) => setForm({ ...form, descripcion: e.target.value }), placeholder: 'Describe el pago recurrente', className: 'h-20' })] })] }) }), _jsxs("div", { className: 'space-y-8', children: [_jsxs("div", { className: 'bg-white p-8 rounded-lg border space-y-8', children: [_jsx("h3", { className: 'text-xl font-semibold', children: "Configuraci\u00F3n del Pago" }), _jsxs("div", { className: 'grid grid-cols-2 gap-4', children: [_jsxs("div", { children: [_jsx("label", { className: 'block text-sm font-medium mb-2', children: "Tipo de Monto *" }), _jsxs(Select, { value: form.tipoMonto, onValueChange: (value) => {
                                                            const newTipoMonto = value;
                                                            setForm({
                                                                ...form,
                                                                tipoMonto: newTipoMonto,
                                                                monto: newTipoMonto === TipoMonto.VARIABLE ? 0 : form.monto,
                                                            });
                                                        }, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: 'Selecciona tipo' }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: TipoMonto.FIJO, children: "Fijo" }), _jsx(SelectItem, { value: TipoMonto.VARIABLE, children: "Variable" })] })] })] }), form.tipoMonto === TipoMonto.FIJO && (_jsxs("div", { children: [_jsx("label", { className: 'block text-sm font-medium mb-2', children: "Monto *" }), _jsx(Input, { type: 'number', value: form.monto, onChange: (e) => setForm({ ...form, monto: Number(e.target.value) }), placeholder: '0.00', className: 'text-right' })] }))] }), _jsxs("div", { children: [_jsx("label", { className: 'block text-sm font-medium mb-2', children: "M\u00E9todo de Pago *" }), _jsxs(Select, { value: form.metodoPago, onValueChange: (value) => setForm({ ...form, metodoPago: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: 'Selecciona m\u00E9todo' }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: MetodoPago.TRANSFERENCIA, children: "Transferencia" }), _jsx(SelectItem, { value: MetodoPago.EFECTIVO, children: "Efectivo" }), _jsx(SelectItem, { value: MetodoPago.CHEQUE, children: "Cheque" }), _jsx(SelectItem, { value: MetodoPago.TARJETA, children: "Tarjeta" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: 'block text-sm font-medium mb-2', children: "Frecuencia *" }), _jsxs(Select, { value: form.frecuencia, onValueChange: (value) => setForm({ ...form, frecuencia: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: 'Selecciona frecuencia' }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: FrecuenciaPago.DIARIO, children: "Diario" }), _jsx(SelectItem, { value: FrecuenciaPago.SEMANAL, children: "Semanal" }), _jsx(SelectItem, { value: FrecuenciaPago.MENSUAL, children: "Mensual" }), _jsx(SelectItem, { value: FrecuenciaPago.ANUAL, children: "Anual" })] })] })] })] }), _jsxs("div", { className: 'bg-white p-8 rounded-lg border space-y-8', children: [_jsx("h3", { className: 'text-xl font-semibold', children: "Fechas" }), _jsxs("div", { className: 'grid grid-cols-2 gap-4', children: [_jsxs("div", { children: [_jsx("label", { className: 'block text-sm font-medium mb-2', children: "Fecha de Inicio *" }), _jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: 'outline', className: cn('w-full justify-start text-left font-normal', !form.fechaInicio && 'text-muted-foreground'), children: [_jsx(CalendarIcon, { className: 'mr-2 h-4 w-4' }), form.fechaInicio
                                                                            ? format(form.fechaInicio, 'PPP', { locale: es })
                                                                            : 'Selecciona fecha'] }) }), _jsx(PopoverContent, { className: 'w-auto p-0', children: _jsx(Calendar, { mode: 'single', selected: form.fechaInicio, onSelect: (date) => date && setForm({ ...form, fechaInicio: date }), initialFocus: true, locale: es }) })] })] }), _jsxs("div", { children: [_jsx("label", { className: 'block text-sm font-medium mb-2', children: "Fecha de Fin" }), _jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: 'outline', className: cn('w-full justify-start text-left font-normal', !form.fechaFin && 'text-muted-foreground'), children: [_jsx(CalendarIcon, { className: 'mr-2 h-4 w-4' }), form.fechaFin
                                                                            ? format(form.fechaFin, 'PPP', { locale: es })
                                                                            : 'Selecciona fecha'] }) }), _jsx(PopoverContent, { className: 'w-auto p-0', children: _jsx(Calendar, { mode: 'single', selected: form.fechaFin, onSelect: (date) => setForm({ ...form, fechaFin: date }), initialFocus: true, locale: es }) })] })] })] })] }), _jsxs("div", { className: 'bg-white p-8 rounded-lg border space-y-8', children: [_jsx("h3", { className: 'text-xl font-semibold', children: "Estado y Notas" }), _jsxs("div", { children: [_jsx("label", { className: 'block text-sm font-medium mb-2', children: "Estado *" }), _jsxs(Select, { value: form.estado, onValueChange: (value) => setForm({ ...form, estado: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: 'Selecciona estado' }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: EstadoPagoRecurrente.ACTIVO, children: "Activo" }), _jsx(SelectItem, { value: EstadoPagoRecurrente.INACTIVO, children: "Inactivo" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: 'block text-sm font-medium mb-2', children: "Notas" }), _jsx(Textarea, { value: form.notas, onChange: (e) => setForm({ ...form, notas: e.target.value }), placeholder: 'Notas adicionales', className: 'h-20' })] })] })] })] }), _jsxs("div", { className: 'flex justify-end gap-4 mt-10', children: [_jsx(Button, { type: 'button', variant: 'outline', onClick: onClose, disabled: isSubmitting, children: "Cancelar" }), _jsx(Button, { type: 'submit', disabled: isSubmitting, children: isSubmitting ? 'Guardando...' : 'Guardar Pago Recurrente' })] })] }));
}
