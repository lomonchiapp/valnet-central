import { database } from '@/firebase';
import { EstadoNotificacion, } from '@/types/interfaces/notificaciones/notificacion';
import { doc, collection, setDoc, query, where, orderBy, getDocs, updateDoc, } from 'firebase/firestore';
import { toast } from 'sonner';
export const useCrearNotificacion = () => {
    const crearNotificacion = async (notificacion) => {
        try {
            const docRef = doc(collection(database, 'notificaciones'));
            await setDoc(docRef, {
                ...notificacion,
                id: docRef.id,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            return docRef.id;
        }
        catch (error) {
            console.error('Error al crear la notificación:', error);
            toast.error('Error al crear la notificación');
            throw error;
        }
    };
    return { crearNotificacion };
};
export const useObtenerNotificaciones = () => {
    const obtenerNotificaciones = async (estado) => {
        try {
            let q = query(collection(database, 'notificaciones'), orderBy('fechaNotificacion', 'desc'));
            if (estado) {
                q = query(q, where('estado', '==', estado));
            }
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map((doc) => doc.data());
        }
        catch (error) {
            console.error('Error al obtener las notificaciones:', error);
            toast.error('Error al obtener las notificaciones');
            throw error;
        }
    };
    return { obtenerNotificaciones };
};
export const useMarcarNotificacionLeida = () => {
    const marcarNotificacionLeida = async (id, userId) => {
        try {
            const notificacionRef = doc(database, 'notificaciones', id);
            const notificacionDoc = await getDocs(query(collection(database, 'notificaciones'), where('id', '==', id)));
            if (!notificacionDoc.empty) {
                const notificacion = notificacionDoc.docs[0].data();
                const leidaPor = notificacion.leidaPor || [];
                if (!leidaPor.includes(userId)) {
                    await updateDoc(notificacionRef, {
                        leidaPor: [...leidaPor, userId],
                        estado: EstadoNotificacion.LEIDA,
                        updatedAt: new Date(),
                    });
                }
            }
        }
        catch (error) {
            console.error('Error al marcar la notificación como leída:', error);
            toast.error('Error al marcar la notificación como leída');
            throw error;
        }
    };
    return { marcarNotificacionLeida };
};
export const useArchivarNotificacion = () => {
    const archivarNotificacion = async (id) => {
        try {
            const notificacionRef = doc(database, 'notificaciones', id);
            await updateDoc(notificacionRef, {
                estado: EstadoNotificacion.ARCHIVADA,
                updatedAt: new Date(),
            });
        }
        catch (error) {
            console.error('Error al archivar la notificación:', error);
            toast.error('Error al archivar la notificación');
            throw error;
        }
    };
    return { archivarNotificacion };
};
