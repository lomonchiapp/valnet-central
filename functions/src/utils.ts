import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'DOP',
  }).format(amount)
}

export function calculateNextPaymentDate(startDate: Date, paymentDay: number): Date {
  const nextDate = new Date(startDate)
  nextDate.setDate(paymentDay)
  
  // Si el día de pago ya pasó este mes, avanzar al siguiente mes
  if (startDate.getDate() > paymentDay) {
    nextDate.setMonth(nextDate.getMonth() + 1)
  }
  
  return nextDate
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-ES').format(date)
}

//Generador de numeros de facturas recurrentes en base a la fecha y hora. corta y amigable.

export function generateInvoiceNumber() {
  const prefix = 'FC'
  //TOMAR EL PRIMER CARACTER DE AÑO, MES, DIA, HORA, MINUTO
  const date = new Date()
  const year = date.getFullYear().toString().slice(0, 1)  
  const month = (date.getMonth() + 1).toString().slice(0, 1)
  const day = date.getDate().toString().slice(0, 1)
  const hour = date.getHours().toString().slice(0, 1)
  const minute = date.getMinutes().toString().slice(0, 1)
  return `${prefix}-${year}${month}${day}${hour}${minute}`
}

//Generador de numeros de pagos en base al numero de factura. corta y amigable.

export function generatePaymentNumber(invoiceNumber: string) {
  const prefix = 'PAG'
  //TOMAR LOS 4 ULTIMOS CARACTERES DEL NUMERO DE FACTURA
  const lastFour = invoiceNumber.slice(-4)
  return `${prefix}${lastFour}`
}
