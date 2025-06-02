import { database } from '@/firebase';
import { updateDoc, doc } from 'firebase/firestore';
import { toast } from 'sonner';
export function useUpdateBrigada() {
    return async (id, values) => {
        try {
            await updateDoc(doc(database, 'brigadas', id), {
                ...values,
                updatedAt: new Date(),
            });
        }
        catch (error) {
            console.error(error);
            toast.error('Error al actualizar la brigada');
        }
    };
}
