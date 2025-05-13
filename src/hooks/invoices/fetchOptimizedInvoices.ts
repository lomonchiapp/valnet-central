import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore'
import { database } from '@/firebase'
import { Invoice } from '@/types/interfaces/facturacion/factura'

export const fetchOptimizedInvoices = async (citizenId: string) => {
  try {
    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + 15)

    // Consulta para facturas vencidas y próximas a vencer
    const invoicesRef = collection(database, 'invoices')
    const q = query(
      invoicesRef,
      where('citizenId', '==', citizenId),
      where('dueDate', '<=', Timestamp.fromDate(futureDate)),
      orderBy('dueDate', 'desc')
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Invoice[]

  } catch (error) {
    console.error('Error fetching invoices:', error)
    throw error
  }
} 