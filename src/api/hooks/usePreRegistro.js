import { useState } from 'react';
import { database as db } from '@/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '../client';
import { ENDPOINTS, API_TOKEN } from '../config';
export const usePreRegistro = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuthStore();
    const crearPreRegistro = async (preRegistroData) => {
        setLoading(true);
        setError(null);
        try {
            // Preparar datos para Mikrowisp
            const mikrowispData = {
                token: API_TOKEN,
                cliente: preRegistroData.cliente,
                cedula: preRegistroData.cedula,
                direccion: preRegistroData.direccion,
                telefono: preRegistroData.telefono,
                movil: preRegistroData.movil,
                email: preRegistroData.email,
                ...(preRegistroData.notas ? { notas: preRegistroData.notas } : {}),
                fecha_instalacion: preRegistroData.fecha_instalacion,
            };
            // Enviar a Mikrowisp
            await apiClient.post(ENDPOINTS.NUEVO_PREREGISTRO, mikrowispData);
            // Guardar en Firestore con datos adicionales
            const firestoreData = {
                ...preRegistroData,
                createdAt: new Date(),
                updatedAt: new Date(),
                vendedorId: user?.id || '',
                estado: 'pendiente',
            };
            const docRef = await addDoc(collection(db, 'preRegistros'), firestoreData);
            return {
                mikrowispSuccess: true,
                firestoreId: docRef.id,
            };
        }
        catch (err) {
            setError(err instanceof Error
                ? err
                : new Error('Error desconocido al crear pre-registro'));
            return { mikrowispSuccess: false };
        }
        finally {
            setLoading(false);
        }
    };
    const misPreRegistros = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!user?.id) {
                throw new Error('Usuario no autenticado');
            }
            const q = query(collection(db, 'preRegistros'), where('vendedorId', '==', user.id));
            const snapshot = await getDocs(q);
            const preRegistros = [];
            snapshot.forEach((doc) => {
                preRegistros.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });
            return preRegistros;
        }
        catch (err) {
            setError(err instanceof Error
                ? err
                : new Error('Error desconocido al obtener pre-registros'));
            return [];
        }
        finally {
            setLoading(false);
        }
    };
    return {
        loading,
        error,
        crearPreRegistro,
        misPreRegistros,
    };
};
