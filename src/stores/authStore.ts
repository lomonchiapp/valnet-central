import { Usuario } from '@/types'
import { create } from 'zustand'

interface AuthState {
  user: Usuario | null
  isLoading: boolean
  setUser: (user: Usuario | null) => void
  setIsLoading: (isLoading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setIsLoading: (isLoading) => set({ isLoading }),
}))

// Helper para acceder al estado desde fuera de componentes React
export const getAuthState = () => useAuthStore.getState()

// export const useAuth = () => useAuthStore((state) => state.auth)
