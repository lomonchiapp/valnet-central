import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { database } from '@/firebase';
import { FIREBASE_AUTH } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthStore();
    useEffect(() => {
        if (user) {
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        }
    }, [user, navigate, location]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
            // Actualizar status a 'Online' en Firestore
            const { user } = userCredential;
            await updateDoc(doc(database, 'usuarios', user.uid), { status: 'Online' });
            // La redirección se manejará en el useEffect cuando el usuario se actualice
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error al iniciar sesión:', error);
            toast({
                variant: 'destructive',
                title: 'Error al iniciar sesión',
                description: 'Credenciales inválidas. Por favor, intente de nuevo.',
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("div", { className: 'min-h-screen max-h-screen w-full flex', children: [_jsxs(motion.div, { initial: { opacity: 0, x: -50 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.5 }, className: 'hidden lg:block w-1/2 relative', children: [_jsx("div", { className: 'absolute inset-0 bg-gradient-to-r from-[#006680]/80 to-[#006680]/80 mix-blend-multiply' }), _jsx("img", { src: '/images/bglogin.jpg', alt: 'bglogin', className: 'h-full w-full object-cover' }), _jsx("div", { className: 'absolute inset-0 flex flex-col justify-center items-center text-white p-12' })] }), _jsx(motion.div, { initial: { opacity: 0, x: 50 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.5 }, className: 'w-full lg:w-1/2 flex items-center justify-center p-8 bg-white', children: _jsxs("div", { className: 'w-full max-w-md space-y-8', children: [_jsxs("div", { className: 'text-center', children: [_jsx(motion.img, { initial: { scale: 0.5, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0.5 }, src: '/valdesk-logo.png', alt: 'Logo', className: 'h-16 mx-auto mb-8' }), _jsx(motion.p, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3, duration: 0.5 }, className: 'text-gray-500', children: "Ingrese sus credenciales para acceder al sistema" })] }), _jsxs(motion.form, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4, duration: 0.5 }, onSubmit: handleSubmit, className: 'mt-8 space-y-6', children: [_jsxs("div", { className: 'space-y-4', children: [_jsxs("div", { children: [_jsx("label", { className: 'block text-sm font-medium text-gray-700 mb-1', children: "Correo Valnet" }), _jsx(Input, { required: true, type: 'email', placeholder: 'correo@valnetrd.com', value: email, onChange: (e) => setEmail(e.target.value), className: 'h-12' })] }), _jsxs("div", { children: [_jsx("label", { className: 'block text-sm font-medium text-gray-700 mb-1', children: "Contrase\u00F1a" }), _jsx(Input, { required: true, type: 'password', value: password, onChange: (e) => setPassword(e.target.value), className: 'h-12' })] })] }), _jsx(Button, { type: 'submit', className: 'w-full h-12 bg-[#005BAA] hover:bg-[#0c4373] transition-colors', disabled: isLoading, children: isLoading ? (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: 'flex items-center space-x-2', children: [_jsx("div", { className: 'w-5 h-5 border-t-2 border-white rounded-full animate-spin' }), _jsx("span", { children: "Valnetizando..." })] })) : ('Iniciar Sesión') })] })] }) })] }));
}
