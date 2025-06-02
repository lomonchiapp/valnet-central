import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Plus, Warehouse, ChevronDown, Search, PackageOpen, PackageMinus, ArrowLeftRight, ClipboardCheck, } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAlmacenState } from '@/context/global/useAlmacenState';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuShortcut, } from '@/components/ui/dropdown-menu';
import { UserMenu } from '@/components/layout/UserMenu';
import { NotificacionesDropdown } from '@/features/notificaciones/components/NotificacionesDropdown';
export function InventarioTopBar() {
    const navigate = useNavigate();
    const { inventarios, subscribeToInventarios } = useAlmacenState();
    const [currentInventario, setCurrentInventario] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    useEffect(() => {
        // Subscribe to inventarios from Firestore
        const unsubscribe = subscribeToInventarios();
        return () => unsubscribe();
    }, [subscribeToInventarios]);
    useEffect(() => {
        // Set current inventario to the first one when inventarios are loaded
        // or if current one doesn't exist anymore
        if (inventarios.length > 0) {
            if (!currentInventario ||
                !inventarios.find((inv) => inv.id === currentInventario.id)) {
                // Find principal inventario first
                const principalInventario = inventarios.find((inv) => inv.principal);
                setCurrentInventario(principalInventario || inventarios[0]);
            }
        }
    }, [inventarios, currentInventario]);
    // Acciones para el botón "Crear" con íconos y atajos
    const createActions = [
        {
            label: 'Entrada de artículos',
            icon: _jsx(PackageOpen, { className: 'mr-2 h-4 w-4' }),
            shortcut: '⌘E',
            action: () => navigate('/almacen/entradas/nuevo'),
        },
        {
            label: 'Salida de artículos',
            icon: _jsx(PackageMinus, { className: 'mr-2 h-4 w-4' }),
            shortcut: '⌘S',
            action: () => navigate('/almacen/salidas/nuevo'),
        },
        {
            label: 'Transferencia',
            icon: _jsx(ArrowLeftRight, { className: 'mr-2 h-4 w-4' }),
            shortcut: '⌘T',
            action: () => navigate('/almacen/transferencias/nuevo'),
        },
        {
            label: 'Selección de inventario',
            icon: _jsx(ClipboardCheck, { className: 'mr-2 h-4 w-4' }),
            shortcut: '⌘I',
            action: () => navigate('/almacen/inventarios'),
        },
    ];
    // Register keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.metaKey || e.ctrlKey) {
                switch (e.key.toLowerCase()) {
                    case 'e':
                        e.preventDefault();
                        navigate('/almacen/entradas/nuevo');
                        break;
                    case 's':
                        e.preventDefault();
                        navigate('/almacen/salidas/nuevo');
                        break;
                    case 't':
                        e.preventDefault();
                        navigate('/almacen/transferencias/nuevo');
                        break;
                    case 'i':
                        e.preventDefault();
                        navigate('/almacen/inventarios');
                        break;
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [navigate]);
    const handleInventarioChange = (inventario) => {
        setCurrentInventario(inventario);
        // Navigate to the selected inventory
        navigate(`/almacen/inventarios/${inventario.id}`);
    };
    // Filter inventarios based on search term
    const filteredInventarios = searchTerm && inventarios
        ? inventarios.filter((inv) => inv.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()))
        : inventarios;
    return (_jsxs("header", { className: 'w-full bg-[#005BAA] shadow z-50 h-20 flex items-center px-6', children: [_jsxs("div", { className: 'flex-1', children: [_jsx("h2", { className: 'text-xl font-medium text-white', children: "Gesti\u00F3n de Inventario" }), _jsx("p", { className: 'text-sm text-muted-foreground text-gray-100', children: "Visualiza y gestiona el stock de productos" })] }), _jsxs("div", { className: 'flex items-center gap-3', children: [currentInventario && (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: 'secondary', className: 'bg-white hover:bg-gray-100', children: [_jsx(Warehouse, { className: 'mr-2 h-4 w-4 text-[#005BAA]' }), currentInventario.nombre, _jsx(ChevronDown, { className: 'ml-2 h-4 w-4' })] }) }), _jsxs(DropdownMenuContent, { align: 'end', className: 'w-64', children: [_jsx("div", { className: 'p-2', children: _jsxs("div", { className: 'flex items-center border rounded-md px-3 py-1 mb-2', children: [_jsx(Search, { className: 'h-4 w-4 text-gray-500 mr-2' }), _jsx("input", { type: 'text', placeholder: 'Buscar inventario...', className: 'border-none outline-none flex-1 text-sm', value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) })] }) }), _jsx("div", { className: 'max-h-60 overflow-y-auto', children: filteredInventarios && filteredInventarios.length > 0 ? (filteredInventarios.map((inventario) => (_jsxs(DropdownMenuItem, { onClick: () => handleInventarioChange(inventario), className: 'cursor-pointer', children: [_jsx(Warehouse, { className: 'mr-2 h-4 w-4 text-[#005BAA]' }), _jsxs("div", { children: [_jsx("div", { children: inventario.nombre }), inventario.descripcion && (_jsx("div", { className: 'text-xs text-gray-500', children: inventario.descripcion }))] }), inventario.principal && (_jsx("div", { className: 'ml-auto text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full', children: "Principal" }))] }, inventario.id)))) : (_jsx("div", { className: 'px-2 py-1 text-sm text-gray-500 text-center', children: "No se encontraron inventarios" })) })] })] })), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { style: { backgroundColor: '#F37021', borderColor: '#F37021' }, className: 'hover:bg-orange-500', children: [_jsx(Plus, { className: 'mr-2 h-4 w-4' }), "Crear"] }) }), _jsxs(DropdownMenuContent, { align: 'end', className: 'w-56', children: [_jsx("div", { className: 'p-2 text-sm font-medium text-muted-foreground', children: "Acciones r\u00E1pidas" }), _jsx(DropdownMenuSeparator, {}), createActions.map((action) => (_jsxs(DropdownMenuItem, { onClick: action.action, className: 'cursor-pointer flex items-center', children: [action.icon, _jsx("span", { children: action.label }), _jsx(DropdownMenuShortcut, { children: action.shortcut })] }, action.label)))] })] }), _jsx(NotificacionesDropdown, {}), _jsx("div", { className: 'ml-4', children: _jsx(UserMenu, {}) })] })] }));
}
