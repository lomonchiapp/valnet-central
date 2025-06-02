import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Edit, Trash2, Eye, Grid3X3, List, Filter, ArrowUpDown, Wifi, Package, Layers, ArrowUpRight, } from 'lucide-react';
import { Search } from 'lucide-react';
import { TipoArticulo } from 'shared-types';
import { useAlmacenState } from '@/context/global/useAlmacenState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from '@/components/ui/tooltip';
import { EditEquipoForm } from './EditEquipoForm';
import { SalidaArticuloForm } from './SalidaArticuloForm';
export function ArticulosTable({ articulos }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('todos');
    const [displayStyle, setDisplayStyle] = useState('tabla');
    const [sortField, setSortField] = useState('nombre');
    const [sortDirection, setSortDirection] = useState('asc');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [showSerialDetails, setShowSerialDetails] = useState(false);
    const [editingEquipo, setEditingEquipo] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);
    const [selectedArticulo, setSelectedArticulo] = useState(null);
    const [showSalidaForm, setShowSalidaForm] = useState(false);
    // Get marcas from global state
    const { marcas, subscribeToMarcas } = useAlmacenState();
    // Subscribe to marcas on component mount
    useEffect(() => {
        const unsubscribe = subscribeToMarcas();
        return () => unsubscribe();
    }, [subscribeToMarcas]);
    // Function to get brand name from brand ID
    const getBrandName = (brandId) => {
        const brand = marcas.find((m) => m.id === brandId);
        return brand ? brand.nombre : brandId;
    };
    // Cast to our extended type for UI purposes
    const articulosExtended = articulos;
    const equipos = articulosExtended.filter((articulo) => articulo.tipo === TipoArticulo.EQUIPO);
    const materiales = articulosExtended.filter((articulo) => articulo.tipo === TipoArticulo.MATERIAL);
    // Group equipos by name, model and brand
    const groupedEquipos = equipos.reduce((groups, equipo) => {
        const key = `${equipo.nombre}-${equipo.marca}-${equipo.modelo}`;
        const existingGroup = groups.find((group) => group.key === key);
        if (existingGroup) {
            existingGroup.equipos.push(equipo);
            existingGroup.totalCosto += equipo.costo;
        }
        else {
            groups.push({
                key,
                nombre: equipo.nombre,
                marca: equipo.marca || '',
                marcaNombre: getBrandName(equipo.marca || ''),
                modelo: equipo.modelo || '',
                equipos: [equipo],
                totalCosto: equipo.costo,
            });
        }
        return groups;
    }, []);
    const filteredArticulos = articulosExtended.filter((articulo) => articulo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        articulo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        articulo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        articulo.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        articulo.serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        articulo.codigoBarras?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        articulo.mac?.toLowerCase().includes(searchTerm.toLowerCase()));
    // Filter grouped equipos
    const filteredGroupedEquipos = groupedEquipos.filter((group) => group.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.equipos.some((equipo) => equipo.serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            equipo.mac?.toLowerCase().includes(searchTerm.toLowerCase())));
    const filteredEquipos = equipos.filter((articulo) => articulo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        articulo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        articulo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        articulo.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        articulo.serial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        articulo.mac?.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredMateriales = materiales.filter((articulo) => articulo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        articulo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        articulo.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        articulo.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        articulo.codigoBarras?.toLowerCase().includes(searchTerm.toLowerCase()));
    if (articulos.length === 0) {
        return (_jsx(Card, { children: _jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "No hay art\u00EDculos" }), _jsx(CardDescription, { children: "Este inventario a\u00FAn no tiene art\u00EDculos registrados." })] }) }));
    }
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
        }).format(value);
    };
    const getBadgeVariant = (tipo) => {
        switch (tipo) {
            case TipoArticulo.EQUIPO:
                return 'default';
            case TipoArticulo.MATERIAL:
                return 'outline';
            default:
                return 'secondary';
        }
    };
    const getArticulosToDisplay = () => {
        let articulos;
        switch (viewMode) {
            case 'equipos':
                // When in equipos view, we'll use the grouped view in table mode
                // but keep the original list for card view for now
                articulos = displayStyle === 'tabla' ? [] : filteredEquipos;
                break;
            case 'materiales':
                articulos = filteredMateriales;
                break;
            default:
                articulos = filteredArticulos;
                break;
        }
        // Apply sorting
        return [...articulos].sort((a, b) => {
            const fieldA = a[sortField];
            const fieldB = b[sortField];
            // Handle null or undefined values
            if (!fieldA && !fieldB)
                return 0;
            if (!fieldA)
                return sortDirection === 'asc' ? -1 : 1;
            if (!fieldB)
                return sortDirection === 'asc' ? 1 : -1;
            // Sort by data type
            if (typeof fieldA === 'string' && typeof fieldB === 'string') {
                return sortDirection === 'asc'
                    ? fieldA.localeCompare(fieldB)
                    : fieldB.localeCompare(fieldA);
            }
            // For numbers
            if (typeof fieldA === 'number' && typeof fieldB === 'number') {
                return sortDirection === 'asc' ? fieldA - fieldB : fieldB - fieldA;
            }
            return 0;
        });
    };
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        }
        else {
            setSortField(field);
            setSortDirection('asc');
        }
    };
    const renderSortIcon = (field) => {
        if (sortField !== field)
            return (_jsx(ArrowUpDown, { className: 'ml-1 h-3 w-3 text-muted-foreground opacity-50' }));
        return sortDirection === 'asc' ? (_jsx(ArrowUpDown, { className: 'ml-1 h-3 w-3 text-primary' })) : (_jsx(ArrowUpDown, { className: 'ml-1 h-3 w-3 text-primary rotate-180' }));
    };
    const renderEquipoCard = (articulo) => {
        const defaultImage = 'https://placehold.co/400x300?text=Sin+Imagen';
        const brandName = getBrandName(articulo.marca);
        return (_jsxs(Card, { className: 'overflow-hidden hover:shadow-md transition-all', children: [_jsxs("div", { className: 'aspect-video bg-muted relative overflow-hidden', children: [articulo.imagenUrl ? (_jsx("img", { src: articulo.imagenUrl, alt: articulo.nombre, className: 'object-cover w-full h-full', onError: (e) => {
                                ;
                                e.target.src = defaultImage;
                            } })) : (_jsx("div", { className: 'flex items-center justify-center h-full bg-muted', children: _jsx(Package, { className: 'h-12 w-12 text-muted-foreground opacity-50' }) })), _jsx(Badge, { className: 'absolute top-2 right-2', variant: articulo.serial ? 'default' : 'outline', children: articulo.serial ? 'S/N: ' + articulo.serial : 'Sin S/N' })] }), _jsxs(CardHeader, { className: 'p-4 pb-2', children: [_jsxs("div", { className: 'flex justify-between items-start', children: [_jsx(CardTitle, { className: 'text-base line-clamp-1', children: articulo.nombre }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: 'ghost', size: 'icon', className: 'h-8 w-8', children: _jsx(Eye, { className: 'h-4 w-4' }) }) }), _jsxs(DropdownMenuContent, { align: 'end', children: [_jsx(DropdownMenuLabel, { children: "Acciones" }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { children: [_jsx(Eye, { className: 'h-4 w-4 mr-2' }), "Ver detalles"] }), _jsxs(DropdownMenuItem, { children: [_jsx(Edit, { className: 'h-4 w-4 mr-2' }), "Editar"] }), _jsxs(DropdownMenuItem, { className: 'text-destructive', children: [_jsx(Trash2, { className: 'h-4 w-4 mr-2' }), "Eliminar"] })] })] })] }), _jsxs(CardDescription, { className: 'line-clamp-1', children: [brandName, " ", articulo.modelo] })] }), _jsx(CardContent, { className: 'p-4 pt-0 space-y-2', children: _jsxs("div", { className: 'grid grid-cols-2 gap-1 text-xs', children: [articulo.mac && (_jsxs("div", { className: 'flex items-center space-x-1', children: [_jsx(Wifi, { className: 'h-3 w-3 text-muted-foreground' }), _jsx("span", { className: 'font-mono', children: articulo.mac })] })), articulo.ubicacion && (_jsxs("div", { className: 'flex items-center space-x-1 col-span-2', children: [_jsx(Layers, { className: 'h-3 w-3 text-muted-foreground' }), _jsx("span", { className: 'truncate', children: articulo.ubicacion })] }))] }) }), _jsxs(CardFooter, { className: 'p-4 pt-0 flex justify-between text-sm', children: [_jsx("span", { className: 'text-muted-foreground', children: formatCurrency(articulo.costo) }), articulo.garantia && articulo.garantia > 0 && (_jsxs("span", { className: 'text-xs text-green-600', children: ["Garant\u00EDa: ", articulo.garantia, " meses"] }))] })] }, articulo.id));
    };
    const renderTable = (articulos) => {
        return (_jsx("div", { className: 'rounded-md border', children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsxs(TableHead, { className: 'cursor-pointer', onClick: () => handleSort('nombre'), children: ["Nombre ", renderSortIcon('nombre')] }), viewMode !== 'equipos' && _jsx(TableHead, { children: "Tipo" }), viewMode !== 'equipos' && (_jsxs(TableHead, { className: 'cursor-pointer', onClick: () => handleSort('cantidad'), children: ["Cantidad ", renderSortIcon('cantidad')] })), viewMode !== 'equipos' && _jsx(TableHead, { children: "Unidad" }), _jsxs(TableHead, { className: 'cursor-pointer', onClick: () => handleSort('marca'), children: ["Marca ", renderSortIcon('marca')] }), _jsxs(TableHead, { className: 'cursor-pointer', onClick: () => handleSort('modelo'), children: ["Modelo ", renderSortIcon('modelo')] }), viewMode !== 'materiales' && (_jsxs(TableHead, { className: 'cursor-pointer', onClick: () => handleSort('serial'), children: ["Serial ", renderSortIcon('serial')] })), viewMode === 'equipos' && _jsx(TableHead, { children: "MAC" }), _jsxs(TableHead, { className: 'cursor-pointer', onClick: () => handleSort('costo'), children: ["Costo ", renderSortIcon('costo')] }), _jsx(TableHead, { children: "Ubicaci\u00F3n" }), _jsx(TableHead, { className: 'text-right', children: "Acciones" })] }) }), _jsx(TableBody, { children: articulos.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: viewMode === 'todos' ? 10 : 9, className: 'h-24 text-center', children: "No se encontraron resultados." }) })) : (articulos.map((articulo) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: 'font-medium', children: _jsxs("div", { children: [_jsx("div", { children: articulo.nombre }), _jsx("div", { className: 'text-xs text-muted-foreground', children: articulo.descripcion }), articulo.codigoBarras && (_jsxs("div", { className: 'text-xs text-muted-foreground', children: ["C\u00F3digo: ", articulo.codigoBarras] }))] }) }), viewMode !== 'equipos' && (_jsx(TableCell, { children: _jsx(Badge, { variant: getBadgeVariant(articulo.tipo), children: articulo.tipo }) })), viewMode !== 'equipos' && (_jsx(TableCell, { children: articulo.cantidad })), viewMode !== 'equipos' && (_jsx(TableCell, { children: articulo.unidad })), _jsx(TableCell, { children: getBrandName(articulo.marca) }), _jsx(TableCell, { children: articulo.modelo }), viewMode !== 'materiales' && (_jsx(TableCell, { children: articulo.serial })), viewMode === 'equipos' && (_jsx(TableCell, { children: articulo.mac })), _jsx(TableCell, { children: formatCurrency(articulo.costo) }), _jsx(TableCell, { children: articulo.ubicacion }), _jsx(TableCell, { className: 'text-right', children: _jsxs("div", { className: 'flex justify-end space-x-1', children: [_jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { variant: 'ghost', size: 'icon', onClick: () => handleOpenSalidaForm(articulo), children: _jsx(ArrowUpRight, { className: 'h-4 w-4' }) }) }), _jsx(TooltipContent, { children: _jsx("p", { children: "Salida / Transferencia" }) })] }) }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: 'ghost', size: 'icon', children: _jsx(Eye, { className: 'h-4 w-4' }) }) }), _jsxs(DropdownMenuContent, { align: 'end', children: [_jsx(DropdownMenuLabel, { children: "Acciones" }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { children: [_jsx(Eye, { className: 'h-4 w-4 mr-2' }), "Ver detalles"] }), _jsxs(DropdownMenuItem, { children: [_jsx(Edit, { className: 'h-4 w-4 mr-2' }), "Editar"] }), _jsxs(DropdownMenuItem, { className: 'text-destructive', children: [_jsx(Trash2, { className: 'h-4 w-4 mr-2' }), "Eliminar"] })] })] })] }) })] }, articulo.id)))) })] }) }));
    };
    const renderCards = (articulos) => {
        return (_jsx("div", { className: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4', children: articulos.length === 0 ? (_jsx("div", { className: 'col-span-full text-center py-10 text-muted-foreground', children: "No se encontraron resultados." })) : (articulos.map(renderEquipoCard)) }));
    };
    // Handler to open the serial details dialog
    const handleViewSerials = (group) => {
        setSelectedGroup(group);
        setShowSerialDetails(true);
    };
    // Handler to close the serial details dialog
    const handleCloseSerialDetails = () => {
        setShowSerialDetails(false);
        setSelectedGroup(null);
        setEditingEquipo(null);
    };
    // Handler to edit a specific equipment
    const handleEditEquipo = (equipo) => {
        setEditingEquipo(equipo);
        setShowEditForm(true);
    };
    const handleEquipoUpdated = () => {
        // Close the edit form
        setShowEditForm(false);
        setEditingEquipo(null);
        // Close the serial details dialog if it's open
        if (showSerialDetails) {
            setShowSerialDetails(false);
            setSelectedGroup(null);
        }
    };
    // Handler to open the salida form
    const handleOpenSalidaForm = (articulo) => {
        setSelectedArticulo(articulo);
        setShowSalidaForm(true);
    };
    // Render the table with grouped equipment
    const renderGroupedEquiposTable = () => {
        return (_jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsxs(TableHead, { className: 'w-[200px] cursor-pointer', onClick: () => handleSort('nombre'), children: ["Nombre ", renderSortIcon('nombre')] }), _jsxs(TableHead, { className: 'cursor-pointer', onClick: () => handleSort('marca'), children: ["Marca ", renderSortIcon('marca')] }), _jsxs(TableHead, { className: 'cursor-pointer', onClick: () => handleSort('modelo'), children: ["Modelo ", renderSortIcon('modelo')] }), _jsx(TableHead, { className: 'text-center', children: "Cantidad" }), _jsx(TableHead, { className: 'text-center', children: "Series" }), _jsx(TableHead, { className: 'text-right', children: "Costo Total" }), _jsx(TableHead, { className: 'w-[100px] text-right', children: "Acciones" })] }) }), _jsx(TableBody, { children: filteredGroupedEquipos.map((group) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: 'font-medium', children: group.nombre }), _jsx(TableCell, { children: group.marcaNombre }), _jsx(TableCell, { children: group.modelo }), _jsx(TableCell, { className: 'text-center', children: group.equipos.length }), _jsx(TableCell, { className: 'text-center', children: _jsxs(Button, { variant: 'outline', size: 'sm', onClick: () => handleViewSerials(group), children: ["Ver ", group.equipos.length, " series"] }) }), _jsx(TableCell, { className: 'text-right', children: formatCurrency(group.totalCosto) }), _jsx(TableCell, { className: 'text-right', children: _jsx("div", { className: 'flex justify-end space-x-1', children: _jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { variant: 'ghost', size: 'icon', onClick: () => handleViewSerials(group), children: _jsx(Eye, { className: 'h-4 w-4' }) }) }), _jsx(TooltipContent, { children: _jsx("p", { children: "Ver detalles" }) })] }) }) }) })] }, group.key))) })] }));
    };
    // Render the serial details dialog
    const renderSerialDetailsDialog = () => {
        if (!selectedGroup)
            return null;
        return (_jsx(Dialog, { open: showSerialDetails, onOpenChange: handleCloseSerialDetails, children: _jsxs(DialogContent, { className: 'max-w-3xl max-h-[80vh] overflow-y-auto', children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { className: 'text-xl', children: [selectedGroup.nombre, " - ", selectedGroup.marcaNombre, ' ', selectedGroup.modelo] }) }), _jsxs("div", { className: 'grid grid-cols-2 gap-2 mb-4', children: [_jsxs("div", { children: [_jsx("p", { className: 'text-sm font-medium text-muted-foreground', children: "Cantidad" }), _jsxs("p", { children: [selectedGroup.equipos.length, " unidades"] })] }), _jsxs("div", { children: [_jsx("p", { className: 'text-sm font-medium text-muted-foreground', children: "Costo Total" }), _jsx("p", { children: formatCurrency(selectedGroup.totalCosto) })] })] }), _jsx(Separator, { className: 'my-4' }), _jsx("h3", { className: 'text-lg font-medium mb-4', children: "N\u00FAmeros de Serie" }), _jsx("div", { className: 'space-y-4', children: selectedGroup.equipos.map((equipo) => (_jsx(Card, { className: 'p-4 hover:shadow-md transition-all', children: _jsxs("div", { className: 'flex justify-between items-start', children: [_jsxs("div", { className: 'space-y-2 flex-1', children: [_jsxs("div", { className: 'flex items-center space-x-2', children: [_jsxs(Badge, { variant: 'outline', className: 'font-mono', children: ["S/N: ", equipo.serial || 'No disponible'] }), equipo.mac && (_jsxs(Badge, { variant: 'secondary', className: 'font-mono', children: ["MAC: ", equipo.mac] }))] }), equipo.descripcion && (_jsxs("div", { children: [_jsx("p", { className: 'text-sm font-medium text-muted-foreground', children: "Descripci\u00F3n" }), _jsx("p", { className: 'text-sm', children: equipo.descripcion })] })), equipo.ubicacion && (_jsxs("div", { children: [_jsx("p", { className: 'text-sm font-medium text-muted-foreground', children: "Ubicaci\u00F3n" }), _jsx("p", { className: 'text-sm', children: equipo.ubicacion })] })), equipo.garantia && equipo.garantia > 0 && (_jsxs("div", { children: [_jsx("p", { className: 'text-sm font-medium text-muted-foreground', children: "Garant\u00EDa" }), _jsxs("p", { className: 'text-sm', children: [equipo.garantia, " meses"] })] })), _jsxs("div", { children: [_jsx("p", { className: 'text-sm font-medium text-muted-foreground', children: "Costo" }), _jsx("p", { className: 'text-sm', children: formatCurrency(equipo.costo) })] })] }), _jsx("div", { className: 'flex space-x-1', children: _jsx(Button, { variant: 'outline', size: 'icon', onClick: () => handleEditEquipo(equipo), children: _jsx(Edit, { className: 'h-4 w-4' }) }) })] }) }, equipo.id))) })] }) }));
    };
    return (_jsxs("div", { className: 'space-y-4', children: [_jsxs("div", { className: 'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', children: [_jsxs("div", { className: 'relative w-full max-w-sm', children: [_jsx(Search, { className: 'absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' }), _jsx(Input, { placeholder: 'Buscar art\u00EDculos...', className: 'pl-8', value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) })] }), _jsxs("div", { className: 'flex items-center space-x-2', children: [_jsx(Tabs, { value: viewMode, onValueChange: (value) => setViewMode(value), className: 'w-[400px]', children: _jsxs(TabsList, { className: 'grid w-full grid-cols-3', children: [_jsx(TabsTrigger, { value: 'todos', children: "Todos" }), _jsx(TabsTrigger, { value: 'equipos', children: "Equipos" }), _jsx(TabsTrigger, { value: 'materiales', children: "Materiales" })] }) }), _jsx(Button, { variant: 'outline', size: 'icon', onClick: () => setDisplayStyle(displayStyle === 'tabla' ? 'tarjetas' : 'tabla'), children: displayStyle === 'tabla' ? (_jsx(Grid3X3, { className: 'h-4 w-4' })) : (_jsx(List, { className: 'h-4 w-4' })) }), _jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: 'outline', size: 'icon', children: _jsx(Filter, { className: 'h-4 w-4' }) }) }), _jsxs(DropdownMenuContent, { align: 'end', children: [_jsx(DropdownMenuLabel, { children: "Ordenar por" }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: () => handleSort('nombre'), children: ["Nombre", ' ', sortField === 'nombre' &&
                                                        (sortDirection === 'asc' ? '↑' : '↓')] }), _jsxs(DropdownMenuItem, { onClick: () => handleSort('marca'), children: ["Marca", ' ', sortField === 'marca' && (sortDirection === 'asc' ? '↑' : '↓')] }), _jsxs(DropdownMenuItem, { onClick: () => handleSort('modelo'), children: ["Modelo", ' ', sortField === 'modelo' &&
                                                        (sortDirection === 'asc' ? '↑' : '↓')] }), _jsxs(DropdownMenuItem, { onClick: () => handleSort('costo'), children: ["Costo", ' ', sortField === 'costo' && (sortDirection === 'asc' ? '↑' : '↓')] })] })] })] })] }), _jsx("div", { className: 'rounded-md border', children: _jsx(ScrollArea, { className: 'h-[600px]', children: viewMode === 'equipos' && displayStyle === 'tabla'
                        ? renderGroupedEquiposTable()
                        : displayStyle === 'tabla'
                            ? renderTable(getArticulosToDisplay())
                            : renderCards(getArticulosToDisplay()) }) }), renderSerialDetailsDialog(), _jsx(EditEquipoForm, { equipo: editingEquipo, open: showEditForm, onOpenChange: setShowEditForm, onEquipoUpdated: handleEquipoUpdated }), selectedArticulo && (_jsx(SalidaArticuloForm, { articulo: selectedArticulo, inventarioId: selectedArticulo.idinventario, open: showSalidaForm, onOpenChange: setShowSalidaForm, onSalidaCompletada: () => {
                    setSelectedArticulo(null);
                    // You might want to refresh the data here
                }, usuarioId: 'current-user-id' // Replace with actual user ID from auth context
             }))] }));
}
