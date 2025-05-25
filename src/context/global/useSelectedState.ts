import { create } from "zustand"
import { User } from "@/types"

interface SelectedState {
    selectedUser: User | null
    setSelectedUser: (user: User | null) => void
}

export const useSelectedState = create<SelectedState>()((set) => ({
    selectedUser: null,
    setSelectedUser: (user) => set({ selectedUser: user })
}))