import { create } from 'zustand'
import { WallNetPost, WallNetCategory } from '@/types/interfaces/valnet/wallNet'

interface WallNetState {
  posts: WallNetPost[]
  categories: WallNetCategory[]
  loading: boolean
  setPosts: (posts: WallNetPost[]) => void
  setCategories: (categories: WallNetCategory[]) => void
  setLoading: (loading: boolean) => void
  clear: () => void
}

export const useWallNetStore = create<WallNetState>((set) => ({
  posts: [],
  categories: [],
  loading: false,
  setPosts: (posts) => set({ posts }),
  setCategories: (categories) => set({ categories }),
  setLoading: (loading) => set({ loading }),
  clear: () => set({ posts: [], categories: [], loading: false })
})) 