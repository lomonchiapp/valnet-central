import { create } from "zustand"

interface AddNewState {
    //valnet
    newUser: boolean
    newCliente: boolean
    //ventas
    newPreRegistro: boolean
    newPago: boolean
    newPlanInternet: boolean
    newArticulo: boolean
    newInventario: boolean
    newBrigada: boolean
    newTicket: boolean
    newProveedor: boolean
    setNewUser: (newUser: boolean) => void
    setNewCliente: (newCliente: boolean) => void
    setNewPreRegistro: (newPreRegistro: boolean) => void
    setNewPago: (newPago: boolean) => void
    setNewPlanInternet: (newPlanInternet: boolean) => void
    setNewArticulo: (newArticulo: boolean) => void
    setNewInventario: (newInventario: boolean) => void
    setNewBrigada: (newBrigada: boolean) => void
    setNewTicket: (newTicket: boolean) => void
    setNewProveedor: (newProveedor: boolean) => void
}

export const useAddNewState = create<AddNewState>()((set) => ({
    newUser: false,
    newCliente: false,
    newPreRegistro: false,
    newPago: false,
    newPlanInternet: false,
    newArticulo: false,
    newInventario: false,
    newBrigada: false,
    newTicket: false,
    newProveedor: false,
    setNewProveedor: (newProveedor: boolean) => set({ newProveedor }),
    setNewUser: (newUser: boolean) => set({ newUser }),
    setNewCliente: (newCliente: boolean) => set({ newCliente }),
    setNewPreRegistro: (newPreRegistro: boolean) => set({ newPreRegistro }),
    setNewPago: (newPago: boolean) => set({ newPago }),
    setNewPlanInternet: (newPlanInternet: boolean) => set({ newPlanInternet }),
    setNewArticulo: (newArticulo: boolean) => set({ newArticulo }),
    setNewInventario: (newInventario: boolean) => set({ newInventario }),
    setNewBrigada: (newBrigada: boolean) => set({ newBrigada }),
    setNewTicket: (newTicket: boolean) => set({ newTicket }),
}))