import { database } from '@/firebase';
import { addDoc, collection, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
export function useCrearBrigada() {
    return async (values) => {
        try {
            const newBrigada = {
                ...values,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const docRef = await addDoc(collection(database, 'brigadas'), newBrigada);
            await updateDoc(docRef, { id: docRef.id });
            return { ...newBrigada, id: docRef.id };
        }
        catch (error) {
            //eslint-disable-next-line no-console
            console.error(error);
            toast.error('Error al crear la brigada');
            return null;
        }
    };
}
