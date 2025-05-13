import { create } from "zustand"

interface AddNewState {
    //valnet
    newUsuario: boolean
    newCliente: boolean
    //ventas
    newPreRegistro: boolean
    newPago: boolean
    newPlanInternet: boolean
    newArticulo: boolean
    newInventario: boolean
    newBrigada: boolean
    newTicket: boolean
    setNewUsuario: (newUsuario: boolean) => void
    setNewCliente: (newCliente: boolean) => void
    setNewPreRegistro: (newPreRegistro: boolean) => void
    setNewPago: (newPago: boolean) => void
    setNewPlanInternet: (newPlanInternet: boolean) => void
    setNewArticulo: (newArticulo: boolean) => void
    setNewInventario: (newInventario: boolean) => void
    setNewBrigada: (newBrigada: boolean) => void
    setNewTicket: (newTicket: boolean) => void
}

export const useAddNewState = create<AddNewState>()((set) => ({
    newUsuario: false,
    newCliente: false,
    newPreRegistro: false,
    newPago: false,
    newPlanInternet: false,
    newArticulo: false,
    newInventario: false,
    newBrigada: false,
    newTicket: false,
    setNewUsuario: (newUsuario: boolean) => set({ newUsuario }),
    setNewCliente: (newCliente: boolean) => set({ newCliente }),
    setNewPreRegistro: (newPreRegistro: boolean) => set({ newPreRegistro }),
    setNewPago: (newPago: boolean) => set({ newPago }),
    setNewPlanInternet: (newPlanInternet: boolean) => set({ newPlanInternet }),
    setNewArticulo: (newArticulo: boolean) => set({ newArticulo }),
    setNewInventario: (newInventario: boolean) => set({ newInventario }),
    setNewBrigada: (newBrigada: boolean) => set({ newBrigada }),
    setNewTicket: (newTicket: boolean) => set({ newTicket }),
}))