import { collection, getDocs, updateDoc, Timestamp } from 'firebase/firestore'
import { database } from '@/firebase'
import { EstadoFactura } from 'shared-types'

export const updateOverdueInvoice = async () => {
  try {
    const today = new Date()
    
    // Consultar todas las facturas pendientesiuo
    const invoicesRef = collection(database, 'recurringInvoices')
    const querySnapshot = await getDocs(invoicesRef)

    const overdueInvoices = querySnapshot.docs.filter(doc => {
      const data = doc.data()
      if (data.status !== EstadoFactura.NO_PAGADA) return false

      const dueDate = new Date((data.dueDate as Timestamp).seconds * 1000)
      return dueDate < today
    })

    //eslint-disable-next-line no-console
    console.log('Facturas vencidas encontradas:', overdueInvoices.map(doc => ({
      id: doc.id,
      dueDate: new Date((doc.data().dueDate as Timestamp).seconds * 1000),
      status: doc.data().status
    })))

    // Actualizar estado a vencido
    const updatePromises = overdueInvoices.map(doc => {
      const dueDate = new Date((doc.data().dueDate as Timestamp).seconds * 1000)
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      
      return updateDoc(doc.ref, {
        status: EstadoFactura.NO_PAGADA,
        isOverdue: true,
        daysOverdue,
        updatedAt: Timestamp.fromDate(new Date())
      })
    })

    await Promise.all(updatePromises)

  } catch (error) {
    //eslint-disable-next-line no-console
    console.error('Error updating overdue invoices:', error)
    throw error
  }
}
