import { create } from 'zustand';
export const useWallNetStore = create((set) => ({
    posts: [],
    categories: [],
    loading: false,
    setPosts: (posts) => set({ posts }),
    setCategories: (categories) => set({ categories }),
    setLoading: (loading) => set({ loading }),
    clear: () => set({ posts: [], categories: [], loading: false }),
}));
