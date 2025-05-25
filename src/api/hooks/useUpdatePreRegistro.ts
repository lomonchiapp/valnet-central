import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { database as db } from '@/firebase';
import { PreRegistro } from '@/types/interfaces/ventas/preRegistro';

export function useUpdatePreRegistro() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updatePreRegistro = async (id: string, data: Partial<PreRegistro>) => {
    setLoading(true);
    setError(null);
    try {
      const ref = doc(db, 'preRegistros', id);
      await updateDoc(ref, data);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error desconocido al actualizar pre-registro'));
      setLoading(false);
      return false;
    }
  };

  return { updatePreRegistro, loading, error };
} 