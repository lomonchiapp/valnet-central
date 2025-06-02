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
export default function Proveedores() {
    const [proveedores, setProveedores] = useState([]);
    const [nombre, setNombre] = useState('');
    const [rnc, setRnc] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchProveedores();
    }, []);
    const fetchProveedores = async () => {
        try {
            const q = query(collection(db, 'proveedores'), orderBy('nombre'));
            const querySnapshot = await getDocs(q);
            const proveedoresData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setProveedores(proveedoresData);
        }
        catch (error) {
            console.error('Error fetching proveedores:', error);
            toast.error('Error al cargar los proveedores');
        }
        finally {
            setLoading(false);
        }
    };
    const handleAddOrEdit = async () => {
        if (!nombre || !rnc || !telefono || !email) {
            toast.error('Completa todos los campos');
            return;
        }
        try {
            if (editId) {
                const proveedorRef = doc(db, 'proveedores', editId);
                await updateDoc(proveedorRef, {
                    nombre,
                    rnc,
                    telefono,
                    email,
                    updatedAt: new Date(),
                });
                toast.success('Proveedor actualizado');
            }
            else {
                await addDoc(collection(db, 'proveedores'), {
                    nombre,
                    rnc,
                    telefono,
                    email,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                toast.success('Proveedor agregado');
            }
            setNombre('');
            setRnc('');
            setTelefono('');
            setEmail('');
            setEditId(null);
            setOpen(false);
            fetchProveedores();
        }
        catch (error) {
            console.error('Error saving proveedor:', error);
            toast.error('Error al guardar el proveedor');
        }
    };
    const handleEdit = (proveedor) => {
        setEditId(proveedor.id);
        setNombre(proveedor.nombre);
        setRnc(proveedor.rnc);
        setTelefono(proveedor.telefono);
        setEmail(proveedor.email);
        setOpen(true);
    };
    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, 'proveedores', id));
            toast.success('Proveedor eliminado');
            fetchProveedores();
        }
        catch (error) {
            console.error('Error deleting proveedor:', error);
            toast.error('Error al eliminar el proveedor');
        }
    };
    const filtered = proveedores.filter((p) => p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        p.rnc.toLowerCase().includes(search.toLowerCase()));
    const actions = (_jsxs(_Fragment, { children: [_jsx(Button, { variant: 'outline', children: "Exportar Excel" }), _jsx(Button, { variant: 'outline', children: "Exportar PDF" })] }));
    return (_jsxs(FeatureLayout, { title: 'Proveedores', description: 'Administra los proveedores de la empresa.', actions: actions, children: [_jsxs("div", { className: 'flex gap-4 items-center flex-wrap', children: [_jsx(Input, { placeholder: 'Buscar por nombre o RNC...', value: search, onChange: (e) => setSearch(e.target.value), className: 'max-w-xs' }), _jsxs(Sheet, { open: open, onOpenChange: setOpen, children: [_jsx(SheetTrigger, { asChild: true, children: _jsxs(Button, { className: 'ml-auto', onClick: () => {
                                        setEditId(null);
                                        setNombre('');
                                        setRnc('');
                                        setTelefono('');
                                        setEmail('');
                                        setOpen(true);
                                    }, children: [_jsx(Plus, { className: 'w-4 h-4 mr-2' }), " Agregar proveedor"] }) }), _jsxs(SheetContent, { side: 'top', className: 'h-[400px] w-full max-w-2xl mx-auto rounded-b-xl border-t-0 animate-in slide-in-from-top duration-300', children: [_jsx(SheetHeader, { className: 'mb-6', children: _jsx(SheetTitle, { className: 'text-2xl', children: editId ? 'Editar Proveedor' : 'Agregar Proveedor' }) }), _jsxs("div", { className: 'grid grid-cols-2 gap-4', children: [_jsxs("div", { className: 'space-y-4', children: [_jsxs("div", { children: [_jsx("label", { className: 'text-sm font-medium mb-1.5 block', children: "Nombre" }), _jsx(Input, { value: nombre, onChange: (e) => setNombre(e.target.value), placeholder: 'Nombre del proveedor' })] }), _jsxs("div", { children: [_jsx("label", { className: 'text-sm font-medium mb-1.5 block', children: "RNC" }), _jsx(Input, { value: rnc, onChange: (e) => setRnc(e.target.value), placeholder: 'RNC del proveedor' })] })] }), _jsxs("div", { className: 'space-y-4', children: [_jsxs("div", { children: [_jsx("label", { className: 'text-sm font-medium mb-1.5 block', children: "Tel\u00E9fono" }), _jsx(Input, { value: telefono, onChange: (e) => setTelefono(e.target.value), placeholder: 'Tel\u00E9fono de contacto' })] }), _jsxs("div", { children: [_jsx("label", { className: 'text-sm font-medium mb-1.5 block', children: "Email" }), _jsx(Input, { type: 'email', value: email, onChange: (e) => setEmail(e.target.value), placeholder: 'correo@ejemplo.com' })] })] })] }), _jsxs("div", { className: 'flex gap-2 justify-end mt-6', children: [_jsx(Button, { variant: 'outline', type: 'button', onClick: () => {
                                                    setOpen(false);
                                                    setEditId(null);
                                                }, children: "Cancelar" }), _jsx(Button, { onClick: handleAddOrEdit, children: editId ? 'Actualizar' : 'Agregar' })] })] })] })] }), _jsx("div", { className: 'border rounded-lg overflow-x-auto bg-white', children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Nombre" }), _jsx(TableHead, { children: "RNC" }), _jsx(TableHead, { children: "Tel\u00E9fono" }), _jsx(TableHead, { children: "Email" }), _jsx(TableHead, { children: "Acciones" })] }) }), _jsx(TableBody, { children: loading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 5, className: 'text-center text-muted-foreground py-8', children: "Cargando proveedores..." }) })) : filtered.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 5, className: 'text-center text-muted-foreground py-8', children: "No hay proveedores registrados." }) })) : (filtered.map((proveedor) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: proveedor.nombre }), _jsx(TableCell, { children: proveedor.rnc }), _jsx(TableCell, { children: proveedor.telefono }), _jsx(TableCell, { children: proveedor.email }), _jsxs(TableCell, { className: 'flex gap-2', children: [_jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { size: 'icon', variant: 'outline', onClick: () => handleEdit(proveedor), children: _jsx(Edit, { className: 'w-4 h-4' }) }) }), _jsx(TooltipContent, { children: "Editar" })] }), _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { size: 'icon', variant: 'destructive', onClick: () => handleDelete(proveedor.id), children: _jsx(Trash2, { className: 'w-4 h-4' }) }) }), _jsx(TooltipContent, { children: "Eliminar" })] })] })] }, proveedor.id)))) })] }) })] }));
}
