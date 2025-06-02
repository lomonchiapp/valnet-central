import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Camera, Mail, Phone, MapPin } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { storage } from '@/lib/firebase';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
export function PerfilPage() {
    const { user, setUser } = useAuthStore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    if (!user)
        return null;
    const getInitials = (name, lastName) => {
        return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };
    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        try {
            setIsLoading(true);
            const storageRef = ref(storage, `avatars/${user.id}/${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            // Update user in Firestore
            const userRef = doc(db, 'usuarios', user.id);
            await updateDoc(userRef, {
                avatar: downloadURL,
            });
            // Update local state
            setUser({
                ...user,
                avatar: downloadURL,
            });
            toast({
                title: 'Avatar actualizado',
                description: 'Tu foto de perfil ha sido actualizada exitosamente',
            });
        }
        catch (error) {
            console.error('Error al actualizar el avatar:', error);
            toast({
                title: 'Error',
                description: 'Hubo un error al actualizar tu avatar',
                variant: 'destructive',
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: 'container mx-auto py-8', children: _jsxs("div", { className: 'grid gap-8', children: [_jsxs("div", { className: 'flex items-center gap-6', children: [_jsxs("div", { className: 'relative', children: [_jsxs(Avatar, { className: 'h-24 w-24', children: [_jsx(AvatarImage, { src: user.avatar, alt: user.nombres }), _jsx(AvatarFallback, { className: 'text-2xl bg-[#F37021] text-white', children: getInitials(user.nombres, user.apellidos) })] }), _jsxs("label", { htmlFor: 'avatar-upload', className: 'absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-100', children: [_jsx(Camera, { className: 'h-4 w-4 text-gray-600' }), _jsx("input", { id: 'avatar-upload', type: 'file', accept: 'image/*', className: 'hidden', onChange: handleAvatarChange, disabled: isLoading })] })] }), _jsxs("div", { children: [_jsxs("h1", { className: 'text-2xl font-bold', children: [user.nombres, " ", user.apellidos] }), _jsx("p", { className: 'text-gray-500', children: user.email })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: 'w-full', children: [_jsxs(TabsList, { className: 'grid w-full grid-cols-3', children: [_jsx(TabsTrigger, { value: 'general', children: "Informaci\u00F3n General" }), _jsx(TabsTrigger, { value: 'security', children: "Seguridad" }), _jsx(TabsTrigger, { value: 'preferences', children: "Preferencias" })] }), _jsx(TabsContent, { value: 'general', children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Informaci\u00F3n Personal" }), _jsx(CardDescription, { children: "Actualiza tu informaci\u00F3n personal y de contacto" })] }), _jsxs(CardContent, { className: 'space-y-6', children: [_jsxs("div", { className: 'grid grid-cols-2 gap-6', children: [_jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { htmlFor: 'nombres', children: "Nombres" }), _jsx(Input, { id: 'nombres', defaultValue: user.nombres })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { htmlFor: 'apellidos', children: "Apellidos" }), _jsx(Input, { id: 'apellidos', defaultValue: user.apellidos })] })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { htmlFor: 'email', children: "Correo Electr\u00F3nico" }), _jsxs("div", { className: 'flex items-center gap-2', children: [_jsx(Mail, { className: 'h-4 w-4 text-gray-500' }), _jsx(Input, { id: 'email', defaultValue: user.email, disabled: true })] })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { htmlFor: 'telefono', children: "Tel\u00E9fono" }), _jsxs("div", { className: 'flex items-center gap-2', children: [_jsx(Phone, { className: 'h-4 w-4 text-gray-500' }), _jsx(Input, { id: 'telefono', defaultValue: user.telefono || '' })] })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { htmlFor: 'direccion', children: "Direcci\u00F3n" }), _jsxs("div", { className: 'flex items-center gap-2', children: [_jsx(MapPin, { className: 'h-4 w-4 text-gray-500' }), _jsx(Input, { id: 'direccion', defaultValue: user.direccion || '' })] })] }), _jsx("div", { className: 'flex justify-end', children: _jsx(Button, { disabled: isLoading, children: isLoading ? 'Guardando...' : 'Guardar Cambios' }) })] })] }) }), _jsx(TabsContent, { value: 'security', children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Seguridad" }), _jsx(CardDescription, { children: "Actualiza tu contrase\u00F1a y configura la seguridad de tu cuenta" })] }), _jsxs(CardContent, { className: 'space-y-6', children: [_jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { htmlFor: 'current-password', children: "Contrase\u00F1a Actual" }), _jsx(Input, { id: 'current-password', type: 'password' })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { htmlFor: 'new-password', children: "Nueva Contrase\u00F1a" }), _jsx(Input, { id: 'new-password', type: 'password' })] }), _jsxs("div", { className: 'space-y-2', children: [_jsx(Label, { htmlFor: 'confirm-password', children: "Confirmar Nueva Contrase\u00F1a" }), _jsx(Input, { id: 'confirm-password', type: 'password' })] }), _jsx("div", { className: 'flex justify-end', children: _jsx(Button, { disabled: isLoading, children: isLoading ? 'Actualizando...' : 'Actualizar Contraseña' }) })] })] }) }), _jsx(TabsContent, { value: 'preferences', children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Preferencias" }), _jsx(CardDescription, { children: "Configura tus preferencias de notificaciones y privacidad" })] }), _jsx(CardContent, { className: 'space-y-6', children: _jsx("p", { className: 'text-gray-500', children: "Pr\u00F3ximamente..." }) })] }) })] })] }) }));
}
