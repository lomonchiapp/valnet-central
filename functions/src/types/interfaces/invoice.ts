import { InvoiceStatus } from "../enums"


export interface Invoice {
  id: string
  invoiceNumber: string
  citizenId: string
  serviceAssignmentId: string
  amount: number
  dueDate: Date
  description: string
  status: InvoiceStatus
  createdAt: Date
  updatedAt: Date
  paymentDate?: Date
  paymentReference?: string
}