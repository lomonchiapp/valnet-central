import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { PackageIcon, PlusCircle, ArrowLeft } from 'lucide-react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useCoordinacionState } from '@/context/global/useCoordinacionState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent, } from '@/components/ui/tooltip';
import CombustiblePanel from './components/CombustiblePanel';
import { InventarioBrigadaDialog } from './components/InventarioBrigadaDialog';
import RegistroCombustibleDialog from './components/RegistroCombustibleDialog';
function RegistroCombustibleForm({ brigadaId, onCancel, }) {
    // TODO: Implementar formulario real
    return (_jsxs(Card, { className: 'max-w-xl mx-auto mt-8 shadow-lg', children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Registrar carga de combustible" }), _jsxs(CardDescription, { children: ["Brigada ID: ", brigadaId] })] }), _jsxs(CardContent, { children: [_jsx("div", { className: 'mb-4', children: "(Aqu\u00ED va el formulario...)" }), _jsx(Button, { variant: 'outline', onClick: onCancel, children: "Cancelar" })] })] }));
}
export default function BrigadaDetail() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { brigadas } = useCoordinacionState();
    const brigada = brigadas.find((brigada) => brigada.id === id);
    const [openInventario, setOpenInventario] = useState(false);
    const [openRegistro, setOpenRegistro] = useState(false);
    // Detectar si estamos en la ruta de nuevo registro
    const isNuevo = location.pathname.endsWith('/nuevo');
    if (!brigada)
        return _jsx("div", { children: "No se encontr\u00F3 la brigada." });
    if (isNuevo) {
        return (_jsx(RegistroCombustibleForm, { brigadaId: brigada.id, onCancel: () => navigate(-1) }));
    }
    return (_jsxs(Card, { className: 'max-w-4xl w-full mx-auto mt-8 shadow-lg p-2 md:p-6 relative', children: [_jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsxs(Button, { variant: 'ghost', size: 'sm', className: 'absolute top-4 left-4 z-10', onClick: () => navigate('/coordinacion/brigadas'), children: [_jsx(ArrowLeft, { className: 'w-4 h-4 mr-1' }), " Volver"] }) }), _jsx(TooltipContent, { children: "Volver a brigadas" })] }) }), _jsxs(CardHeader, { className: 'flex flex-row items-center gap-4 justify-between', children: [_jsxs("div", { children: [_jsx(CardTitle, { className: 'text-2xl font-bold', children: brigada.nombre }), _jsxs(CardDescription, { className: 'text-sm text-muted-foreground', children: ["ID: ", brigada.id] })] }), _jsxs("div", { className: 'flex gap-2', children: [_jsxs(Button, { variant: 'outline', onClick: () => setOpenInventario(true), title: 'Ver inventario', children: [_jsx(PackageIcon, { className: 'w-5 h-5 mr-1' }), " Inventario"] }), _jsxs(Button, { onClick: () => setOpenRegistro(true), className: 'gap-1', children: [_jsx(PlusCircle, { className: 'w-4 h-4' }), " Agregar registro"] })] })] }), _jsx(CardContent, { className: 'space-y-4', children: _jsx(CombustiblePanel, { brigada: brigada }) }), _jsx(Dialog, { open: openInventario, onOpenChange: setOpenInventario, children: _jsx(InventarioBrigadaDialog, { open: openInventario, onOpenChange: setOpenInventario, inventarioId: brigada.inventarioId || null, brigadaNombre: brigada.nombre || '' }) }), _jsx(Dialog, { open: openRegistro, onOpenChange: setOpenRegistro, children: _jsx(RegistroCombustibleDialog, { brigada: brigada, onClose: () => setOpenRegistro(false), modo: 'crear' }) })] }));
}
