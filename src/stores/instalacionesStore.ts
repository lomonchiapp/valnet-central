import { create } from 'zustand'
import type { InstalacionConCliente } from '@/api/hooks/useInstalacionesConClientes'

interface InstalacionesState {
  instalaciones: InstalacionConCliente[]
  setInstalaciones: (instalaciones: InstalacionConCliente[]) => void
  clearInstalaciones: () => void
}

export const useInstalacionesStore = create<InstalacionesState>()((set) => ({
  instalaciones: [],
  setInstalaciones: (instalaciones) => set({ instalaciones }),
  clearInstalaciones: () => set({ instalaciones: [] }),
})) 