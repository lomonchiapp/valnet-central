import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { PlusCircle, PackageIcon, PenIcon, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useCoordinacionState } from '@/context/global/useCoordinacionState';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, } from '@/components/ui/dialog';
import { InventarioBrigadaDialog } from './components/InventarioBrigadaDialog';
import { NuevaBrigadaForm, } from './components/NuevaBrigadaForm';
import RegistroCombustibleDialog from './components/RegistroCombustibleDialog';
import { useBorrarBrigada } from './hooks/useBorrarBrigada';
import { useCrearBrigada } from './hooks/useCrearBrigada';
import { useUpdateBrigada } from './hooks/useUpdateBrigada';
export default function Brigadas() {
    const { subscribeToBrigadas, brigadas } = useCoordinacionState();
    const [openInventario, setOpenInventario] = useState(false);
    const [openRegistro, setOpenRegistro] = useState(false);
    const [selectedBrigada, setSelectedBrigada] = useState(null);
    const [openBrigadaDialog, setOpenBrigadaDialog] = useState(false);
    const [editBrigada, setEditBrigada] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [brigadaAEliminar, setBrigadaAEliminar] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [deleteMotivo, setDeleteMotivo] = useState('');
    const [deleting, setDeleting] = useState(false);
    const crearBrigada = useCrearBrigada();
    const actualizarBrigada = useUpdateBrigada();
    const borrarBrigada = useBorrarBrigada();
    useEffect(() => {
        const unsubscribe = subscribeToBrigadas();
        return () => unsubscribe();
    }, [subscribeToBrigadas]);
    const handleOpenInventario = (brigada) => {
        setSelectedBrigada(brigada);
        setOpenInventario(true);
    };
    const handleOpenRegistro = (brigada) => {
        setSelectedBrigada(brigada);
        setOpenRegistro(true);
    };
    const handleOpenNuevaBrigada = () => {
        setEditBrigada(null);
        setOpenBrigadaDialog(true);
    };
    const handleOpenEditarBrigada = (brigada) => {
        setEditBrigada(brigada);
        setOpenBrigadaDialog(true);
    };
    const handleGuardarBrigada = async (values) => {
        if (editBrigada) {
            await actualizarBrigada(editBrigada.id, values);
        }
        else {
            await crearBrigada(values);
        }
        setOpenBrigadaDialog(false);
    };
    const handleOpenDeleteBrigada = (brigada) => {
        setBrigadaAEliminar(brigada);
        setDeleteDialogOpen(true);
    };
    const handleDeleteBrigada = async () => {
        if (brigadaAEliminar && user) {
            setDeleting(true);
            await borrarBrigada({
                brigada: brigadaAEliminar,
                motivo: deleteMotivo,
                usuario: user,
            });
            setDeleting(false);
            setDeleteDialogOpen(false);
            setBrigadaAEliminar(null);
            setDeleteMotivo('');
        }
    };
    return (_jsxs("div", { className: 'p-4 md:p-6 lg:p-8 space-y-6', children: [_jsxs("div", { className: 'flex items-center justify-between', children: [_jsxs("div", { children: [_jsx("h1", { className: 'text-2xl md:text-3xl font-bold tracking-tight', children: "Gesti\u00F3n de Brigadas" }), _jsx("p", { className: 'text-muted-foreground', children: "Administra brigadas y control de combustible" })] }), _jsxs(Button, { onClick: handleOpenNuevaBrigada, className: 'gap-2', children: [_jsx(PlusCircle, { className: 'w-5 h-5' }), " Nueva brigada"] })] }), _jsx("div", { className: 'grid gap-4 md:grid-cols-2 lg:grid-cols-3', children: brigadas.map((brigada) => (_jsxs("div", { className: 'border rounded-lg p-4 flex flex-col gap-2 shadow-sm bg-white cursor-pointer group', onClick: (e) => {
                        // Evitar navegación si se hace click en un botón de acción
                        if (e.target.closest('button'))
                            return;
                        navigate(`/coordinacion/brigadas/${brigada.id}`);
                    }, children: [_jsxs("div", { className: 'font-bold text-lg flex items-center gap-2', children: [brigada.nombre, _jsx("button", { className: 'ml-2 text-primary hover:text-primary/80', title: 'Ver inventario de brigada', onClick: (e) => {
                                        e.stopPropagation();
                                        handleOpenInventario(brigada);
                                    }, children: _jsx(PackageIcon, { className: 'w-5 h-5' }) }), _jsx("button", { className: 'ml-2 text-blue-600 hover:text-blue-800', title: 'Editar brigada', onClick: (e) => {
                                        e.stopPropagation();
                                        handleOpenEditarBrigada(brigada);
                                    }, children: _jsx(PenIcon, { className: 'w-4 h-4' }) }), _jsx("button", { className: 'ml-2 text-red-600 hover:text-red-800', title: 'Eliminar brigada', onClick: (e) => {
                                        e.stopPropagation();
                                        handleOpenDeleteBrigada(brigada);
                                    }, children: _jsx(Trash2, { className: 'w-4 h-4' }) })] }), _jsxs("div", { className: 'text-sm text-muted-foreground', children: ["Matr\u00EDcula: ", brigada.matricula] }), _jsxs("div", { className: 'text-xs text-muted-foreground', children: ["Kilometraje actual: ", brigada.kilometrajeActual ?? 0, " km"] }), _jsx("div", { className: 'flex gap-2 mt-2', children: _jsx("button", { className: 'flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700', onClick: (e) => {
                                    e.stopPropagation();
                                    handleOpenRegistro(brigada);
                                }, title: 'Registrar carga de combustible', children: _jsx(PlusCircle, { className: 'w-4 h-4' }) }) })] }, brigada.id))) }), _jsx(InventarioBrigadaDialog, { open: openInventario, onOpenChange: setOpenInventario, inventarioId: selectedBrigada?.inventarioId || null, brigadaNombre: selectedBrigada?.nombre || '' }), _jsx(Dialog, { open: openRegistro, onOpenChange: setOpenRegistro, children: selectedBrigada && (_jsx(RegistroCombustibleDialog, { brigada: selectedBrigada, onClose: () => setOpenRegistro(false) })) }), _jsx(Dialog, { open: openBrigadaDialog, onOpenChange: setOpenBrigadaDialog, children: _jsxs(DialogContent, { className: 'sm:max-w-[500px]', children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: editBrigada ? 'Editar brigada' : 'Nueva brigada' }), _jsx(DialogDescription, { children: editBrigada
                                        ? 'Edita los datos de la brigada.'
                                        : 'Registra una nueva brigada.' })] }), _jsx(NuevaBrigadaForm, { onSubmit: handleGuardarBrigada, onNewInventoryClick: () => { }, ...(editBrigada && { defaultValues: editBrigada }) }), _jsx(DialogFooter, { children: _jsx(Button, { variant: 'outline', onClick: () => setOpenBrigadaDialog(false), children: "Cancelar" }) })] }) }), _jsx(Dialog, { open: deleteDialogOpen, onOpenChange: setDeleteDialogOpen, children: _jsxs(DialogContent, { className: 'max-w-md', children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Eliminar brigada" }), _jsx(DialogDescription, { children: "Por favor, indica el motivo de la eliminaci\u00F3n. Esta acci\u00F3n quedar\u00E1 registrada." })] }), _jsx("input", { className: 'w-full border rounded px-2 py-1 mt-2', placeholder: 'Motivo de la eliminaci\u00F3n', value: deleteMotivo, onChange: (e) => setDeleteMotivo(e.target.value), disabled: deleting }), _jsxs(DialogFooter, { children: [_jsx(Button, { variant: 'outline', onClick: () => setDeleteDialogOpen(false), disabled: deleting, children: "Cancelar" }), _jsx(Button, { variant: 'destructive', onClick: handleDeleteBrigada, disabled: !deleteMotivo || deleting, children: deleting ? 'Eliminando...' : 'Eliminar' })] })] }) })] }));
}
