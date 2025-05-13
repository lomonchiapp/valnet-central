import { PaymentStatus, RecurringInvoiceFrequency, RecurringInvoiceStatus } from "../enums"

export interface InvoiceSchedule{
    id?: string
    amount: number
    dueDate: Date | string
    isLate?: boolean
    remainingBalance: number
    status: PaymentStatus
    paidAmount?: number
}

export interface RecurringInvoice {
  id: string
  serviceAssignmentId: string
  invoiceNumber: string
  citizenId: string
  amount: number
  description: string
  startDate: Date
  paymentDay: number
  frequency: RecurringInvoiceFrequency
  status: RecurringInvoiceStatus
  createdAt: Date
  isOverdue?: boolean
  daysOverdue?: number
  updatedAt: Date
  lastInvoiceDate?: Date
  nextInvoiceDate: Date
} 