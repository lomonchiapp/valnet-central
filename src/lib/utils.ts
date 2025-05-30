import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace('DOP', 'RD$')
    .replace(',', '.')
}

export function calculateNextPaymentDate(
  startDate: Date,
  paymentDay: number
): Date {
  const nextDate = new Date(startDate)

  // Siempre avanzar al siguiente mes
  nextDate.setMonth(nextDate.getMonth() + 1)

  // Ajustar al día de pago
  nextDate.setDate(paymentDay)

  // Si el día de pago es anterior al día actual, avanzar otro mes
  if (nextDate < startDate) {
    nextDate.setMonth(nextDate.getMonth() + 1)
  }

  return nextDate
}

export function formatDate(
  date: Date | string | number | { seconds: number; nanoseconds: number },
  format = 'DD/MM/YYYY'
): string {
  let d: Date

  if (typeof date === 'object' && 'seconds' in date) {
    // Si es un timestamp de Firebase
    d = new Date(date.seconds * 1000)
  } else if (typeof date === 'string' || typeof date === 'number') {
    // Si es un string o número
    d = new Date(date)
  } else if (date instanceof Date) {
    // Si ya es un objeto Date
    d = date
  } else {
    return 'Fecha inválida'
  }

  if (isNaN(d.getTime())) return 'Fecha inválida'

  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()

  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', String(year))
}

//Generador de numeros de facturas recurrentes en base a la fecha y hora. corta y amigable.

export function generateInvoiceNumber(
  paymentDay: number,
  paymentDate: Date,
  citizenId: string
) {
  const prefix = 'FC'
  const month = (paymentDate.getMonth() + 1).toString().padStart(2, '0')
  const day = paymentDay.toString().padStart(2, '0')
  const citizenSuffix = citizenId.slice(-2)

  return `${prefix}${month}${day}${citizenSuffix}`
}

//Generador de numeros de pagos en base al numero de factura. corta y amigable.

export function generatePaymentNumber(invoiceNumber: string) {
  const prefix = 'PAG'
  //TOMAR LOS 4 ULTIMOS CARACTERES DEL NUMERO DE FACTURA
  const lastFour = invoiceNumber.slice(-4)
  return `${prefix}${lastFour}`
}

//Generador de codigo de ciudadano en base al createdAt y el id del ciudadano

export function generateCitizenCode(createdAt: Date, id: string) {
  const prefix = 'CT'
  const year = createdAt.getFullYear().toString().slice(-2)
  const citizenId = id.slice(-4)
  return `${prefix}${year}${citizenId}`
}
