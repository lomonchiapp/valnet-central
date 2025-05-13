import { addDoc, collection, doc, updateDoc } from 'firebase/firestore'
import { database } from '@/firebase'
import { RecurringInvoice} from '@/types'


export const createRecurringInvoice = async (invoice: RecurringInvoice) => {
  try {
    const invoiceRef = await addDoc(collection(database, 'recurringInvoices'), {
      ...invoice,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    await updateDoc(doc(database, 'recurringInvoices', invoiceRef.id), {
      id: invoiceRef.id
    })

    return invoiceRef.id
  } catch (error) {
    throw new Error(`Error al crear factura: ${error instanceof Error ? error.message : 'Error desconocido'}`)
  }
} 