import { database } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useWallNetStore } from '@/stores/wallNetStore';
// Aquí deberías importar tu instancia de Firestore y helpers
// import { db } from '@/firebase'
export function useWallNetCategories() {
    const setCategories = useWallNetStore((s) => s.setCategories);
    const setLoading = useWallNetStore((s) => s.setLoading);
    // Obtener categorías del muro
    const fetchCategories = async () => {
        setLoading(true);
        const snap = await getDocs(collection(database, 'wallNetCategories'));
        const cats = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCategories(cats);
        setLoading(false);
    };
    return { fetchCategories };
}
