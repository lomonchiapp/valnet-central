import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Loader2, PlusCircle, FileText, ExternalLink, List, LayoutGrid, MapPin, Navigation, } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePreRegistro } from '@/api/hooks/usePreRegistro';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger, } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import ImageModal from './components/ImageModal';
export default function MisVentas() {
    const navigate = useNavigate();
    const { misPreRegistros, loading, error: apiError } = usePreRegistro();
    const [preRegistros, setPreRegistros] = useState([]);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState(null);
    const [view, setView] = useState('list');
    const [selectedImage, setSelectedImage] = useState(null);
    // Usar un efecto con dependencia vacía para cargar solo una vez
    useEffect(() => {
        let isMounted = true;
        const cargarPreRegistros = async () => {
            try {
                const data = await misPreRegistros();
                if (isMounted) {
                    setPreRegistros(data);
                }
            }
            catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err : new Error('Error desconocido'));
                }
            }
            finally {
                if (isMounted) {
                    setFetching(false);
                }
            }
        };
        cargarPreRegistros();
        // Limpiar efecto
        return () => {
            isMounted = false;
        };
    }, [misPreRegistros]); // Sin dependencia en misPreRegistros
    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'pendiente':
                return (_jsx(Badge, { variant: 'outline', className: 'bg-yellow-50 text-yellow-700 border-yellow-300', children: "Pendiente" }));
            case 'aprobado':
                return (_jsx(Badge, { variant: 'outline', className: 'bg-green-50 text-green-700 border-green-300', children: "Aprobado" }));
            case 'rechazado':
                return (_jsx(Badge, { variant: 'outline', className: 'bg-red-50 text-red-700 border-red-300', children: "Rechazado" }));
            case 'instalado':
                return (_jsx(Badge, { variant: 'outline', className: 'bg-blue-50 text-blue-700 border-blue-300', children: "Instalado" }));
            default:
                return _jsx(Badge, { variant: 'outline', children: "Desconocido" });
        }
    };
    const formatDate = (dateValue) => {
        if (!dateValue)
            return 'N/A';
        try {
            // Si es un objeto de Firestore Timestamp
            if (dateValue && typeof dateValue === 'object' && 'toDate' in dateValue) {
                return new Intl.DateTimeFormat('es-DO', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                }).format(dateValue.toDate());
            }
            // Si es un string ISO
            if (typeof dateValue === 'string') {
                return new Intl.DateTimeFormat('es-DO', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                }).format(new Date(dateValue));
            }
            // Si es un objeto Date directamente
            if (dateValue instanceof Date) {
                return new Intl.DateTimeFormat('es-DO', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                }).format(dateValue);
            }
            return 'N/A';
        }
        catch {
            // Error silencioso
            return 'N/A';
        }
    };
    if (fetching || loading) {
        return (_jsx("div", { className: 'flex justify-center items-center h-60', children: _jsx(Loader2, { className: 'h-8 w-8 animate-spin text-primary' }) }));
    }
    if (error || apiError) {
        return (_jsx("div", { className: 'text-center p-6 text-destructive', children: _jsx("p", { children: "Error al cargar los pre-registros. Por favor, intenta de nuevo." }) }));
    }
    if (preRegistros.length === 0) {
        return (_jsxs("div", { className: 'text-center p-10', children: [_jsx("h3", { className: 'text-lg font-semibold mb-2', children: "No has creado pre-registros" }), _jsx("p", { className: 'text-muted-foreground mb-6', children: "Comienza a registrar tus ventas para hacer seguimiento" }), _jsxs(Button, { onClick: () => navigate('/ventas/pre-registros/nuevo'), children: [_jsx(PlusCircle, { className: 'mr-2 h-4 w-4' }), "Crear Pre-Registro"] })] }));
    }
    return (_jsxs("div", { children: [_jsxs("div", { className: 'flex justify-end mb-4 gap-2', children: [_jsx(Button, { variant: view === 'list' ? 'default' : 'outline', onClick: () => setView('list'), size: 'icon', title: 'Vista de lista', children: _jsx(List, { className: 'h-5 w-5' }) }), _jsx(Button, { variant: view === 'thumbnails' ? 'default' : 'outline', onClick: () => setView('thumbnails'), size: 'icon', title: 'Vista de thumbnails', children: _jsx(LayoutGrid, { className: 'h-5 w-5' }) })] }), view === 'list' ? (_jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Cliente" }), _jsx(TableHead, { children: "C\u00E9dula" }), _jsx(TableHead, { children: "Fecha Creaci\u00F3n" }), _jsx(TableHead, { children: "Fecha Instalaci\u00F3n" }), _jsx(TableHead, { children: "Estado" }), _jsx(TableHead, { children: "Fotos Contrato" }), _jsx(TableHead, { children: "Ubicaci\u00F3n" }), _jsx(TableHead, { className: 'text-right', children: "Acciones" })] }) }), _jsx(TableBody, { children: preRegistros.map((preRegistro) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: 'font-medium', children: preRegistro.cliente }), _jsx(TableCell, { children: _jsxs(Popover, { children: [_jsx(PopoverTrigger, { asChild: true, children: _jsx(Button, { variant: 'link', className: 'p-0 h-auto min-w-0 text-blue-700 underline', children: preRegistro.cedula }) }), _jsx(PopoverContent, { className: 'w-auto max-w-xs', children: _jsx("div", { className: 'flex flex-col items-center gap-2', children: preRegistro.fotosCedula &&
                                                        preRegistro.fotosCedula.length > 0 ? (preRegistro.fotosCedula.map((url, idx) => (_jsx("img", { src: url, alt: `Cédula ${idx === 0 ? 'frontal' : 'trasera'}`, className: 'h-32 w-auto object-contain rounded border' }, idx)))) : (_jsx("span", { className: 'text-xs text-muted-foreground', children: "Sin im\u00E1genes de c\u00E9dula" })) }) })] }) }), _jsx(TableCell, { children: formatDate(preRegistro.createdAt) }), _jsx(TableCell, { children: formatDate(preRegistro.fecha_instalacion) }), _jsx(TableCell, { children: getEstadoBadge(preRegistro.estado || 'pendiente') }), _jsx(TableCell, { children: _jsxs("div", { className: 'flex gap-2 items-center', children: [preRegistro.fotoContrato?.map((url, idx) => (_jsx("img", { src: url, alt: `Contrato ${idx + 1}`, className: 'h-12 w-12 object-cover rounded cursor-pointer border', onClick: () => setSelectedImage(url) }, idx))), _jsx("input", { type: 'file', accept: 'image/*', multiple: true, style: { display: 'none' }, id: `upload-contrato-${preRegistro.id}`, onChange: async (e) => {
                                                    const files = e.target.files;
                                                    if (!files || files.length === 0)
                                                        return;
                                                    // Subir imágenes a storage y actualizar el preRegistro
                                                    // Aquí deberías implementar la lógica de subida y obtener las URLs
                                                    // Por ahora, solo simulo la actualización con un array vacío
                                                    // await updatePreRegistro(preRegistro.id, { fotoContrato: nuevasUrls });
                                                } }), _jsx("label", { htmlFor: `upload-contrato-${preRegistro.id}`, className: 'cursor-pointer px-2 py-1 bg-gray-100 rounded border text-xs hover:bg-gray-200', children: "+ Agregar" })] }) }), _jsx(TableCell, { children: preRegistro.ubicacion &&
                                        preRegistro.ubicacion.lat &&
                                        preRegistro.ubicacion.lng ? (_jsxs("div", { className: 'flex gap-2', children: [_jsx(Button, { variant: 'ghost', size: 'icon', asChild: true, title: 'Ver en Google Maps', children: _jsx("a", { href: `https://www.google.com/maps?q=${preRegistro.ubicacion.lat},${preRegistro.ubicacion.lng}`, target: '_blank', rel: 'noopener noreferrer', children: _jsx(MapPin, { className: 'h-5 w-5 text-blue-600' }) }) }), _jsx(Button, { variant: 'ghost', size: 'icon', asChild: true, title: 'C\u00F3mo llegar', children: _jsx("a", { href: `https://www.google.com/maps/dir/?api=1&destination=${preRegistro.ubicacion.lat},${preRegistro.ubicacion.lng}`, target: '_blank', rel: 'noopener noreferrer', children: _jsx(Navigation, { className: 'h-5 w-5 text-green-600' }) }) })] })) : (_jsx("span", { className: 'text-xs text-muted-foreground', children: "Sin ubicaci\u00F3n" })) }), _jsx(TableCell, { className: 'text-right', children: _jsxs("div", { className: 'flex justify-end space-x-2', children: [_jsx(Button, { variant: 'ghost', size: 'icon', onClick: () => navigate(`/ventas/pre-registros/${preRegistro.id}`), title: 'Ver detalles', children: _jsx(FileText, { className: 'h-4 w-4' }) }), _jsx(Button, { variant: 'ghost', size: 'icon', asChild: true, title: 'Ver en Mikrowisp', children: _jsx("a", { href: `https://panel.mikrowisp.net/clients/view/${preRegistro.cliente}`, target: '_blank', rel: 'noopener noreferrer', children: _jsx(ExternalLink, { className: 'h-4 w-4' }) }) })] }) })] }, preRegistro.id))) })] })) : (_jsx("div", { className: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6', children: preRegistros.map((preRegistro) => (_jsxs("div", { className: 'bg-white rounded shadow p-4 flex flex-col gap-2', children: [preRegistro.fotosCedula && preRegistro.fotosCedula[0] && (_jsx("img", { src: preRegistro.fotosCedula[0], alt: 'C\u00E9dula frontal', className: 'h-24 w-auto object-contain rounded border mb-2 mx-auto' })), _jsx("div", { className: 'font-semibold text-base mb-1', children: preRegistro.cliente }), _jsxs("div", { className: 'text-xs text-muted-foreground mb-1', children: ["C\u00E9dula: ", preRegistro.cedula] }), _jsxs("div", { className: 'text-xs mb-1', children: ["Estado: ", getEstadoBadge(preRegistro.estado || 'pendiente')] }), _jsx("div", { className: 'flex gap-2 mb-2', children: preRegistro.fotoContrato?.map((url, idx) => (_jsx("img", { src: url, alt: `Contrato ${idx + 1}`, className: 'h-16 w-16 object-cover rounded cursor-pointer border', onClick: () => setSelectedImage(url) }, idx))) }), _jsxs("div", { className: 'text-xs text-muted-foreground', children: ["Creado: ", formatDate(preRegistro.createdAt)] }), _jsxs("div", { className: 'flex justify-end space-x-2 mt-2', children: [_jsx(Button, { variant: 'ghost', size: 'icon', onClick: () => navigate(`/ventas/pre-registros/${preRegistro.id}`), title: 'Ver detalles', children: _jsx(FileText, { className: 'h-4 w-4' }) }), _jsx(Button, { variant: 'ghost', size: 'icon', asChild: true, title: 'Ver en Mikrowisp', children: _jsx("a", { href: `https://panel.mikrowisp.net/clients/view/${preRegistro.cliente}`, target: '_blank', rel: 'noopener noreferrer', children: _jsx(ExternalLink, { className: 'h-4 w-4' }) }) })] })] }, preRegistro.id))) })), _jsx(ImageModal, { imageUrl: selectedImage, onClose: () => setSelectedImage(null) }), _jsxs("div", { className: 'text-sm text-muted-foreground mt-4', children: ["Mostrando ", preRegistros.length, " pre-registros"] })] }));
}
