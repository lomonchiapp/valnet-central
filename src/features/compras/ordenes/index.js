import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { database as db } from '@/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, } from 'firebase/firestore';
import { Edit, Trash2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger, } from '@/components/ui/tooltip';
import { FeatureLayout } from '@/components/layout/feature-layout';
const estados = ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'PAGADA'];
export default function OrdenesCompra() {
    const [ordenes, setOrdenes] = useState([]);
    const [proveedor, setProveedor] = useState('');
    const [fecha, setFecha] = useState('');
    const [items, setItems] = useState([]);
    const [itemDesc, setItemDesc] = useState('');
    const [itemCant, setItemCant] = useState('');
    const [itemPrecio, setItemPrecio] = useState('');
    const [estado, setEstado] = useState('PENDIENTE');
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchOrdenes();
    }, []);
    const fetchOrdenes = async () => {
        try {
            const q = query(collection(db, 'ordenes-compra'), orderBy('fecha', 'desc'));
            const querySnapshot = await getDocs(q);
            const ordenesData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setOrdenes(ordenesData);
        }
        catch (error) {
            console.error('Error fetching ordenes:', error);
            toast.error('Error al cargar las órdenes');
        }
        finally {
            setLoading(false);
        }
    };
    const handleAddItem = () => {
        if (!itemDesc || !itemCant || !itemPrecio) {
            toast.error('Completa todos los campos del item');
            return;
        }
        setItems([
            ...items,
            {
                descripcion: itemDesc,
                cantidad: Number(itemCant),
                precioUnitario: Number(itemPrecio),
            },
        ]);
        setItemDesc('');
        setItemCant('');
        setItemPrecio('');
    };
    const handleRemoveItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };
    const handleAddOrEdit = async () => {
        if (!proveedor || !fecha || items.length === 0) {
            toast.error('Completa todos los campos y agrega al menos un item');
            return;
        }
        const total = items.reduce((acc, i) => acc + i.cantidad * i.precioUnitario, 0);
        try {
            if (editId) {
                const ordenRef = doc(db, 'ordenes-compra', editId);
                await updateDoc(ordenRef, {
                    proveedor,
                    fecha,
                    items,
                    total,
                    estado,
                    updatedAt: new Date(),
                });
                toast.success('Orden actualizada');
            }
            else {
                await addDoc(collection(db, 'ordenes-compra'), {
                    proveedor,
                    fecha,
                    items,
                    total,
                    estado,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                toast.success('Orden agregada');
            }
            setProveedor('');
            setFecha('');
            setItems([]);
            setEstado('PENDIENTE');
            setEditId(null);
            setOpen(false);
            fetchOrdenes();
        }
        catch (error) {
            console.error('Error saving orden:', error);
            toast.error('Error al guardar la orden');
        }
    };
    const handleEdit = (orden) => {
        setEditId(orden.id);
        setProveedor(orden.proveedor);
        setFecha(orden.fecha);
        setItems(orden.items);
        setEstado(orden.estado);
        setOpen(true);
    };
    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, 'ordenes-compra', id));
            toast.success('Orden eliminada');
            fetchOrdenes();
        }
        catch (error) {
            console.error('Error deleting orden:', error);
            toast.error('Error al eliminar la orden');
        }
    };
    const filtered = ordenes.filter((o) => o.proveedor.toLowerCase().includes(search.toLowerCase()));
    const actions = (_jsxs(_Fragment, { children: [_jsx(Button, { variant: 'outline', children: "Exportar Excel" }), _jsx(Button, { variant: 'outline', children: "Exportar PDF" })] }));
    return (_jsxs(FeatureLayout, { title: '\u00D3rdenes de Compra', description: 'Administra las \u00F3rdenes de compra de la empresa.', actions: actions, children: [_jsxs("div", { className: 'flex gap-4 items-center flex-wrap', children: [_jsx(Input, { placeholder: 'Buscar por proveedor...', value: search, onChange: (e) => setSearch(e.target.value), className: 'max-w-xs' }), _jsxs(Sheet, { open: open, onOpenChange: setOpen, children: [_jsx(SheetTrigger, { asChild: true, children: _jsxs(Button, { className: 'ml-auto', onClick: () => {
                                        setEditId(null);
                                        setProveedor('');
                                        setFecha('');
                                        setItems([]);
                                        setEstado('PENDIENTE');
                                        setOpen(true);
                                    }, children: [_jsx(Plus, { className: 'w-4 h-4 mr-2' }), " Agregar orden"] }) }), _jsxs(SheetContent, { side: 'top', className: 'h-[600px] w-full max-w-4xl mx-auto rounded-b-xl border-t-0 animate-in slide-in-from-top duration-300', children: [_jsx(SheetHeader, { className: 'mb-6', children: _jsx(SheetTitle, { className: 'text-2xl', children: editId ? 'Editar Orden' : 'Agregar Orden' }) }), _jsxs("div", { className: 'space-y-6', children: [_jsxs("div", { className: 'grid grid-cols-3 gap-4', children: [_jsxs("div", { children: [_jsx("label", { className: 'text-sm font-medium mb-1.5 block', children: "Proveedor" }), _jsx(Input, { value: proveedor, onChange: (e) => setProveedor(e.target.value), placeholder: 'Nombre del proveedor' })] }), _jsxs("div", { children: [_jsx("label", { className: 'text-sm font-medium mb-1.5 block', children: "Fecha" }), _jsx(Input, { type: 'date', value: fecha, onChange: (e) => setFecha(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: 'text-sm font-medium mb-1.5 block', children: "Estado" }), _jsxs(Select, { value: estado, onValueChange: setEstado, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: 'Selecciona un estado' }) }), _jsx(SelectContent, { children: estados.map((e) => (_jsx(SelectItem, { value: e, children: e }, e))) })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: 'font-semibold mb-2', children: "Items" }), _jsxs("div", { className: 'grid grid-cols-4 gap-2 mb-2', children: [_jsx(Input, { value: itemDesc, onChange: (e) => setItemDesc(e.target.value), placeholder: 'Descripci\u00F3n' }), _jsx(Input, { type: 'number', value: itemCant, onChange: (e) => setItemCant(e.target.value), placeholder: 'Cantidad' }), _jsx(Input, { type: 'number', value: itemPrecio, onChange: (e) => setItemPrecio(e.target.value), placeholder: 'Precio Unitario' }), _jsx(Button, { type: 'button', onClick: handleAddItem, children: "Agregar Item" })] }), _jsx("div", { className: 'border rounded-lg p-4 space-y-2', children: items.length === 0 ? (_jsx("p", { className: 'text-muted-foreground text-sm', children: "No hay items agregados" })) : (items.map((item, i) => (_jsxs("div", { className: 'flex items-center justify-between bg-muted/50 p-2 rounded', children: [_jsxs("span", { children: [item.descripcion, " - ", item.cantidad, " x $", item.precioUnitario] }), _jsx(Button, { size: 'icon', variant: 'ghost', onClick: () => handleRemoveItem(i), children: _jsx(X, { className: 'w-4 h-4' }) })] }, i)))) })] }), _jsxs("div", { className: 'flex gap-2 justify-end', children: [_jsx(Button, { variant: 'outline', type: 'button', onClick: () => {
                                                            setOpen(false);
                                                            setEditId(null);
                                                        }, children: "Cancelar" }), _jsx(Button, { onClick: handleAddOrEdit, children: editId ? 'Actualizar' : 'Agregar' })] })] })] })] })] }), _jsx("div", { className: 'border rounded-lg overflow-x-auto bg-white', children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Fecha" }), _jsx(TableHead, { children: "Proveedor" }), _jsx(TableHead, { children: "Items" }), _jsx(TableHead, { children: "Total" }), _jsx(TableHead, { children: "Estado" }), _jsx(TableHead, { children: "Acciones" })] }) }), _jsx(TableBody, { children: loading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, className: 'text-center text-muted-foreground py-8', children: "Cargando \u00F3rdenes..." }) })) : filtered.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, className: 'text-center text-muted-foreground py-8', children: "No hay \u00F3rdenes registradas." }) })) : (filtered.map((orden) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsx("span", { className: 'font-mono text-xs bg-muted px-2 py-1 rounded', children: orden.fecha }) }), _jsx(TableCell, { children: orden.proveedor }), _jsx(TableCell, { children: _jsx("ul", { className: 'list-disc pl-4', children: orden.items.map((item, i) => (_jsxs("li", { className: 'text-sm', children: [item.descripcion, " - ", item.cantidad, " x $", item.precioUnitario] }, i))) }) }), _jsx(TableCell, { children: _jsxs("span", { className: 'font-semibold text-primary', children: ["$", orden.total.toLocaleString()] }) }), _jsx(TableCell, { children: _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${orden.estado === 'PENDIENTE'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : orden.estado === 'APROBADA'
                                                    ? 'bg-green-100 text-green-800'
                                                    : orden.estado === 'RECHAZADA'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-blue-100 text-blue-800'}`, children: orden.estado }) }), _jsxs(TableCell, { className: 'flex gap-2', children: [_jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { size: 'icon', variant: 'outline', onClick: () => handleEdit(orden), children: _jsx(Edit, { className: 'w-4 h-4' }) }) }), _jsx(TooltipContent, { children: "Editar" })] }), _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { size: 'icon', variant: 'destructive', onClick: () => handleDelete(orden.id), children: _jsx(Trash2, { className: 'w-4 h-4' }) }) }), _jsx(TooltipContent, { children: "Eliminar" })] })] })] }, orden.id)))) })] }) })] }));
}
