import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { storage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Loader2, X, Upload, ImagePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePreRegistro } from '@/api/hooks/usePreRegistro';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};
const useToast = () => {
    return {
        toast: ({ title, description, variant, }) => {
            if (variant === 'destructive') {
                alert(`${title}: ${description}`);
            }
            else {
                alert(`${title}: ${description}`);
            }
        },
    };
};
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
];
const formSchema = z.object({
    cliente: z.string().min(2, { message: 'El nombre del cliente es requerido' }),
    cedula: z
        .string()
        .min(5, { message: 'La cédula debe tener al menos 5 caracteres' }),
    direccion: z.string().min(5, { message: 'La dirección es requerida' }),
    telefono: z
        .string()
        .min(8, { message: 'El teléfono debe tener al menos 8 dígitos' }),
    movil: z
        .string()
        .min(8, { message: 'El móvil debe tener al menos 8 dígitos' }),
    email: z.string().email({ message: 'Correo electrónico inválido' }),
    notas: z.string().optional(),
    fecha_instalacion: z
        .string()
        .min(1, { message: 'La fecha de instalación es requerida' }),
    clienteReferencia: z.string().optional(),
});
export default function NuevoPreRegistro() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { crearPreRegistro, loading } = usePreRegistro();
    const [fotoCedula, setFotoCedula] = useState([]);
    const [fotoContrato, setFotoContrato] = useState([]);
    const [uploading, setUploading] = useState(false);
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            cliente: '',
            cedula: '',
            direccion: '',
            telefono: '',
            movil: '',
            email: '',
            notas: '',
            fecha_instalacion: new Date().toISOString().split('T')[0],
            clienteReferencia: '',
        },
    });
    const handleImageUpload = async (files, folder) => {
        const uploadPromises = Array.from(files).map(async (file) => {
            const fileId = uuidv4();
            const fileRef = ref(storage, `preregistros/${folder}/${fileId}-${file.name}`);
            await uploadBytes(fileRef, file);
            return getDownloadURL(fileRef);
        });
        return Promise.all(uploadPromises);
    };
    const onSubmit = async (values) => {
        try {
            setUploading(true);
            // Upload images to Firebase Storage (only if files exist)
            let cedulaUrls = [];
            let contratoUrls = [];
            if (fotoCedula.length > 0) {
                cedulaUrls = await handleImageUpload(fotoCedula, 'cedulas');
            }
            if (fotoContrato.length > 0) {
                contratoUrls = await handleImageUpload(fotoContrato, 'contratos');
            }
            // Create pre-registro with image URLs (if available)
            const result = await crearPreRegistro({
                ...values,
                token: '',
                clienteReferencia: values.clienteReferencia || '',
                fotoCedula: cedulaUrls.length > 0 ? cedulaUrls[0] : '', // First image as main or empty string
                fotoContrato: contratoUrls, // All contract images or empty array
            });
            if (result.mikrowispSuccess) {
                toast({
                    title: 'Pre-registro creado',
                    description: 'El pre-registro ha sido creado exitosamente.',
                });
                navigate('/ventas/pre-registros');
            }
            else {
                toast({
                    title: 'Error',
                    description: 'Hubo un problema al crear el pre-registro.',
                    variant: 'destructive',
                });
            }
        }
        catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: 'Hubo un problema al procesar el pre-registro.',
                variant: 'destructive',
            });
        }
        finally {
            setUploading(false);
        }
    };
    const handleFileChange = (event, setFiles, maxFiles) => {
        const fileList = event.target.files;
        if (!fileList)
            return;
        const filesArray = Array.from(fileList);
        const validFiles = filesArray.filter((file) => {
            const isValidType = ACCEPTED_IMAGE_TYPES.includes(file.type);
            const isValidSize = file.size <= MAX_FILE_SIZE;
            if (!isValidType) {
                toast({
                    title: 'Error',
                    description: `Tipo de archivo no soportado: ${file.name}`,
                    variant: 'destructive',
                });
            }
            if (!isValidSize) {
                toast({
                    title: 'Error',
                    description: `Archivo demasiado grande: ${file.name}`,
                    variant: 'destructive',
                });
            }
            return isValidType && isValidSize;
        });
        setFiles((prev) => {
            const newFiles = [...prev, ...validFiles];
            return newFiles.slice(0, maxFiles); // Limit to max files
        });
    };
    const removeFile = (index, files, setFiles) => {
        setFiles(files.filter((_, i) => i !== index));
    };
    return (_jsxs(Card, { className: 'w-full max-w-3xl mx-auto', children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Nuevo Pre-Registro" }), _jsx(CardDescription, { children: "Registra un nuevo cliente potencial. Las fotos de la c\u00E9dula y contrato son opcionales." })] }), _jsx(CardContent, { children: _jsx(Form, { ...form, children: _jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: 'space-y-6', children: [_jsxs("div", { className: 'grid grid-cols-1 md:grid-cols-2 gap-4', children: [_jsx(FormField, { control: form.control, name: 'cliente', render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Nombre del Cliente" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: 'Juan Perez', ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: 'cedula', render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "C\u00E9dula" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: '001-1234567-8', ...field }) }), _jsx(FormMessage, {})] })) })] }), _jsx(FormField, { control: form.control, name: 'direccion', render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Direcci\u00F3n" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: 'Calle Principal #123, Sector X', ...field }) }), _jsx(FormMessage, {})] })) }), _jsxs("div", { className: 'grid grid-cols-1 md:grid-cols-2 gap-4', children: [_jsx(FormField, { control: form.control, name: 'telefono', render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Tel\u00E9fono" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: '809-123-4567', ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: 'movil', render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "M\u00F3vil" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: '829-123-4567', ...field }) }), _jsx(FormMessage, {})] })) })] }), _jsxs("div", { className: 'grid grid-cols-1 md:grid-cols-2 gap-4', children: [_jsx(FormField, { control: form.control, name: 'email', render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Correo Electr\u00F3nico" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: 'cliente@example.com', ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: 'fecha_instalacion', render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Fecha de Instalaci\u00F3n" }), _jsx(FormControl, { children: _jsx(Input, { type: 'date', ...field }) }), _jsx(FormMessage, {})] })) })] }), _jsx(FormField, { control: form.control, name: 'clienteReferencia', render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Cliente de Referencia (opcional)" }), _jsx(FormControl, { children: _jsx(Input, { placeholder: '\u00BFQui\u00E9n refiri\u00F3 a este cliente?', ...field }) }), _jsx(FormMessage, {})] })) }), _jsx(FormField, { control: form.control, name: 'notas', render: ({ field }) => (_jsxs(FormItem, { children: [_jsx(FormLabel, { children: "Notas Adicionales" }), _jsx(FormControl, { children: _jsx(Textarea, { placeholder: 'Cualquier informaci\u00F3n adicional relevante...', ...field }) }), _jsx(FormMessage, {})] })) }), _jsxs("div", { className: 'space-y-4', children: [_jsxs("div", { children: [_jsx(FormLabel, { children: "Fotos de C\u00E9dula (opcional, 2 m\u00E1ximo)" }), _jsx(FormDescription, { children: "Sube fotos claras de ambos lados de la c\u00E9dula si est\u00E1n disponibles" }), _jsxs("div", { className: 'mt-2 flex flex-col gap-2', children: [_jsx("div", { className: 'grid grid-cols-2 gap-2', children: fotoCedula.map((file, index) => (_jsxs("div", { className: 'relative border rounded p-2 flex items-center', children: [_jsx("div", { className: 'truncate flex-1', children: file.name }), _jsx(Button, { type: 'button', variant: 'ghost', size: 'icon', className: 'h-8 w-8', onClick: () => removeFile(index, fotoCedula, setFotoCedula), children: _jsx(X, { className: 'h-4 w-4' }) })] }, index))) }), fotoCedula.length < 2 && (_jsx("div", { className: 'flex items-center justify-center border border-dashed rounded-lg p-4', children: _jsxs("label", { className: 'cursor-pointer flex flex-col items-center gap-2', children: [_jsx(ImagePlus, { className: 'h-8 w-8 text-muted-foreground' }), _jsx("span", { className: 'text-sm text-muted-foreground', children: "Haz clic para subir fotos de c\u00E9dula" }), _jsx(Input, { type: 'file', accept: ACCEPTED_IMAGE_TYPES.join(','), onChange: (e) => handleFileChange(e, setFotoCedula, 2), className: 'hidden', multiple: true })] }) }))] })] }), _jsxs("div", { children: [_jsx(FormLabel, { children: "Fotos del Contrato (opcional, 10 m\u00E1ximo)" }), _jsx(FormDescription, { children: "Sube fotos claras del contrato firmado si est\u00E1 disponible" }), _jsxs("div", { className: 'mt-2 flex flex-col gap-2', children: [_jsx("div", { className: 'grid grid-cols-2 gap-2', children: fotoContrato.map((file, index) => (_jsxs("div", { className: 'relative border rounded p-2 flex items-center', children: [_jsx("div", { className: 'truncate flex-1', children: file.name }), _jsx(Button, { type: 'button', variant: 'ghost', size: 'icon', className: 'h-8 w-8', onClick: () => removeFile(index, fotoContrato, setFotoContrato), children: _jsx(X, { className: 'h-4 w-4' }) })] }, index))) }), fotoContrato.length < 10 && (_jsx("div", { className: 'flex items-center justify-center border border-dashed rounded-lg p-4', children: _jsxs("label", { className: 'cursor-pointer flex flex-col items-center gap-2', children: [_jsx(Upload, { className: 'h-8 w-8 text-muted-foreground' }), _jsx("span", { className: 'text-sm text-muted-foreground', children: "Haz clic para subir fotos del contrato" }), _jsx(Input, { type: 'file', accept: ACCEPTED_IMAGE_TYPES.join(','), onChange: (e) => handleFileChange(e, setFotoContrato, 10), className: 'hidden', multiple: true })] }) }))] })] })] }), _jsxs(CardFooter, { className: 'flex justify-end px-0 pt-4', children: [_jsx(Button, { type: 'button', variant: 'outline', className: 'mr-2', onClick: () => navigate('/ventas/pre-registros'), children: "Cancelar" }), _jsxs(Button, { type: 'submit', disabled: loading || uploading, children: [(loading || uploading) && (_jsx(Loader2, { className: 'mr-2 h-4 w-4 animate-spin' })), "Crear Pre-Registro"] })] })] }) }) })] }));
}
