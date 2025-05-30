import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { PlusCircle, Archive, Warehouse, MapPin, Tag, Truck, } from 'lucide-react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
// Iconos
import { TipoInventario } from 'shared-types';
import { useAlmacenState } from '@/context/global/useAlmacenState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NewInventoryForm } from './components/NewInventoryForm';
import { NoInventoriesWarning } from './components/NoInventoriesWarning';
export default function InventoriosLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { inventarios: inventariosDelContexto, subscribeToInventarios, subscribeToProveedores, } = useAlmacenState();
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Determine active tab based on current path
    const getActiveTab = () => {
        const path = location.pathname;
        if (path.includes('/ubicaciones'))
            return 'ubicaciones';
        if (path.includes('/marcas'))
            return 'marcas';
        if (path.includes('/proveedores'))
            return 'proveedores';
        return 'inventarios';
    };
    const activeTab = getActiveTab();
    // Usamos directamente los inventarios del contexto. Aseguramos el tipo.
    const inventariosParaMostrar = (inventariosDelContexto ||
        []);
    useEffect(() => {
        const unsubscribe = subscribeToInventarios();
        const unsubscribeProveedores = subscribeToProveedores();
        return () => {
            unsubscribe();
            unsubscribeProveedores();
        };
    }, [subscribeToInventarios, subscribeToProveedores]);
    const getIconForType = (tipo) => {
        switch (tipo) {
            case TipoInventario.LOCAL:
                return _jsx(Warehouse, { className: 'w-5 h-5 mr-2' });
            case TipoInventario.BRIGADA:
                return _jsx(Archive, { className: 'w-5 h-5 mr-2' });
            default:
                return _jsx(Archive, { className: 'w-5 h-5 mr-2' });
        }
    };
    const getTypeName = (tipo) => {
        switch (tipo) {
            case TipoInventario.LOCAL:
                return 'Local';
            case TipoInventario.BRIGADA:
                return 'Brigada';
            default:
                return 'Otro';
        }
    };
    // Check if we're at the main inventarios page (exactly)
    const isMainInventarioPage = location.pathname === '/almacen/inventarios';
    // Render inventory list only on the main page
    const renderInventoryList = () => {
        if (inventariosParaMostrar.length > 0) {
            return (_jsx("div", { className: 'grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', children: inventariosParaMostrar.map((inventario) => (_jsxs(Card, { className: 'flex flex-col', children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: 'flex items-center justify-between', children: [_jsx(CardTitle, { className: 'text-lg', children: inventario.nombre }), _jsxs("span", { className: 'text-xs px-2 py-1 rounded-full bg-primary/10 text-primary flex items-center', children: [getIconForType(inventario.tipo), getTypeName(inventario.tipo)] })] }), inventario.descripcion && (_jsx(CardDescription, { className: 'text-sm pt-1', children: inventario.descripcion }))] }), _jsx(CardContent, { className: 'flex-grow', children: _jsx("p", { className: 'text-sm text-muted-foreground', children: "Haz clic en \"Gestionar\" para ver los detalles y art\u00EDculos." }) }), _jsx(CardFooter, { children: _jsx(Button, { variant: 'outline', className: 'w-full', onClick: () => {
                                    navigate(`/almacen/inventarios/${inventario.id}`);
                                }, children: "Gestionar Inventario" }) })] }, inventario.id))) }));
        }
        else {
            return _jsx(NoInventoriesWarning, { onCreateClick: () => setIsModalOpen(true) });
        }
    };
    // Determine content to render based on the current path
    const renderContent = () => {
        // Only render inventory list on exact match for main inventory page
        if (isMainInventarioPage) {
            return renderInventoryList();
        }
        // For sub-routes (ubicaciones, marcas, proveedores), render the child route component
        return _jsx(Outlet, {});
    };
    // Get the title based on active tab
    const getTitle = () => {
        if (activeTab === 'ubicaciones')
            return null;
        if (activeTab === 'marcas')
            return null;
        if (activeTab === 'proveedores')
            return null;
        return (_jsxs(_Fragment, { children: [_jsx("h1", { className: 'text-2xl md:text-3xl font-bold tracking-tight', children: "Gesti\u00F3n de Inventarios" }), _jsx("p", { className: 'text-muted-foreground', children: "Administra inventarios, ubicaciones, marcas y proveedores." })] }));
    };
    return (_jsxs("div", { className: 'p-4 md:p-6 lg:p-8 space-y-6', children: [_jsx(Tabs, { value: activeTab, defaultValue: activeTab, className: 'w-full', onValueChange: (value) => {
                    switch (value) {
                        case 'inventarios':
                            navigate('/almacen/inventarios');
                            break;
                        case 'ubicaciones':
                            navigate('/almacen/inventarios/ubicaciones');
                            break;
                        case 'marcas':
                            navigate('/almacen/inventarios/marcas');
                            break;
                        case 'proveedores':
                            navigate('/almacen/inventarios/proveedores');
                            break;
                    }
                }, children: _jsxs(TabsList, { className: 'grid w-full grid-cols-4', children: [_jsxs(TabsTrigger, { value: 'inventarios', className: 'flex items-center', children: [_jsx(Warehouse, { className: 'w-4 h-4 mr-2' }), " Inventarios"] }), _jsxs(TabsTrigger, { value: 'ubicaciones', className: 'flex items-center', children: [_jsx(MapPin, { className: 'w-4 h-4 mr-2' }), " Ubicaciones"] }), _jsxs(TabsTrigger, { value: 'marcas', className: 'flex items-center', children: [_jsx(Tag, { className: 'w-4 h-4 mr-2' }), " Marcas"] }), _jsxs(TabsTrigger, { value: 'proveedores', className: 'flex items-center', children: [_jsx(Truck, { className: 'w-4 h-4 mr-2' }), " Proveedores"] })] }) }), getTitle() && (_jsxs("div", { className: 'flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4', children: [_jsx("div", { children: getTitle() }), isMainInventarioPage && inventariosParaMostrar.length > 0 && (_jsxs(Button, { onClick: () => setIsModalOpen(true), className: 'w-full sm:w-auto', children: [_jsx(PlusCircle, { className: 'mr-2 h-4 w-4' }), " Crear Nuevo Inventario"] }))] })), _jsx(Dialog, { open: isModalOpen, onOpenChange: setIsModalOpen, children: _jsx(DialogContent, { className: 'sm:max-w-[480px]', children: _jsx(NewInventoryForm, { onClose: () => setIsModalOpen(false), onSuccess: () => { } }) }) }), _jsx("div", { className: 'mt-6', children: renderContent() })] }));
}
