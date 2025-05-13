import { Task, Citizen, Payment, Invoice, RaffleItem, ServiceCategory, Service, ServiceAssignment, User} from "@/types";
import { create } from "zustand";
import { onSnapshot, collection } from "firebase/firestore";
import {database} from "@/firebase";
import { RecurringInvoice } from "@/types/interfaces/recurringInvoice";
import { Sector } from "@/types/interfaces/sector";

// Este es el estado global de la aplicación
// En este vamos a almacenar todos los datos
interface GlobalState {
    citizens: Citizen[]
    users: User[]
    payments: Payment[]
    invoices: Invoice[]
    recurringInvoices: RecurringInvoice[]
    tasks: Task[]
    services: Service[]
    serviceCategories: ServiceCategory[]
    raffleItems: RaffleItem[]
    serviceAssignments: ServiceAssignment[]
    sectors: Sector[]
    setServiceCategories: (serviceCategories: ServiceCategory[]) => void
    setServiceAssignments: (serviceAssignments: ServiceAssignment[]) => void
    setCitizens: (citizens: Citizen[]) => void
    setPayments: (payments: Payment[]) => void
    setInvoices: (invoices: Invoice[]) => void
    setTasks: (tasks: Task[]) => void
    setServices: (services: Service[]) => void
    setRecurringInvoices: (recurringInvoices: RecurringInvoice[]) => void
    setRaffleItems: (raffleItems: RaffleItem[]) => void
    subscribeToServiceAssignments: () => () => void
    subscribeToCitizens: () => () => void
    subscribeToServices: () => () => void
    subscribeToRaffleItems: () => () => void
    subscribeToInvoices: () => () => void
    subscribeToRecurringInvoices: () => () => void
    subscribeToPayments: () => () => void
    subscribeToSectors: () => () => void
    subscribeToUsers: () => () => void
}



export const useGlobalState = create<GlobalState>()((set) => ({
    citizens: [],
    payments: [],
    sectors: [],
    invoices: [],
    recurringInvoices:[],
    tasks: [],
    services: [],
    serviceCategories: [],
    serviceAssignments: [],
    raffleItems: [],
    users: [],
    setRecurringInvoices: (recurringInvoices: RecurringInvoice[]) => set({ recurringInvoices }),
    setCitizens: (citizens: Citizen[]) => set({ citizens }),
    setPayments: (payments: Payment[]) => set({ payments }),
    setInvoices: (invoices: Invoice[]) => set({ invoices }),
    setTasks: (tasks: Task[]) => set({ tasks }),
    setUsers: (users: User[]) => set({ users }),
    setServices: (services: Service[]) => set({ services }),
    setServiceCategories: (serviceCategories: ServiceCategory[]) => set({ serviceCategories }),
    setServiceAssignments: (serviceAssignments: ServiceAssignment[]) => set({ serviceAssignments }),
    setRaffleItems: (raffleItems: RaffleItem[]) => set({ raffleItems }),
    subscribeToCitizens: () => {
        const unsubscribe = onSnapshot(collection(database, 'citizens'), (snapshot) => {
            set({ citizens: snapshot.docs.map((doc) => doc.data() as Citizen) })
        })
        return unsubscribe
    },
    subscribeToServices: () => {
        const unsubscribe = onSnapshot(collection(database, 'services'), (snapshot) => {
            set({ services: snapshot.docs.map((doc) => doc.data() as Service) })
        })
        return unsubscribe
    },
    subscribeToRaffleItems: () => {
        const unsubscribe = onSnapshot(collection(database, 'raffleItems'), (snapshot) => {
            set({ raffleItems: snapshot.docs.map((doc) => doc.data() as RaffleItem) })
        })
        return unsubscribe
    },
    subscribeToServiceAssignments: () => {
        const unsubscribe = onSnapshot(collection(database, 'serviceAssignments'), (snapshot) => {
            set({ serviceAssignments: snapshot.docs.map((doc) => doc.data() as ServiceAssignment) })
        })
        return unsubscribe
    },
    subscribeToInvoices: () => {
        const unsubscribe = onSnapshot(collection(database, 'invoices'), (snapshot) => {
            set({ invoices: snapshot.docs.map((doc) => doc.data() as Invoice) })
        })
        return unsubscribe
    },
    subscribeToRecurringInvoices: () => {
        const unsubscribe = onSnapshot(collection(database, 'recurringInvoices'), (snapshot) => {
            set({ recurringInvoices: snapshot.docs.map((doc) => doc.data() as RecurringInvoice) })
        })
        return unsubscribe
    },
    subscribeToPayments: () => {
        const unsubscribe = onSnapshot(collection(database, 'payments'), (snapshot) => {
            set({ payments: snapshot.docs.map((doc) => doc.data() as Payment) })
        })
        return unsubscribe
    },
    subscribeToSectors: () => {
        const unsubscribe = onSnapshot(collection(database, 'sectors'), (snapshot) => {
            set({ sectors: snapshot.docs.map((doc) => doc.data() as Sector) })
        })
        return unsubscribe
    },
    subscribeToUsers: () => {
        const unsubscribe = onSnapshot(collection(database, 'users'), (snapshot) => {
            set({ users: snapshot.docs.map((doc) => doc.data() as User) })
        })
        return unsubscribe
    },
    subscribeToTasks: () => {
        const unsubscribe = onSnapshot(collection(database, 'tasks'), (snapshot) => {
            set({ tasks: snapshot.docs.map((doc) => doc.data() as Task) })
        })
        return unsubscribe
    }
}))

