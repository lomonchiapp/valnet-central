import { useState } from 'react';
import { database } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
export function useUpdateUsuario() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const updateUsuario = async (uid, usuario) => {
        setLoading(true);
        setError(null);
        try {
            const usuarioData = {
                ...usuario,
                updatedAt: new Date(),
            };
            await updateDoc(doc(database, 'usuarios', uid), usuarioData);
            setLoading(false);
            return { success: true };
        }
        catch (err) {
            let message = 'Error desconocido';
            if (err instanceof Error)
                message = err.message;
            setError(message);
            setLoading(false);
            return { success: false, error: message };
        }
    };
    return { updateUsuario, loading, error };
}
