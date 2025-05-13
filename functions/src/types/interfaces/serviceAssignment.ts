import { ServiceAssignmentStatus } from "../enums"
import { InvoiceSchedule } from "./recurringInvoice"

export interface ServiceAssignment {
    id: string
    citizenId: string // Relación con el ciudadano
    serviceId: string // Relación con el servicio
    customPrice?: number // Precio fijo asignado por el supervisor
    dimensions?: { width: number, height: number } // Para servicios que requieren cálculo
    calculatedPrice?: number // Precio calculado basado en dimensiones u otros factores
    monthlyPaymentAmount?: number
    paymentSchedule: InvoiceSchedule[] 
    paymentDay?: number
    startDate: Date
    paymentNumbers?: number // meses a pagar
    status: ServiceAssignmentStatus
    endDate?: Date
    description?: string // Descripción para identificar el servicio, como "Letrero en la entrada"
}
