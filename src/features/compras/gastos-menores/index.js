import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { database as db } from '@/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, } from 'firebase/firestore';
import { Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger, } from '@/components/ui/tooltip';
import { FeatureLayout } from '@/components/layout/feature-layout';
export default function GastosMenores() {
    const [gastos, setGastos] = useState([]);
    const [descripcion, setDescripcion] = useState('');
    const [monto, setMonto] = useState('');
    const [fecha, setFecha] = useState('');
    const [responsable, setResponsable] = useState('');
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchGastos();
    }, []);
    const fetchGastos = async () => {
        try {
            const q = query(collection(db, 'gastos-menores'), orderBy('fecha', 'desc'));
            const querySnapshot = await getDocs(q);
            const gastosData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setGastos(gastosData);
        }
        catch (error) {
            console.error('Error fetching gastos:', error);
            toast.error('Error al cargar los gastos menores');
        }
        finally {
            setLoading(false);
        }
    };
    const handleAddOrEdit = async () => {
        if (!descripcion || !monto || !fecha || !responsable) {
            toast.error('Completa todos los campos');
            return;
        }
        try {
            if (editId) {
                const gastoRef = doc(db, 'gastos-menores', editId);
                await updateDoc(gastoRef, {
                    descripcion,
                    monto: Number(monto),
                    fecha,
                    responsable,
                    updatedAt: new Date(),
                });
                toast.success('Gasto menor actualizado');
            }
            else {
                await addDoc(collection(db, 'gastos-menores'), {
                    descripcion,
                    monto: Number(monto),
                    fecha,
                    responsable,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                toast.success('Gasto menor agregado');
            }
            setDescripcion('');
            setMonto('');
            setFecha('');
            setResponsable('');
            setEditId(null);
            setOpen(false);
            fetchGastos();
        }
        catch (error) {
            console.error('Error saving gasto:', error);
            toast.error('Error al guardar el gasto menor');
        }
    };
    const handleEdit = (gasto) => {
        setEditId(gasto.id);
        setDescripcion(gasto.descripcion);
        setMonto(gasto.monto.toString());
        setFecha(gasto.fecha);
        setResponsable(gasto.responsable);
        setOpen(true);
    };
    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, 'gastos-menores', id));
            toast.success('Gasto menor eliminado');
            fetchGastos();
        }
        catch (error) {
            console.error('Error deleting gasto:', error);
            toast.error('Error al eliminar el gasto menor');
        }
    };
    const filtered = gastos.filter((g) => g.descripcion.toLowerCase().includes(search.toLowerCase()) ||
        g.responsable.toLowerCase().includes(search.toLowerCase()));
    const actions = (_jsxs(_Fragment, { children: [_jsx(Button, { variant: 'outline', children: "Exportar Excel" }), _jsx(Button, { variant: 'outline', children: "Exportar PDF" })] }));
    return (_jsxs(FeatureLayout, { title: 'Gastos Menores', description: 'Administra los gastos menores de la empresa.', actions: actions, children: [_jsxs("div", { className: 'flex gap-4 items-center flex-wrap', children: [_jsx(Input, { placeholder: 'Buscar por descripci\u00F3n o responsable...', value: search, onChange: (e) => setSearch(e.target.value), className: 'max-w-xs' }), _jsxs(Sheet, { open: open, onOpenChange: setOpen, children: [_jsx(SheetTrigger, { asChild: true, children: _jsxs(Button, { className: 'ml-auto', onClick: () => {
                                        setEditId(null);
                                        setDescripcion('');
                                        setMonto('');
                                        setFecha('');
                                        setResponsable('');
                                        setOpen(true);
                                    }, children: [_jsx(Plus, { className: 'w-4 h-4 mr-2' }), " Agregar gasto menor"] }) }), _jsxs(SheetContent, { side: 'top', className: 'h-[400px] w-full max-w-2xl mx-auto rounded-b-xl border-t-0 animate-in slide-in-from-top duration-300', children: [_jsx(SheetHeader, { className: 'mb-6', children: _jsx(SheetTitle, { className: 'text-2xl', children: editId ? 'Editar Gasto Menor' : 'Agregar Gasto Menor' }) }), _jsxs("div", { className: 'grid grid-cols-2 gap-4', children: [_jsxs("div", { className: 'space-y-4', children: [_jsxs("div", { children: [_jsx("label", { className: 'text-sm font-medium mb-1.5 block', children: "Descripci\u00F3n" }), _jsx(Input, { value: descripcion, onChange: (e) => setDescripcion(e.target.value), placeholder: 'Descripci\u00F3n del gasto' })] }), _jsxs("div", { children: [_jsx("label", { className: 'text-sm font-medium mb-1.5 block', children: "Monto" }), _jsx(Input, { type: 'number', value: monto, onChange: (e) => setMonto(e.target.value), placeholder: '0.00' })] })] }), _jsxs("div", { className: 'space-y-4', children: [_jsxs("div", { children: [_jsx("label", { className: 'text-sm font-medium mb-1.5 block', children: "Fecha" }), _jsx(Input, { type: 'date', value: fecha, onChange: (e) => setFecha(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: 'text-sm font-medium mb-1.5 block', children: "Responsable" }), _jsx(Input, { value: responsable, onChange: (e) => setResponsable(e.target.value), placeholder: 'Nombre del responsable' })] })] })] }), _jsxs("div", { className: 'flex gap-2 justify-end mt-6', children: [_jsx(Button, { variant: 'outline', type: 'button', onClick: () => {
                                                    setOpen(false);
                                                    setEditId(null);
                                                }, children: "Cancelar" }), _jsx(Button, { onClick: handleAddOrEdit, children: editId ? 'Actualizar' : 'Agregar' })] })] })] })] }), _jsx("div", { className: 'border rounded-lg overflow-x-auto bg-white', children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Fecha" }), _jsx(TableHead, { children: "Descripci\u00F3n" }), _jsx(TableHead, { children: "Monto" }), _jsx(TableHead, { children: "Responsable" }), _jsx(TableHead, { children: "Acciones" })] }) }), _jsx(TableBody, { children: loading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 5, className: 'text-center text-muted-foreground py-8', children: "Cargando gastos..." }) })) : filtered.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 5, className: 'text-center text-muted-foreground py-8', children: "No hay gastos menores registrados." }) })) : (filtered.map((gasto) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsx("span", { className: 'font-mono text-xs bg-muted px-2 py-1 rounded', children: gasto.fecha }) }), _jsx(TableCell, { children: gasto.descripcion }), _jsx(TableCell, { children: _jsxs("span", { className: 'font-semibold text-primary', children: ["$", gasto.monto.toLocaleString()] }) }), _jsx(TableCell, { children: gasto.responsable }), _jsxs(TableCell, { className: 'flex gap-2', children: [_jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { size: 'icon', variant: 'outline', onClick: () => handleEdit(gasto), children: _jsx(Edit, { className: 'w-4 h-4' }) }) }), _jsx(TooltipContent, { children: "Editar" })] }), _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { size: 'icon', variant: 'destructive', onClick: () => handleDelete(gasto.id), children: _jsx(Trash2, { className: 'w-4 h-4' }) }) }), _jsx(TooltipContent, { children: "Eliminar" })] })] })] }, gasto.id)))) })] }) })] }));
}
