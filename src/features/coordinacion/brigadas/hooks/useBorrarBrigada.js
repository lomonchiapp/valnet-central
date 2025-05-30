import { database } from '@/firebase';
import { addDoc, collection, deleteDoc, doc } from 'firebase/firestore';
import { toast } from 'sonner';
export function useBorrarBrigada() {
    return async ({ brigada, motivo, usuario }) => {
        try {
            const eliminacion = {
                fecha: new Date().toISOString(),
                usuarioId: usuario.id,
                usuarioNombre: usuario.nombres || usuario.email || 'Usuario',
                motivo,
                entidad: 'brigada',
                entidadId: brigada.id,
                datosEliminados: brigada,
            };
            await addDoc(collection(database, 'eliminaciones'), eliminacion);
            await deleteDoc(doc(database, 'brigadas', brigada.id));
        }
        catch (error) {
            //eslint-disable-next-line no-console
            console.error(error);
            toast.error('Error al eliminar la brigada');
        }
    };
}
