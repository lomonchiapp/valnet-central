import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { database } from '@/firebase';
import { TipoArticulo, Unidad } from '@/types';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Upload, X, Cpu, Box, ChevronsUpDown, Check, PlusCircle, Search, } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAlmacenState } from '@/context/global/useAlmacenState';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from '@/components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger, } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from '@/components/ui/tooltip';
import { NuevaMarcaForm } from '@/features/almacen/marcas/components/NuevaMarcaForm';
import { useAgregarArticulo, } from '../hooks/useAgregarArticulo';
import { NuevaUbicacionForm } from './NuevaUbicacionForm';
const STEPS = {
    SELECCION_TIPO: 1,
    DETALLES_MATERIAL: 2,
    DETALLES_EQUIPO_MARCA_MODELO: 3,
    DETALLES_EQUIPO_ESPECIFICOS: 4,
    DETALLES_EQUIPOS_MULTIPLES: 5,
};
export function NuevoArticuloForm({ open, onOpenChange, inventarioId, }) {
    const { agregarArticulo, isLoading, error: agregarError, } = useAgregarArticulo(inventarioId);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [articuloExistenteDetectado, setArticuloExistenteDetectado] = useState(null);
    const [isCheckingArticulo, setIsCheckingArticulo] = useState(false);
    const [currentStep, setCurrentStep] = useState(STEPS.SELECCION_TIPO);
    const [showNuevaMarcaForm, setShowNuevaMarcaForm] = useState(false);
    const [showNuevaUbicacionForm, setShowNuevaUbicacionForm] = useState(false);
    const [openMarcaCombobox, setOpenMarcaCombobox] = useState(false);
    const [searchValueMarca, setSearchValueMarca] = useState('');
    const [filtroTablaArticulos, setFiltroTablaArticulos] = useState('');
    const [selectedArticuloBaseId, setSelectedArticuloBaseId] = useState(null);
    const [mostrandoFormNuevoArticuloBase, setMostrandoFormNuevoArticuloBase] = useState(false);
    const [openMaterialNombreCombobox, setOpenMaterialNombreCombobox] = useState(false);
    const [searchValueMaterialNombre, setSearchValueMaterialNombre] = useState('');
    const [multipleSNList, setMultipleSNList] = useState('');
    const [isMultipleMode, setIsMultipleMode] = useState(false);
    const [openUbicacionCombobox, setOpenUbicacionCombobox] = useState(false);
    const [searchValueUbicacion, setSearchValueUbicacion] = useState('');
    const { marcas, articulos, ubicaciones, subscribeToMarcas, subscribeToArticulos, subscribeToUbicaciones, } = useAlmacenState();
    useEffect(() => {
        const unsubMarcas = subscribeToMarcas();
        const unsubArticulos = subscribeToArticulos();
        const unsubUbicaciones = subscribeToUbicaciones();
        return () => {
            unsubMarcas();
            unsubArticulos();
            unsubUbicaciones();
        };
    }, [subscribeToMarcas, subscribeToArticulos, subscribeToUbicaciones]);
    const { control, register, handleSubmit, formState: { errors, isValid, touchedFields }, reset, watch, setValue, trigger, getValues, } = useForm({
        defaultValues: {
            nombre: '',
            descripcion: '',
            tipo: undefined,
            cantidad: 1,
            costo: 0,
            unidad: Unidad.UNIDAD,
            marca: '',
            modelo: '',
            serial: '',
            ubicacion: '',
            imagenUrl: '',
            codigoBarras: '',
            mac: '',
            wirelessKey: '',
            garantia: 0,
        },
        mode: 'onChange',
    });
    const tipoSeleccionado = watch('tipo');
    const nombreArticuloWatch = watch('nombre');
    const marcaSeleccionadaWatch = watch('marca');
    const marcaSeleccionadaId = getValues('marca');
    const resetFormAndState = useCallback(() => {
        reset({
            nombre: '',
            descripcion: '',
            tipo: undefined,
            cantidad: 1,
            costo: 0,
            unidad: Unidad.UNIDAD,
            marca: '',
            modelo: '',
            serial: '',
            ubicacion: '',
            imagenUrl: '',
            codigoBarras: '',
            mac: '',
            wirelessKey: '',
            garantia: 0,
        });
        setSelectedImage(null);
        setImagePreview(null);
        setArticuloExistenteDetectado(null);
        setIsCheckingArticulo(false);
        setFiltroTablaArticulos('');
        setMultipleSNList('');
        setIsMultipleMode(false);
        setOpenUbicacionCombobox(false);
        setSearchValueUbicacion('');
    }, [reset]);
    const handleCloseDialog = () => {
        resetFormAndState();
        setCurrentStep(STEPS.SELECCION_TIPO);
        onOpenChange(false);
    };
    useEffect(() => {
        if (!open) {
            resetFormAndState();
            setCurrentStep(STEPS.SELECCION_TIPO);
            onOpenChange(false);
        }
    }, [open, resetFormAndState, setCurrentStep, onOpenChange]);
    useEffect(() => {
        if (currentStep !== STEPS.DETALLES_EQUIPO_MARCA_MODELO) {
            setMostrandoFormNuevoArticuloBase(false);
        }
    }, [currentStep, marcaSeleccionadaWatch]);
    const verificarArticuloExistenteDebounced = useCallback(() => {
        let timer;
        return async (nombre) => {
            clearTimeout(timer);
            timer = setTimeout(async () => {
                const currentTipo = getValues('tipo');
                if (!nombre ||
                    nombre.trim().length < 3 ||
                    currentTipo !== TipoArticulo.MATERIAL) {
                    setArticuloExistenteDetectado(null);
                    setIsCheckingArticulo(false);
                    return;
                }
                setIsCheckingArticulo(true);
                setArticuloExistenteDetectado(null);
                try {
                    const articulosRef = collection(database, 'articulos');
                    const q = query(articulosRef, where('idinventario', '==', inventarioId), where('nombre', '==', nombre.trim()), where('tipo', '==', TipoArticulo.MATERIAL), limit(1));
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const docData = querySnapshot.docs[0].data();
                        setArticuloExistenteDetectado({
                            id: querySnapshot.docs[0].id,
                            nombre: docData.nombre,
                            cantidad: docData.cantidad,
                            costo: docData.costo,
                            unidad: docData.unidad,
                        });
                    }
                    else {
                        setArticuloExistenteDetectado(null);
                    }
                }
                catch {
                    setArticuloExistenteDetectado(null);
                }
                finally {
                    setIsCheckingArticulo(false);
                }
            }, 500);
        };
    }, [getValues, inventarioId]);
    useEffect(() => {
        const currentValues = getValues();
        const currentTipo = currentValues.tipo;
        const nombreMaterial = currentValues.nombre;
        if (currentTipo === TipoArticulo.MATERIAL && nombreMaterial) {
            verificarArticuloExistenteDebounced()(nombreMaterial);
        }
        else {
            setArticuloExistenteDetectado(null);
            setIsCheckingArticulo(false);
        }
    }, [
        nombreArticuloWatch,
        tipoSeleccionado,
        getValues,
        verificarArticuloExistenteDebounced,
    ]);
    useEffect(() => {
        const currentTipo = getValues('tipo');
        if (currentTipo === TipoArticulo.EQUIPO) {
            setValue('cantidad', 1);
            setValue('unidad', Unidad.UNIDAD);
        }
        else if (currentTipo === TipoArticulo.MATERIAL) {
            setValue('serial', '');
            setValue('mac', '');
            setValue('wirelessKey', '');
            setValue('garantia', 0);
        }
    }, [tipoSeleccionado, setValue, getValues]);
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setValue('imagenUrl', file.name);
        }
    };
    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setValue('imagenUrl', '');
        const fileInput = document.getElementById('imagenFile');
        if (fileInput) {
            fileInput.value = '';
        }
    };
    const generateMacFromSerial = (serial) => {
        if (serial.length < 12) {
            return '00:00:00:00:00:00';
        }
        const cleanSerial = serial.replace(/[^0-9A-Fa-f]/g, '');
        const last12 = cleanSerial.slice(-12).padStart(12, '0');
        return last12.match(/.{2}/g)?.join(':') || '00:00:00:00:00:00';
    };
    const generateMacWithPrefix = (prefix, serial) => {
        const cleanPrefix = prefix
            .replace(/[^0-9A-Fa-f:]/g, '')
            .replace(/:{2,}/g, ':');
        const prefixParts = cleanPrefix.split(':').filter((p) => p.length > 0);
        if (prefixParts.length === 0) {
            return generateMacFromSerial(serial);
        }
        const cleanSerial = serial.replace(/[^0-9A-Fa-f]/g, '');
        const remainingParts = 6 - prefixParts.length;
        if (remainingParts <= 0) {
            return prefixParts.slice(0, 6).join(':');
        }
        const serialParts = [];
        for (let i = 0; i < remainingParts; i++) {
            const start = i * 2;
            const part = cleanSerial.substring(start, start + 2).padStart(2, '0');
            serialParts.push(part || '00');
        }
        return [...prefixParts, ...serialParts].slice(0, 6).join(':');
    };
    const onSubmitHandler = async (data) => {
        try {
            if (isMultipleMode && currentStep === STEPS.DETALLES_EQUIPOS_MULTIPLES) {
                const seriales = parseMultipleSNList(multipleSNList);
                if (seriales.length === 0) {
                    toast.error('No se pudo procesar ningún número de serie válido.');
                    return;
                }
                const prefixMacElement = document.getElementById('prefixMac');
                const prefixMac = prefixMacElement?.value || '';
                toast.info(`Registrando ${seriales.length} equipos...`);
                let contadorExito = 0;
                for (const serial of seriales) {
                    const mac = prefixMac
                        ? generateMacWithPrefix(prefixMac, serial)
                        : generateMacFromSerial(serial);
                    const equipoData = {
                        ...data,
                        serial: serial,
                        mac: mac,
                        cantidad: 1,
                        unidad: Unidad.UNIDAD,
                    };
                    try {
                        const nuevoArticuloId = await agregarArticulo({
                            ...equipoData,
                            imagen: selectedImage,
                        });
                        if (nuevoArticuloId) {
                            contadorExito++;
                        }
                    }
                    catch {
                        // Capturamos el error pero no usamos console.log
                        // Podríamos agregar el error a un array de errores si quisiéramos mostrarlos después
                    }
                }
                if (contadorExito > 0) {
                    toast.success(`Se registraron ${contadorExito} de ${seriales.length} equipos exitosamente`);
                    handleCloseDialog();
                }
                else {
                    toast.error('No se pudo registrar ningún equipo');
                }
            }
            else {
                // Comportamiento normal para un solo artículo
                const formData = {
                    ...data,
                    imagen: selectedImage,
                };
                const nuevoArticuloId = await agregarArticulo(formData);
                if (nuevoArticuloId) {
                    toast.success(articuloExistenteDetectado && data.tipo === TipoArticulo.MATERIAL
                        ? 'Material actualizado exitosamente'
                        : 'Artículo agregado exitosamente');
                    handleCloseDialog();
                }
                else {
                    toast.error(`Error al agregar/actualizar el artículo: ${agregarError?.message || 'Error desconocido'}`);
                }
            }
        }
        catch {
            toast.error('Ocurrió un error al procesar el formulario');
        }
    };
    const nextStep = async () => {
        let fieldsToValidate = [];
        switch (currentStep) {
            case STEPS.SELECCION_TIPO:
                if (!tipoSeleccionado) {
                    toast.error('Por favor, seleccione un tipo de artículo.');
                    return;
                }
                if (tipoSeleccionado === TipoArticulo.MATERIAL) {
                    setCurrentStep(STEPS.DETALLES_MATERIAL);
                }
                else if (tipoSeleccionado === TipoArticulo.EQUIPO) {
                    setCurrentStep(STEPS.DETALLES_EQUIPO_MARCA_MODELO);
                }
                return;
            case STEPS.DETALLES_MATERIAL:
                fieldsToValidate = ['nombre', 'cantidad', 'costo', 'unidad'];
                if (articuloExistenteDetectado) {
                    fieldsToValidate = ['cantidad'];
                    setValue('nombre', articuloExistenteDetectado.nombre || getValues('nombre'));
                    setValue('costo', articuloExistenteDetectado.costo !== undefined
                        ? articuloExistenteDetectado.costo
                        : getValues('costo'));
                    setValue('unidad', articuloExistenteDetectado.unidad || getValues('unidad'));
                }
                break;
            case STEPS.DETALLES_EQUIPO_MARCA_MODELO:
                fieldsToValidate = ['marca', 'modelo', 'nombre'];
                break;
            case STEPS.DETALLES_EQUIPO_ESPECIFICOS:
                if (isMultipleMode) {
                    setCurrentStep(STEPS.DETALLES_EQUIPOS_MULTIPLES);
                    return;
                }
                fieldsToValidate = ['serial', 'mac'];
                break;
            case STEPS.DETALLES_EQUIPOS_MULTIPLES: {
                if (multipleSNList.trim() === '') {
                    toast.error('Por favor, ingrese al menos un número de serie.');
                    return;
                }
                const seriales = parseMultipleSNList(multipleSNList);
                if (seriales.length === 0) {
                    toast.error('No se pudo procesar ningún número de serie válido.');
                    return;
                }
                break;
            }
        }
        const isValidStep = await trigger(fieldsToValidate);
        if (isValidStep) {
            if (currentStep === STEPS.DETALLES_MATERIAL ||
                currentStep === STEPS.DETALLES_EQUIPO_ESPECIFICOS ||
                currentStep === STEPS.DETALLES_EQUIPOS_MULTIPLES) {
                handleSubmit(onSubmitHandler)();
            }
            else {
                if (currentStep === STEPS.DETALLES_EQUIPO_MARCA_MODELO) {
                    setCurrentStep(STEPS.DETALLES_EQUIPO_ESPECIFICOS);
                }
            }
        }
        else {
            toast.error('Por favor, complete todos los campos obligatorios del paso actual.');
        }
    };
    const prevStep = () => {
        setCurrentStep((prev) => {
            if (prev === STEPS.DETALLES_MATERIAL ||
                prev === STEPS.DETALLES_EQUIPO_MARCA_MODELO) {
                return STEPS.SELECCION_TIPO;
            }
            if (prev === STEPS.DETALLES_EQUIPO_ESPECIFICOS) {
                return STEPS.DETALLES_EQUIPO_MARCA_MODELO;
            }
            if (prev === STEPS.DETALLES_EQUIPOS_MULTIPLES) {
                return STEPS.DETALLES_EQUIPO_ESPECIFICOS;
            }
            return prev;
        });
    };
    const parseMultipleSNList = (text) => {
        return text
            .split(/[\n,]+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
    };
    const handleUbicacionCreada = (ubicacionId, ubicacionNombre) => {
        setValue('ubicacion', ubicacionId);
        toast.success(`Ubicación "${ubicacionNombre}" seleccionada`);
    };
    const renderStepContent = () => {
        const seriales = parseMultipleSNList(multipleSNList);
        const articulosDeMarcaFiltrados = marcaSeleccionadaId
            ? articulos
                .filter((a) => a.marca === marcaSeleccionadaId &&
                a.tipo === TipoArticulo.EQUIPO &&
                ((a.nombre &&
                    a.nombre
                        .toLowerCase()
                        .includes(filtroTablaArticulos.toLowerCase())) ||
                    (a.modelo &&
                        a.modelo
                            .toLowerCase()
                            .includes(filtroTablaArticulos.toLowerCase()))))
                .sort((a, b) => a.nombre.localeCompare(b.nombre))
            : [];
        switch (currentStep) {
            case STEPS.SELECCION_TIPO:
                return (_jsxs("div", { className: 'space-y-6', children: [_jsx(DialogDescription, { className: 'text-center text-lg', children: "Seleccione el tipo de articulo que desea agregar:" }), _jsxs("div", { className: 'grid grid-cols-1 md:grid-cols-2 gap-6', children: [_jsx(Card, { className: `cursor-pointer hover:shadow-xl transition-shadow ${tipoSeleccionado === TipoArticulo.EQUIPO ? 'ring-2 ring-primary shadow-xl' : 'hover:border-primary/70'}`, onClick: () => {
                                        setValue('tipo', TipoArticulo.EQUIPO, {
                                            shouldValidate: true,
                                            shouldTouch: true,
                                        });
                                        nextStep();
                                    }, children: _jsxs(CardHeader, { className: 'items-center', children: [_jsx(Cpu, { size: 48, className: 'mb-3 text-primary' }), _jsx(CardTitle, { children: "Equipo" }), _jsx(CardDescription, { className: 'text-center', children: "Art\u00EDculo \u00FAnico con n\u00FAmero de serie/MAC (ej: Router, ONT, Antena)." })] }) }), _jsx(Card, { className: `cursor-pointer hover:shadow-xl transition-shadow ${tipoSeleccionado === TipoArticulo.MATERIAL ? 'ring-2 ring-primary shadow-xl' : 'hover:border-primary/70'}`, onClick: () => {
                                        setValue('tipo', TipoArticulo.MATERIAL, {
                                            shouldValidate: true,
                                            shouldTouch: true,
                                        });
                                        nextStep();
                                    }, children: _jsxs(CardHeader, { className: 'items-center', children: [_jsx(Box, { size: 48, className: 'mb-3 text-primary' }), _jsx(CardTitle, { children: "Material" }), _jsx(CardDescription, { className: 'text-center', children: "Art\u00EDculo consumible o de stock (ej: Cable, Conectores, Cajas)." })] }) })] }), errors.tipo && (_jsx("p", { className: 'text-xs text-destructive mt-2 text-center', children: errors.tipo.message }))] }));
            case STEPS.DETALLES_MATERIAL:
                return (_jsxs("div", { className: 'space-y-6', children: [_jsxs("div", { className: 'grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5', children: [_jsxs("div", { className: 'space-y-1.5 md:col-span-2', children: [_jsxs(Label, { htmlFor: 'nombre', children: ["Nombre del Material", ' ', _jsx("span", { className: 'text-destructive', children: "*" })] }), _jsx(Controller, { name: 'nombre', control: control, rules: {
                                                required: 'El nombre es obligatorio.',
                                                minLength: { value: 3, message: 'Mínimo 3 caracteres.' },
                                            }, render: ({ field }) => (_jsxs("div", { className: 'relative', children: [_jsxs(Popover, { open: openMaterialNombreCombobox, onOpenChange: setOpenMaterialNombreCombobox, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: 'outline', role: 'combobox', "aria-expanded": openMaterialNombreCombobox, className: `w-full justify-between ${errors.nombre ? 'border-destructive' : ''} ${articuloExistenteDetectado ? 'bg-muted/60 cursor-not-allowed' : ''}`, disabled: !!articuloExistenteDetectado || isLoading, children: [field.value ||
                                                                            '-- Escriba o seleccione un material --', _jsx(ChevronsUpDown, { className: 'ml-2 h-4 w-4 shrink-0 opacity-50' })] }) }), _jsx(PopoverContent, { className: 'w-[--radix-popover-trigger-width] p-0', children: _jsxs(Command, { filter: (value, search) => {
                                                                        if (value === search)
                                                                            return 1;
                                                                        return value
                                                                            .toLowerCase()
                                                                            .includes(search.toLowerCase())
                                                                            ? 1
                                                                            : 0;
                                                                    }, children: [_jsx(CommandInput, { placeholder: 'Buscar o crear material...', value: searchValueMaterialNombre, onValueChange: (search) => {
                                                                                setSearchValueMaterialNombre(search);
                                                                                if (!openMaterialNombreCombobox &&
                                                                                    search.length > 0) {
                                                                                    setOpenMaterialNombreCombobox(true);
                                                                                }
                                                                                field.onChange(search);
                                                                            }, disabled: !!articuloExistenteDetectado || isLoading }), _jsxs(CommandList, { children: [_jsx(CommandEmpty, { children: searchValueMaterialNombre.trim() === ''
                                                                                        ? 'Escriba para buscar materiales existentes.'
                                                                                        : `No se encontró el material "${searchValueMaterialNombre}". Puede crearlo con este nombre.` }), _jsx(CommandGroup, { heading: articulos.filter((a) => a.idinventario === inventarioId &&
                                                                                        a.tipo === TipoArticulo.MATERIAL &&
                                                                                        a.nombre
                                                                                            .toLowerCase()
                                                                                            .includes(searchValueMaterialNombre.toLowerCase())).length > 0
                                                                                        ? 'Materiales Existentes'
                                                                                        : undefined, children: articulos
                                                                                        .filter((a) => a.idinventario === inventarioId &&
                                                                                        a.tipo === TipoArticulo.MATERIAL &&
                                                                                        a.nombre
                                                                                            .toLowerCase()
                                                                                            .includes(searchValueMaterialNombre.toLowerCase()))
                                                                                        .sort((a, b) => a.nombre.localeCompare(b.nombre))
                                                                                        .map((material) => {
                                                                                        if (!material ||
                                                                                            typeof material.id !== 'string' ||
                                                                                            material.id === '')
                                                                                            return null;
                                                                                        return (_jsxs(CommandItem, { value: material.nombre, onSelect: (currentValue) => {
                                                                                                field.onChange(currentValue);
                                                                                                setSearchValueMaterialNombre(currentValue);
                                                                                                verificarArticuloExistenteDebounced()(currentValue);
                                                                                                setOpenMaterialNombreCombobox(false);
                                                                                            }, children: [_jsx(Check, { className: cn('mr-2 h-4 w-4', field.value === material.nombre
                                                                                                        ? 'opacity-100'
                                                                                                        : 'opacity-0') }), material.nombre, material.descripcion && (_jsxs("span", { className: 'ml-2 text-xs text-muted-foreground', children: ["(", material.descripcion.substring(0, 30), material.descripcion.length > 30
                                                                                                            ? '...'
                                                                                                            : '', ")"] }))] }, material.id));
                                                                                    }) }), searchValueMaterialNombre.trim().length >= 3 &&
                                                                                    !articulos.some((a) => a.idinventario === inventarioId &&
                                                                                        a.tipo === TipoArticulo.MATERIAL &&
                                                                                        a.nombre.toLowerCase() ===
                                                                                            searchValueMaterialNombre
                                                                                                .toLowerCase()
                                                                                                .trim()) && (_jsxs(CommandItem, { value: searchValueMaterialNombre.trim(), onSelect: (currentValue) => {
                                                                                        field.onChange(currentValue);
                                                                                        setSearchValueMaterialNombre(currentValue);
                                                                                        setArticuloExistenteDetectado(null);
                                                                                        setIsCheckingArticulo(false);
                                                                                        setOpenMaterialNombreCombobox(false);
                                                                                        toast.info(`Creando nuevo material: "${currentValue}"`);
                                                                                    }, className: 'text-sm text-muted-foreground italic', children: [_jsx(PlusCircle, { className: 'mr-2 h-4 w-4' }), "Crear nuevo material: \"", searchValueMaterialNombre.trim(), "\""] }, 'crear-nuevo'))] })] }) })] }), articuloExistenteDetectado && (_jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { type: 'button', size: 'icon', variant: 'ghost', className: 'absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7 text-destructive border border-destructive bg-white hover:bg-destructive/10', onClick: () => {
                                                                            setArticuloExistenteDetectado(null);
                                                                            setIsCheckingArticulo(false);
                                                                            setValue('nombre', '', {
                                                                                shouldValidate: true,
                                                                                shouldTouch: true,
                                                                            });
                                                                            setSearchValueMaterialNombre('');
                                                                        }, tabIndex: 0, "aria-label": 'Limpiar selecci\u00F3n de material', children: _jsx(X, { className: 'h-4 w-4' }) }) }), _jsx(TooltipContent, { children: "Limpiar selecci\u00F3n de material" })] }) }))] })) }), errors.nombre && (_jsx("p", { className: 'text-xs text-destructive mt-1', children: errors.nombre.message })), isCheckingArticulo && (_jsx("p", { className: 'text-xs text-muted-foreground mt-1', children: "Buscando si el material ya existe..." })), articuloExistenteDetectado && (_jsxs("div", { className: 'mt-2 p-4 border-2 border-yellow-500 bg-yellow-100 rounded-md text-sm shadow flex items-start gap-3', children: [_jsx("span", { className: 'mt-1 text-yellow-600', children: _jsx("svg", { xmlns: 'http://www.w3.org/2000/svg', className: 'h-6 w-6', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', children: _jsx("path", { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z' }) }) }), _jsxs("div", { children: [_jsx("p", { className: 'font-semibold text-yellow-800 text-base mb-1', children: "\u00A1Atenci\u00F3n! Este material ya existe en el inventario." }), _jsxs("ul", { className: 'list-disc list-inside text-yellow-700 mt-1', children: [_jsxs("li", { children: [_jsx("b", { children: "ID:" }), " ", articuloExistenteDetectado.id] }), _jsxs("li", { children: [_jsx("b", { children: "Nombre:" }), " ", articuloExistenteDetectado.nombre] }), _jsxs("li", { children: [_jsx("b", { children: "Stock actual:" }), ' ', articuloExistenteDetectado.cantidad || 0, ' ', articuloExistenteDetectado.unidad || ''] }), _jsxs("li", { children: [_jsx("b", { children: "Costo unitario actual:" }), ' ', articuloExistenteDetectado.costo !== undefined
                                                                            ? articuloExistenteDetectado.costo
                                                                            : 'N/A'] })] }), _jsxs("p", { className: 'text-yellow-700 mt-2', children: ["Al guardar, se", ' ', _jsx("span", { className: 'font-bold', children: "sumar\u00E1 la cantidad" }), ' ', "que ingrese al stock existente y se", ' ', _jsx("span", { className: 'font-bold', children: "actualizar\u00E1n los dem\u00E1s datos" }), ' ', "(costo, descripci\u00F3n, etc.) con los nuevos valores del formulario."] })] })] }))] }), _jsxs("div", { className: 'w-full flex flex-col gap-2 md:flex-row md:gap-4', children: [_jsxs("div", { className: 'flex-1 flex flex-col', children: [_jsxs(Label, { htmlFor: 'cantidad', className: 'mb-1', children: ["Cantidad a", ' ', articuloExistenteDetectado ? 'Agregar' : 'Registrar', ' ', _jsx("span", { className: 'text-destructive', children: "*" })] }), _jsx(Input, { id: 'cantidad', type: 'number', min: articuloExistenteDetectado ? 0 : 1, max: 9999, step: '1', inputMode: 'numeric', className: `h-10 text-center ${errors.cantidad ? 'border-destructive' : ''}`, placeholder: '0', ...register('cantidad', {
                                                        required: 'La cantidad es obligatoria.',
                                                        valueAsNumber: true,
                                                        min: {
                                                            value: articuloExistenteDetectado ? 0 : 1,
                                                            message: articuloExistenteDetectado
                                                                ? 'No puede ser negativo.'
                                                                : 'Debe ser al menos 1.',
                                                        },
                                                    }) }), errors.cantidad && (_jsx("p", { className: 'text-xs text-destructive mt-1', children: errors.cantidad.message }))] }), _jsxs("div", { className: 'flex-1 flex flex-col', children: [_jsxs(Label, { htmlFor: 'unidad', className: 'mb-1', children: ["Unidad de Medida ", _jsx("span", { className: 'text-destructive', children: "*" })] }), _jsx(Controller, { control: control, name: 'unidad', rules: { required: 'La unidad es obligatoria.' }, render: ({ field }) => (_jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx("div", { children: _jsxs(Select, { onValueChange: field.onChange, value: field.value ||
                                                                                articuloExistenteDetectado?.unidad ||
                                                                                Unidad.UNIDAD, disabled: !!articuloExistenteDetectado, children: [_jsx(SelectTrigger, { id: 'unidad', className: `h-10 w-full ${errors.unidad ? 'border-destructive' : ''} ${articuloExistenteDetectado ? 'bg-muted/60 cursor-not-allowed' : ''}`, children: _jsx(SelectValue, { placeholder: '-- Seleccionar unidad --' }) }), _jsx(SelectContent, { children: Object.values(Unidad).map((u) => (_jsx(SelectItem, { value: u, children: u.charAt(0).toUpperCase() +
                                                                                            u.slice(1).toLowerCase() }, u))) })] }) }) }), !!articuloExistenteDetectado && (_jsx(TooltipContent, { children: "No se puede cambiar la unidad de medida de un material existente." }))] }) })) }), errors.unidad && (_jsx("p", { className: 'text-xs text-destructive mt-1', children: errors.unidad.message }))] }), _jsxs("div", { className: 'flex-1 flex flex-col', children: [_jsxs(Label, { htmlFor: 'costo', className: 'mb-1', children: ["Costo Unitario ", _jsx("span", { className: 'text-destructive', children: "*" })] }), _jsxs("div", { className: 'relative', children: [_jsx("span", { className: 'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium pointer-events-none', children: "RD$" }), _jsx(Input, { id: 'costo', type: 'number', min: '0', step: '0.01', inputMode: 'decimal', placeholder: '0.00', className: `pl-12 h-10 ${errors.costo ? 'border-destructive' : ''}`, ...register('costo', {
                                                                required: 'El costo es obligatorio.',
                                                                valueAsNumber: true,
                                                                min: { value: 0, message: 'No puede ser negativo.' },
                                                            }) })] }), errors.costo && (_jsx("p", { className: 'text-xs text-destructive mt-1', children: errors.costo.message }))] })] })] }), _jsxs("div", { className: 'space-y-5 pt-4 border-t mt-4', children: [_jsxs("div", { className: 'space-y-1.5', children: [_jsx(Label, { htmlFor: 'descripcion', children: "Descripci\u00F3n Adicional" }), _jsx(Textarea, { id: 'descripcion', placeholder: 'Cualquier detalle relevante: color, proveedor, notas especiales, etc.', ...register('descripcion'), rows: 3 })] }), _jsxs("div", { className: 'space-y-1.5', children: [_jsx(Label, { htmlFor: 'ubicacion', children: "Ubicaci\u00F3n en Almac\u00E9n" }), _jsxs("div", { className: 'flex gap-2', children: [_jsx(Controller, { name: 'ubicacion', control: control, render: ({ field }) => (_jsxs(Popover, { open: openUbicacionCombobox, onOpenChange: setOpenUbicacionCombobox, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: 'outline', role: 'combobox', "aria-expanded": openUbicacionCombobox, className: 'w-full justify-between', disabled: isLoading, children: [field.value
                                                                            ? ubicaciones.find((u) => u.id === field.value)
                                                                                ?.nombre || field.value
                                                                            : '-- Seleccionar ubicación --', _jsx(ChevronsUpDown, { className: 'ml-2 h-4 w-4 shrink-0 opacity-50' })] }) }), _jsx(PopoverContent, { className: 'w-[--radix-popover-trigger-width] p-0', children: _jsxs(Command, { children: [_jsx(CommandInput, { placeholder: 'Buscar ubicaci\u00F3n...', value: searchValueUbicacion, onValueChange: setSearchValueUbicacion }), _jsxs(CommandList, { children: [_jsx(CommandEmpty, { children: searchValueUbicacion === ''
                                                                                        ? 'Escriba para buscar o cree una nueva.'
                                                                                        : `No se encontró la ubicación "${searchValueUbicacion}".` }), _jsx(CommandGroup, { children: ubicaciones
                                                                                        .filter((u) => u.nombre
                                                                                        .toLowerCase()
                                                                                        .includes(searchValueUbicacion.toLowerCase()))
                                                                                        .sort((a, b) => a.nombre.localeCompare(b.nombre))
                                                                                        .map((u) => (_jsxs(CommandItem, { value: u.id, onSelect: (currentValue) => {
                                                                                            field.onChange(currentValue === field.value
                                                                                                ? ''
                                                                                                : currentValue);
                                                                                            setOpenUbicacionCombobox(false);
                                                                                            setSearchValueUbicacion('');
                                                                                        }, children: [_jsx(Check, { className: cn('mr-2 h-4 w-4', field.value === u.id
                                                                                                    ? 'opacity-100'
                                                                                                    : 'opacity-0') }), u.nombre] }, u.id))) })] })] }) })] })) }), _jsx(Button, { type: 'button', variant: 'outline', onClick: () => setShowNuevaUbicacionForm(true), disabled: isLoading, children: "Nueva Ubicaci\u00F3n" })] })] })] }), _jsxs("div", { className: 'space-y-1.5', children: [_jsx(Label, { children: "Imagen del Material (Opcional)" }), _jsx("div", { className: 'border-2 border-dashed rounded-lg p-6 text-center space-y-3 hover:border-primary transition-colors', children: imagePreview ? (_jsxs("div", { className: 'relative group inline-block', children: [_jsx("img", { src: imagePreview, alt: 'Vista previa', className: 'max-h-48 mx-auto rounded-md shadow-md object-contain' }), _jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { type: 'button', variant: 'destructive', size: 'icon', className: 'absolute -top-2 -right-2 opacity-80 group-hover:opacity-100 transition-opacity rounded-full h-7 w-7', onClick: removeImage, children: _jsx(X, { className: 'h-4 w-4' }) }) }), _jsx(TooltipContent, { children: _jsx("p", { children: "Eliminar imagen" }) })] }) })] })) : (_jsxs("div", { className: 'flex flex-col items-center justify-center space-y-2 cursor-pointer', onClick: () => document.getElementById('imagenFile')?.click(), children: [_jsx(Upload, { className: 'h-10 w-10 text-muted-foreground' }), _jsxs("p", { className: 'text-sm text-muted-foreground', children: ["Arrastra una imagen o", ' ', _jsx("span", { className: 'text-primary font-medium', children: "haz clic aqu\u00ED" }), ' ', "para seleccionar."] }), _jsx(Input, { id: 'imagenFile', type: 'file', accept: 'image/*', className: 'hidden', onChange: handleImageChange })] })) }), errors.imagenUrl && (_jsx("p", { className: 'text-xs text-destructive mt-1', children: errors.imagenUrl.message }))] })] }));
            case STEPS.DETALLES_EQUIPO_MARCA_MODELO:
                return (_jsxs("div", { className: 'space-y-6', children: [_jsxs("div", { className: 'space-y-1.5', children: [_jsxs(Label, { htmlFor: 'marca', children: ["1. Seleccione la Marca del Equipo", ' ', _jsx("span", { className: 'text-destructive', children: "*" })] }), _jsxs("div", { className: 'flex items-center gap-2', children: [_jsx(Controller, { name: 'marca', control: control, rules: { required: 'La marca es obligatoria.' }, render: ({ field }) => (_jsxs(Popover, { open: openMarcaCombobox, onOpenChange: setOpenMarcaCombobox, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: 'outline', role: 'combobox', "aria-expanded": openMarcaCombobox, className: `w-full justify-between ${errors.marca ? 'border-destructive' : ''}`, disabled: isLoading, children: [field.value
                                                                    ? marcas.find((m) => m.id === field.value)?.nombre
                                                                    : '-- Seleccionar marca --', _jsx(ChevronsUpDown, { className: 'ml-2 h-4 w-4 shrink-0 opacity-50' })] }) }), _jsx(PopoverContent, { className: 'w-[--radix-popover-trigger-width] p-0', children: _jsxs(Command, { children: [_jsx(CommandInput, { placeholder: 'Buscar marca...', value: searchValueMarca, onValueChange: setSearchValueMarca }), _jsxs(CommandList, { children: [_jsx(CommandEmpty, { children: searchValueMarca === ''
                                                                                ? 'Escriba para buscar o cree una nueva.'
                                                                                : `No se encontró la marca "${searchValueMarca}".` }), _jsx(CommandGroup, { children: marcas
                                                                                .filter((m) => m.nombre
                                                                                .toLowerCase()
                                                                                .includes(searchValueMarca.toLowerCase()))
                                                                                .sort((a, b) => a.nombre.localeCompare(b.nombre))
                                                                                .map((m) => {
                                                                                if (!m ||
                                                                                    typeof m.id !== 'string' ||
                                                                                    m.id === '')
                                                                                    return null;
                                                                                return (_jsxs(CommandItem, { value: m.id, onSelect: (currentValue) => {
                                                                                        field.onChange(currentValue === field.value
                                                                                            ? ''
                                                                                            : currentValue);
                                                                                        setFiltroTablaArticulos('');
                                                                                        setSelectedArticuloBaseId(null);
                                                                                        setValue('modelo', '');
                                                                                        setValue('nombre', '');
                                                                                        setOpenMarcaCombobox(false);
                                                                                        setSearchValueMarca('');
                                                                                    }, children: [_jsx(Check, { className: cn('mr-2 h-4 w-4', field.value === m.id
                                                                                                ? 'opacity-100'
                                                                                                : 'opacity-0') }), m.nombre] }, m.id));
                                                                            }) })] })] }) })] })) }), _jsx(Button, { type: 'button', variant: 'outline', onClick: () => setShowNuevaMarcaForm(true), disabled: isLoading, children: "Nueva Marca" })] }), errors.marca && (_jsx("p", { className: 'text-xs text-destructive mt-1', children: errors.marca.message }))] }), marcaSeleccionadaId && (_jsxs("div", { className: 'space-y-4', children: [_jsx(Label, { children: "2. Seleccione una Definici\u00F3n de Equipo Existente (Nombre y Modelo)" }), _jsxs("div", { className: 'flex items-center gap-2 mb-2', children: [_jsxs("div", { className: 'relative w-full', children: [_jsx(Search, { className: 'absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' }), _jsx(Input, { type: 'search', placeholder: 'Filtrar por nombre o modelo...', value: filtroTablaArticulos, onChange: (e) => setFiltroTablaArticulos(e.target.value), className: 'pl-8 w-full', disabled: isLoading || mostrandoFormNuevoArticuloBase })] }), _jsx(Button, { variant: 'outline', size: 'sm', onClick: (e) => {
                                                e.preventDefault();
                                                setMostrandoFormNuevoArticuloBase(!mostrandoFormNuevoArticuloBase);
                                            }, disabled: isLoading, type: 'button', children: mostrandoFormNuevoArticuloBase ? (_jsxs(_Fragment, { children: [_jsx(X, { className: 'mr-2 h-4 w-4' }), " Cancelar Nuevo"] })) : (_jsxs(_Fragment, { children: [_jsx(PlusCircle, { className: 'mr-2 h-4 w-4' }), " Definir Nuevo"] })) })] }), mostrandoFormNuevoArticuloBase ? (_jsxs("div", { className: 'my-4 p-4 border rounded-md bg-muted/10', children: [_jsx("h3", { className: 'text-lg font-semibold mb-3', children: "Definir Nuevo Tipo de Equipo" }), _jsxs("form", { className: 'space-y-4', onSubmit: (e) => e.preventDefault(), children: [_jsxs("div", { className: 'grid grid-cols-1 md:grid-cols-2 gap-4', children: [_jsxs("div", { className: 'space-y-2', children: [_jsxs(Label, { htmlFor: 'nuevoNombreArticulo', children: ["Nombre del Equipo", ' ', _jsx("span", { className: 'text-destructive', children: "*" })] }), _jsx(Input, { id: 'nuevoNombreArticulo', placeholder: 'Ej: Router Wifi, ONT, Switch 24 puertos', value: getValues('nombre'), onChange: (e) => setValue('nombre', e.target.value, {
                                                                        shouldValidate: true,
                                                                    }), className: errors.nombre ? 'border-destructive' : '' }), errors.nombre && (_jsx("p", { className: 'text-xs text-destructive', children: errors.nombre.message })), _jsx("p", { className: 'text-xs text-muted-foreground', children: "Nombre gen\u00E9rico del tipo de equipo" })] }), _jsxs("div", { className: 'space-y-2', children: [_jsxs(Label, { htmlFor: 'nuevoModeloArticulo', children: ["Modelo ", _jsx("span", { className: 'text-destructive', children: "*" })] }), _jsx(Input, { id: 'nuevoModeloArticulo', placeholder: 'Ej: WR-841N, HG8145V5, SG350-28', value: getValues('modelo'), onChange: (e) => setValue('modelo', e.target.value, {
                                                                        shouldValidate: true,
                                                                    }), className: errors.modelo ? 'border-destructive' : '' }), errors.modelo && (_jsx("p", { className: 'text-xs text-destructive', children: errors.modelo.message })), _jsx("p", { className: 'text-xs text-muted-foreground', children: "Modelo espec\u00EDfico del fabricante" })] })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { htmlFor: 'nuevoCostoArticulo', children: "Costo Unitario (Moneda Local)" }), _jsx(Input, { id: 'nuevoCostoArticulo', type: 'number', min: '0', step: '0.01', placeholder: 'Ej: 25.50', value: getValues('costo'), onChange: (e) => {
                                                                const value = e.target.value === ''
                                                                    ? 0
                                                                    : parseFloat(e.target.value);
                                                                setValue('costo', value);
                                                            } }), _jsx("p", { className: 'text-xs text-muted-foreground', children: "Precio de compra por unidad" })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { htmlFor: 'nuevaDescripcionArticulo', children: "Descripci\u00F3n (Opcional)" }), _jsx(Textarea, { id: 'nuevaDescripcionArticulo', placeholder: 'Especificaciones t\u00E9cnicas, caracter\u00EDsticas, etc.', value: getValues('descripcion') || '', onChange: (e) => setValue('descripcion', e.target.value), rows: 3 })] }), _jsxs("div", { className: 'flex justify-end space-x-2 pt-2', children: [_jsx(Button, { type: 'button', variant: 'outline', onClick: () => setMostrandoFormNuevoArticuloBase(false), children: "Cancelar" }), _jsx(Button, { type: 'button', onClick: () => {
                                                                if (!getValues('nombre') || !getValues('modelo')) {
                                                                    toast.error('Nombre y modelo son obligatorios');
                                                                    return;
                                                                }
                                                                toast.success(`Tipo de equipo "${getValues('nombre')} ${getValues('modelo')}" definido`);
                                                                setMostrandoFormNuevoArticuloBase(false);
                                                                nextStep();
                                                            }, children: "Guardar y Continuar" })] })] })] })) : articulosDeMarcaFiltrados.length > 0 ? (_jsx("div", { className: 'rounded-md border max-h-[300px] overflow-y-auto', children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "Nombre del Art\u00EDculo" }), _jsx(TableHead, { children: "Modelo" }), _jsx(TableHead, { className: 'text-right', children: "Acci\u00F3n" })] }) }), _jsx(TableBody, { children: articulosDeMarcaFiltrados.map((articulo) => (_jsxs(TableRow, { children: [_jsx(TableCell, { className: 'font-medium', children: articulo.nombre }), _jsx(TableCell, { children: articulo.modelo || 'N/A' }), _jsx(TableCell, { className: 'text-right', children: _jsx(Button, { variant: 'ghost', size: 'sm', onClick: () => {
                                                                    setValue('nombre', articulo.nombre, {
                                                                        shouldTouch: true,
                                                                        shouldValidate: true,
                                                                    });
                                                                    setValue('modelo', articulo.modelo || '', {
                                                                        shouldTouch: true,
                                                                        shouldValidate: true,
                                                                    });
                                                                    setValue('costo', articulo.costo || 0, {
                                                                        shouldTouch: true,
                                                                        shouldValidate: true,
                                                                    });
                                                                    setValue('descripcion', articulo.descripcion || '', { shouldTouch: true, shouldValidate: true });
                                                                    setSelectedArticuloBaseId(articulo.id);
                                                                    toast.success(`"${articulo.nombre}" seleccionado.`);
                                                                    nextStep();
                                                                }, disabled: isLoading, children: "Seleccionar" }) })] }, articulo.id))) })] }) })) : (_jsx("p", { className: 'text-sm text-muted-foreground text-center py-4', children: filtroTablaArticulos
                                        ? `No se encontraron definiciones de equipo para "${filtroTablaArticulos}".`
                                        : 'No hay definiciones de equipo para esta marca. Puede crear una con "Definir Nuevo"' }))] })), _jsx(NuevaMarcaForm, { open: showNuevaMarcaForm, onOpenChange: setShowNuevaMarcaForm, onMarcaCreada: (nuevaMarca) => {
                                setValue('marca', nuevaMarca.id);
                                toast.success(`Marca "${nuevaMarca.nombre}" seleccionada`);
                            } })] }));
            case STEPS.DETALLES_EQUIPO_ESPECIFICOS:
                return (_jsxs("div", { className: 'space-y-6', children: [_jsxs("div", { className: 'mb-4 p-4 border rounded-md bg-muted/50', children: [_jsx("h4", { className: 'font-medium text-lg mb-1', children: "Resumen del Equipo Base:" }), _jsxs("p", { className: 'text-sm text-muted-foreground', children: [_jsx("strong", { children: "Nombre:" }), " ", getValues('nombre') || 'N/A', _jsx("br", {}), _jsx("strong", { children: "Marca:" }), ' ', marcas.find((m) => m.id === getValues('marca'))?.nombre ||
                                            'N/A', ' ', _jsx("br", {}), _jsx("strong", { children: "Modelo:" }), " ", getValues('modelo') || 'N/A'] }), selectedArticuloBaseId && (_jsx("p", { className: 'text-xs text-green-600 mt-1', children: "Se est\u00E1n utilizando los datos (costo, descripci\u00F3n general) de esta definici\u00F3n de equipo." }))] }), _jsxs("div", { className: 'flex justify-between items-center my-4', children: [_jsx("h3", { className: 'text-lg font-medium', children: "Datos del Equipo" }), _jsx(Button, { type: 'button', variant: 'outline', onClick: () => setIsMultipleMode(!isMultipleMode), className: 'flex items-center space-x-1', children: isMultipleMode ? (_jsx(_Fragment, { children: "Modo Individual" })) : (_jsx(_Fragment, { children: "Modo M\u00FAltiple (Esc\u00E1ner)" })) })] }), isMultipleMode ? (_jsxs("div", { className: 'p-4 bg-primary/5 rounded border border-primary/20', children: [_jsx("p", { className: 'text-sm mb-3', children: "Utilice este modo para agregar m\u00FAltiples equipos del mismo tipo en una sola operaci\u00F3n. Ideal para escanear varios n\u00FAmeros de serie con un lector de c\u00F3digos de barras." }), _jsx(Button, { type: 'button', onClick: () => setCurrentStep(STEPS.DETALLES_EQUIPOS_MULTIPLES), className: 'w-full', children: "Ir a Modo M\u00FAltiple" })] })) : (_jsxs("div", { className: 'grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5', children: [_jsxs("div", { className: 'space-y-1.5', children: [_jsxs(Label, { htmlFor: 'serial', children: ["N\u00FAmero de Serie (S/N)", ' ', _jsx("span", { className: 'text-destructive', children: "*" })] }), _jsx(Input, { id: 'serial', placeholder: 'Ingrese o escanee S/N', ...register('serial', {
                                                required: 'El S/N es obligatorio para equipos.',
                                                minLength: {
                                                    value: 3,
                                                    message: 'S/N debe tener al menos 3 caracteres',
                                                },
                                            }), className: errors.serial ? 'border-destructive' : '', disabled: isLoading }), errors.serial && (_jsx("p", { className: 'text-xs text-destructive mt-1', children: errors.serial.message }))] }), _jsxs("div", { className: 'space-y-1.5', children: [_jsxs(Label, { htmlFor: 'mac', children: ["Direcci\u00F3n MAC ", _jsx("span", { className: 'text-destructive', children: "*" })] }), _jsx(Input, { id: 'mac', placeholder: 'AA:BB:CC:DD:EE:FF', ...register('mac', {
                                                required: 'La MAC es obligatoria para equipos.',
                                                pattern: {
                                                    value: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^([0-9A-Fa-f]{12})$/,
                                                    message: 'Formato MAC inválido (ej: AA:BB:CC:DD:EE:FF o AABBCCDDEEFF)',
                                                },
                                            }), className: errors.mac ? 'border-destructive' : '', disabled: isLoading }), errors.mac && (_jsx("p", { className: 'text-xs text-destructive mt-1', children: errors.mac.message }))] }), _jsxs("div", { className: 'space-y-1.5', children: [_jsx(Label, { htmlFor: 'wirelessKey', children: "Clave Inal\u00E1mbrica (Wireless Key)" }), _jsx(Input, { id: 'wirelessKey', placeholder: 'Clave de Wi-Fi si aplica', ...register('wirelessKey'), disabled: isLoading })] }), _jsxs("div", { className: 'space-y-1.5', children: [_jsx(Label, { htmlFor: 'garantia', children: "Garant\u00EDa (en meses)" }), _jsx(Input, { id: 'garantia', type: 'number', min: '0', placeholder: 'Ej: 12', ...register('garantia', {
                                                valueAsNumber: true,
                                                min: { value: 0, message: 'No puede ser negativo.' },
                                            }), className: errors.garantia ? 'border-destructive' : '', disabled: isLoading }), errors.garantia && (_jsx("p", { className: 'text-xs text-destructive mt-1', children: errors.garantia.message }))] }), _jsxs("div", { className: 'space-y-1.5', children: [_jsx(Label, { htmlFor: 'ubicacion', children: "Ubicaci\u00F3n de esta Unidad (Opcional)" }), _jsxs("div", { className: 'flex gap-2', children: [_jsx(Controller, { name: 'ubicacion', control: control, render: ({ field }) => (_jsxs(Popover, { open: openUbicacionCombobox, onOpenChange: setOpenUbicacionCombobox, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: 'outline', role: 'combobox', "aria-expanded": openUbicacionCombobox, className: 'w-full justify-between', disabled: isLoading, children: [field.value
                                                                            ? ubicaciones.find((u) => u.id === field.value)
                                                                                ?.nombre || field.value
                                                                            : '-- Seleccionar ubicación --', _jsx(ChevronsUpDown, { className: 'ml-2 h-4 w-4 shrink-0 opacity-50' })] }) }), _jsx(PopoverContent, { className: 'w-[--radix-popover-trigger-width] p-0', children: _jsxs(Command, { children: [_jsx(CommandInput, { placeholder: 'Buscar ubicaci\u00F3n...', value: searchValueUbicacion, onValueChange: setSearchValueUbicacion }), _jsxs(CommandList, { children: [_jsx(CommandEmpty, { children: searchValueUbicacion === ''
                                                                                        ? 'Escriba para buscar o cree una nueva.'
                                                                                        : `No se encontró la ubicación "${searchValueUbicacion}".` }), _jsx(CommandGroup, { children: ubicaciones
                                                                                        .filter((u) => u.nombre
                                                                                        .toLowerCase()
                                                                                        .includes(searchValueUbicacion.toLowerCase()))
                                                                                        .sort((a, b) => a.nombre.localeCompare(b.nombre))
                                                                                        .map((u) => (_jsxs(CommandItem, { value: u.id, onSelect: (currentValue) => {
                                                                                            field.onChange(currentValue === field.value
                                                                                                ? ''
                                                                                                : currentValue);
                                                                                            setOpenUbicacionCombobox(false);
                                                                                            setSearchValueUbicacion('');
                                                                                        }, children: [_jsx(Check, { className: cn('mr-2 h-4 w-4', field.value === u.id
                                                                                                    ? 'opacity-100'
                                                                                                    : 'opacity-0') }), u.nombre] }, u.id))) })] })] }) })] })) }), _jsx(Button, { type: 'button', variant: 'outline', onClick: () => setShowNuevaUbicacionForm(true), disabled: isLoading, children: "Nueva Ubicaci\u00F3n" })] })] })] })), _jsxs("div", { className: 'space-y-1.5', children: [_jsx(Label, { htmlFor: 'descripcionUnidad', children: "Descripci\u00F3n Espec\u00EDfica de esta Unidad" }), _jsx(Textarea, { id: 'descripcionUnidad', placeholder: 'Notas sobre esta unidad en particular (ej: Ray\u00F3n en carcasa, Configuraci\u00F3n especial)', ...register('descripcion'), rows: 3, disabled: isLoading })] }), _jsxs("div", { className: 'space-y-1.5', children: [_jsx(Label, { children: "Imagen de esta Unidad (Opcional)" }), _jsx("div", { className: 'border-2 border-dashed rounded-lg p-6 text-center space-y-3 hover:border-primary transition-colors', children: imagePreview ? (_jsxs("div", { className: 'relative group inline-block', children: [_jsx("img", { src: imagePreview, alt: 'Vista previa de unidad', className: 'max-h-48 mx-auto rounded-md shadow-md object-contain' }), _jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsx(Button, { type: 'button', variant: 'destructive', size: 'icon', className: 'absolute -top-2 -right-2 opacity-80 group-hover:opacity-100 transition-opacity rounded-full h-7 w-7', onClick: removeImage, children: _jsx(X, { className: 'h-4 w-4' }) }) }), _jsx(TooltipContent, { children: _jsx("p", { children: "Eliminar imagen" }) })] }) })] })) : (_jsxs("div", { className: 'flex flex-col items-center justify-center space-y-2 cursor-pointer', onClick: () => document.getElementById('imagenFileEquipo')?.click(), children: [_jsx(Upload, { className: 'h-10 w-10 text-muted-foreground' }), _jsxs("p", { className: 'text-sm text-muted-foreground', children: ["Arrastra una imagen o", ' ', _jsx("span", { className: 'text-primary font-medium', children: "haz clic aqu\u00ED" }), ' ', "para seleccionar."] }), _jsx(Input, { id: 'imagenFileEquipo', type: 'file', accept: 'image/*', className: 'hidden', onChange: handleImageChange })] })) }), errors.imagenUrl && (_jsx("p", { className: 'text-xs text-destructive mt-1', children: errors.imagenUrl.message }))] })] }));
            case STEPS.DETALLES_EQUIPOS_MULTIPLES:
                return (_jsxs("div", { className: 'space-y-6', children: [_jsxs("div", { className: 'mb-4 p-4 border rounded-md bg-muted/50', children: [_jsx("h4", { className: 'font-medium text-lg mb-1', children: "Resumen del Equipo Base:" }), _jsxs("p", { className: 'text-sm text-muted-foreground', children: [_jsx("strong", { children: "Nombre:" }), " ", getValues('nombre') || 'N/A', _jsx("br", {}), _jsx("strong", { children: "Marca:" }), ' ', marcas.find((m) => m.id === getValues('marca'))?.nombre ||
                                            'N/A', ' ', _jsx("br", {}), _jsx("strong", { children: "Modelo:" }), " ", getValues('modelo') || 'N/A'] })] }), _jsxs("div", { className: 'space-y-2', children: [_jsxs("div", { className: 'flex justify-between items-center', children: [_jsx(Label, { htmlFor: 'multipleSNList', className: 'text-lg font-medium', children: "Lista de N\u00FAmeros de Serie (S/N)" }), _jsxs("span", { className: 'text-sm text-muted-foreground', children: [seriales.length, " equipos detectados"] })] }), _jsxs("div", { className: 'text-sm text-muted-foreground mb-2', children: ["Escanee m\u00FAltiples c\u00F3digos o ingrese manualmente. Cada n\u00FAmero de serie debe estar en una l\u00EDnea separada.", _jsx("br", {}), _jsx("strong", { children: "Tip:" }), " Configure su esc\u00E1ner para agregar un salto de l\u00EDnea despu\u00E9s de cada c\u00F3digo."] }), _jsx(Textarea, { id: 'multipleSNList', placeholder: 'Escanee o pegue m\u00FAltiples n\u00FAmeros de serie, uno por l\u00EDnea\nEjemplo:\nSN123456\nSN789012\nSN345678', value: multipleSNList, onChange: (e) => setMultipleSNList(e.target.value), rows: 10, className: 'font-mono text-sm', autoFocus: true })] }), seriales.length > 0 && (_jsxs("div", { className: 'p-4 border rounded-md bg-muted/10', children: [_jsxs("div", { className: 'flex justify-between items-center mb-2', children: [_jsx("h4", { className: 'font-medium', children: "Vista previa:" }), _jsxs("span", { className: 'text-sm text-primary font-medium', children: [seriales.length, " equipos"] })] }), _jsx("div", { className: 'mt-2 max-h-40 overflow-y-auto text-sm', children: _jsx("ul", { className: 'list-disc list-inside space-y-1', children: seriales.map((serial, idx) => (_jsxs("li", { className: 'flex justify-between items-center', children: [_jsx("span", { className: 'font-mono', children: serial }), _jsxs("span", { className: 'text-xs text-muted-foreground', children: ["S/N #", idx + 1] })] }, idx))) }) })] })), _jsxs("div", { className: 'space-y-1.5', children: [_jsx(Label, { htmlFor: 'ubicacion', children: "Ubicaci\u00F3n Com\u00FAn" }), _jsxs("div", { className: 'flex gap-2', children: [_jsx(Controller, { name: 'ubicacion', control: control, render: ({ field }) => (_jsxs(Popover, { open: openUbicacionCombobox, onOpenChange: setOpenUbicacionCombobox, children: [_jsx(PopoverTrigger, { asChild: true, children: _jsxs(Button, { variant: 'outline', role: 'combobox', "aria-expanded": openUbicacionCombobox, className: 'w-full justify-between', disabled: isLoading, children: [field.value
                                                                    ? ubicaciones.find((u) => u.id === field.value)
                                                                        ?.nombre || field.value
                                                                    : '-- Seleccionar ubicación --', _jsx(ChevronsUpDown, { className: 'ml-2 h-4 w-4 shrink-0 opacity-50' })] }) }), _jsx(PopoverContent, { className: 'w-[--radix-popover-trigger-width] p-0', children: _jsxs(Command, { children: [_jsx(CommandInput, { placeholder: 'Buscar ubicaci\u00F3n...', value: searchValueUbicacion, onValueChange: setSearchValueUbicacion }), _jsxs(CommandList, { children: [_jsx(CommandEmpty, { children: searchValueUbicacion === ''
                                                                                ? 'Escriba para buscar o cree una nueva.'
                                                                                : `No se encontró la ubicación "${searchValueUbicacion}".` }), _jsx(CommandGroup, { children: ubicaciones
                                                                                .filter((u) => u.nombre
                                                                                .toLowerCase()
                                                                                .includes(searchValueUbicacion.toLowerCase()))
                                                                                .sort((a, b) => a.nombre.localeCompare(b.nombre))
                                                                                .map((u) => (_jsxs(CommandItem, { value: u.id, onSelect: (currentValue) => {
                                                                                    field.onChange(currentValue === field.value
                                                                                        ? ''
                                                                                        : currentValue);
                                                                                    setOpenUbicacionCombobox(false);
                                                                                    setSearchValueUbicacion('');
                                                                                }, children: [_jsx(Check, { className: cn('mr-2 h-4 w-4', field.value === u.id
                                                                                            ? 'opacity-100'
                                                                                            : 'opacity-0') }), u.nombre] }, u.id))) })] })] }) })] })) }), _jsx(Button, { type: 'button', variant: 'outline', onClick: () => setShowNuevaUbicacionForm(true), disabled: isLoading, children: "Nueva Ubicaci\u00F3n" })] })] }), _jsxs("div", { className: 'p-4 bg-amber-50 border border-amber-200 rounded-md', children: [_jsxs("h4", { className: 'font-medium text-amber-800 flex items-center', children: [_jsx("svg", { xmlns: 'http://www.w3.org/2000/svg', className: 'h-5 w-5 mr-2', viewBox: '0 0 20 20', fill: 'currentColor', children: _jsx("path", { fillRule: 'evenodd', d: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z', clipRule: 'evenodd' }) }), "Informaci\u00F3n Importante"] }), _jsxs("ul", { className: 'mt-2 text-sm text-amber-700 list-disc list-inside space-y-1', children: [_jsx("li", { children: "Se crear\u00E1 un registro individual en el inventario para cada n\u00FAmero de serie." }), _jsx("li", { children: "Todos compartir\u00E1n la misma marca, modelo y datos generales." }), _jsx("li", { children: "Las MACs se generar\u00E1n autom\u00E1ticamente si no se especifican." }), _jsx("li", { children: "Este proceso puede tardar unos segundos dependiendo de la cantidad de equipos." })] })] })] }));
            default:
                return _jsx("div", { children: "Paso desconocido" });
        }
    };
    return (_jsxs(Dialog, { open: open, onOpenChange: handleCloseDialog, children: [_jsxs(DialogContent, { className: 'sm:max-w-[700px] md:max-w-[800px] lg:max-w-[900px] max-h-[95vh] overflow-y-auto p-6', children: [_jsx(DialogHeader, { className: 'mb-4', children: _jsxs(DialogTitle, { className: 'text-2xl', children: [currentStep === STEPS.SELECCION_TIPO && 'Agregar Nuevo Artículo', currentStep === STEPS.DETALLES_MATERIAL &&
                                    `Agregar Material: ${getValues('nombre') || '...'}`, currentStep === STEPS.DETALLES_EQUIPO_MARCA_MODELO &&
                                    'Agregar Equipo: Marca y Modelo', currentStep === STEPS.DETALLES_EQUIPO_ESPECIFICOS &&
                                    'Agregar Equipo: Detalles Específicos', currentStep === STEPS.DETALLES_EQUIPOS_MULTIPLES &&
                                    'Agregar Equipos Múltiples'] }) }), _jsxs("form", { onSubmit: handleSubmit(onSubmitHandler), className: 'space-y-6', children: [renderStepContent(), _jsxs(DialogFooter, { className: 'pt-8 flex justify-between w-full', children: [_jsx("div", { children: currentStep !== STEPS.SELECCION_TIPO && (_jsx(Button, { type: 'button', variant: 'outline', onClick: prevStep, disabled: isLoading, children: "Anterior" })) }), _jsxs("div", { children: [_jsx(Button, { type: 'button', variant: 'ghost', onClick: handleCloseDialog, disabled: isLoading, className: 'mr-2', children: "Cancelar" }), currentStep === STEPS.DETALLES_MATERIAL ||
                                                currentStep === STEPS.DETALLES_EQUIPO_ESPECIFICOS ? (_jsx(Button, { type: 'submit', disabled: isLoading ||
                                                    !isValid ||
                                                    (tipoSeleccionado === TipoArticulo.MATERIAL &&
                                                        articuloExistenteDetectado &&
                                                        touchedFields.cantidad === undefined &&
                                                        getValues('cantidad') <= 0) ||
                                                    (tipoSeleccionado === TipoArticulo.MATERIAL &&
                                                        !articuloExistenteDetectado &&
                                                        (!getValues('nombre') ||
                                                            getValues('cantidad') <= 0 ||
                                                            getValues('costo') < 0 ||
                                                            !getValues('unidad'))) ||
                                                    (tipoSeleccionado === TipoArticulo.EQUIPO &&
                                                        currentStep === STEPS.DETALLES_EQUIPO_ESPECIFICOS &&
                                                        (!getValues('serial') ||
                                                            !getValues('mac') ||
                                                            !!errors.serial ||
                                                            !!errors.mac)), variant: articuloExistenteDetectado &&
                                                    tipoSeleccionado === TipoArticulo.MATERIAL
                                                    ? 'destructive'
                                                    : 'default', children: isLoading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: 'animate-spin mr-2', children: " y\u00FCkleniyor..." }), ' ', "Guardando..."] })) : articuloExistenteDetectado &&
                                                    tipoSeleccionado === TipoArticulo.MATERIAL ? ('Actualizar Material') : ('Guardar Artículo') })) : (_jsx(Button, { type: 'button', onClick: nextStep, disabled: isLoading ||
                                                    (currentStep === STEPS.SELECCION_TIPO && !tipoSeleccionado), children: "Siguiente" }))] })] })] })] }), _jsx(NuevaMarcaForm, { open: showNuevaMarcaForm, onOpenChange: setShowNuevaMarcaForm, onMarcaCreada: (nuevaMarca) => {
                    setValue('marca', nuevaMarca.id);
                    toast.success(`Marca "${nuevaMarca.nombre}" seleccionada`);
                } }), _jsx(NuevaUbicacionForm, { open: showNuevaUbicacionForm, onOpenChange: setShowNuevaUbicacionForm, onUbicacionCreada: handleUbicacionCreada })] }));
}
