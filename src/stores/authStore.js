import { create } from 'zustand';
export const useAuthStore = create((set) => ({
    user: null,
    isLoading: true,
    setUser: (user) => set({ user }),
    setIsLoading: (isLoading) => set({ isLoading }),
}));
// Helper para acceder al estado desde fuera de componentes React
export const getAuthState = () => useAuthStore.getState();
// export const useAuth = () => useAuthStore((state) => state.auth)
