import { useWallNetStore } from '@/stores/wallNetStore'
import { database } from '@/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { WallNetCategory } from '@/types/interfaces/valnet/wallNet'

// Aquí deberías importar tu instancia de Firestore y helpers
// import { db } from '@/firebase'

export function useWallNetCategories() {
  const setCategories = useWallNetStore((s) => s.setCategories)
  const setLoading = useWallNetStore((s) => s.setLoading)

  // Obtener categorías del muro
  const fetchCategories = async () => {
    setLoading(true)
    const snap = await getDocs(collection(database, 'wallNetCategories'))
    const cats: WallNetCategory[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WallNetCategory))
    setCategories(cats)
    setLoading(false)
  }

  return { fetchCategories }
} 