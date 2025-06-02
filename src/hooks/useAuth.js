import { useState, useEffect } from 'react';
import { database } from '@/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    // Obtener datos adicionales del usuario desde Firestore
                    const userDoc = await getDoc(doc(database, 'usuarios', firebaseUser.uid));
                    if (userDoc.exists()) {
                        setUser({
                            id: firebaseUser.uid,
                            ...userDoc.data(),
                        });
                    }
                    else {
                        setUser(null);
                    }
                }
                else {
                    setUser(null);
                }
            }
            catch (err) {
                setError(err);
                setUser(null);
            }
            finally {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);
    return { user, loading, error };
}
