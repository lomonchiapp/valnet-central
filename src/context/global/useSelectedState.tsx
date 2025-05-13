import { Citizen, Invoice, Payment, RaffleItem, Service, Task, User } from "@/types"
import { Sector } from "@/types/interfaces/sector"
import { create } from "zustand"

interface SelectedState {
    selectedCitizen: Citizen | null
    selectedInvoice: Invoice | null
    selectedPayment: Payment | null
    selectedTask: Task | null
    selectedUser: User | null
    editMode: boolean
    selectedService: Service | null
    selectedRaffleItem: RaffleItem | null
    selectedSector: Sector | null
    setSelectedCitizen: (citizen: Citizen | null) => void
    setSelectedSector: (sector: Sector | null) => void
    setSelectedInvoice: (invoice: Invoice | null) => void
    setSelectedPayment: (payment: Payment | null) => void
    setSelectedTask: (task: Task | null) => void
    setSelectedUser: (user: User | null) => void
    setSelectedService: (service: Service | null) => void
    setSelectedRaffleItem: (raffleItem: RaffleItem | null) => void
    setEditMode: (editMode: boolean) => void
}

export const useSelectedState = create<SelectedState>()((set) => ({
    selectedCitizen: null,
    selectedInvoice: null,
    selectedPayment: null,
    selectedTask: null,
    selectedUser: null,
    editMode: false,
    selectedService: null,  
    selectedRaffleItem: null,
    selectedSector: null,
    setSelectedCitizen: (citizen: Citizen | null) => set({ selectedCitizen: citizen }),
    setSelectedInvoice: (invoice: Invoice | null) => set({ selectedInvoice: invoice }),
    setSelectedPayment: (payment: Payment | null) => set({ selectedPayment: payment }),
    setSelectedTask: (task: Task | null) => set({ selectedTask: task }),
    setSelectedUser: (user: User | null) => set({ selectedUser: user }),
    setSelectedService: (service: Service | null) => set({ selectedService: service }),
    setSelectedRaffleItem: (raffleItem: RaffleItem | null) => set({ selectedRaffleItem: raffleItem }),
    setSelectedSector: (sector: Sector | null) => set({ selectedSector: sector }),
    setEditMode: (editMode: boolean) => set({ editMode })
}))