import { database } from "@/firebase"
import { Payment, RecurringInvoice } from "@/types"
import { PaymentStatus, PaymentMethod, InvoiceStatus } from "@/types/enums"
import { addDoc, collection, doc, getDoc, updateDoc, query, where, getDocs } from "firebase/firestore"

interface AddPaymentToInvoiceParams {
  invoiceId: string
  amount: number
  paymentMethod: PaymentMethod
  citizenId: string
  userId: string
}

interface AddPaymentResponse {
  success: boolean;
  paymentId: string;
}

export const addPaymentToInvoice = async ({
  invoiceId,
  amount,
  paymentMethod,
  citizenId,
  userId
}: AddPaymentToInvoiceParams): Promise<AddPaymentResponse> => {
  try {
    // 1. Obtener la factura recurrente
    const recurringInvoiceRef = collection(database, "recurringInvoices")
    const q = query(recurringInvoiceRef, where("id", "==", invoiceId))
    const recurringInvoiceSnap = await getDocs(q)
    
    if (recurringInvoiceSnap.empty) {
      throw new Error("La factura no existe")
    }

    const invoice = recurringInvoiceSnap.docs[0].data() as RecurringInvoice
    const invoiceDocRef = doc(database, "recurringInvoices", recurringInvoiceSnap.docs[0].id)

    if (invoice.status === InvoiceStatus.PAID) {
      throw new Error("Esta factura ya está pagada")
    }

    // 2. Crear el pago
    const payment: Omit<Payment, "id"> = {
      amount,
      invoiceId,
      date: new Date(),
      status: PaymentStatus.CONFIRMED,
      paymentMethod,
      serviceAssignmentId: invoice.serviceAssignmentId,
      citizenId,
      createdBy: userId
    }

    const paymentDoc = await addDoc(collection(database, "payments"), {
      ...payment,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId
    })

    // 3. Actualizar estado de la factura
    await updateDoc(invoiceDocRef, {
      status: InvoiceStatus.PAID,
      paymentDate: new Date(),
      paymentId: paymentDoc.id,
      updatedAt: new Date(),
      updatedBy: userId
    })

    // 4. Actualizar deuda del ciudadano
    const citizenRef = doc(database, "citizens", citizenId)
    const citizenSnap = await getDoc(citizenRef)

    if (!citizenSnap.exists()) {
      throw new Error("El ciudadano no existe")
    }

    const currentDebt = citizenSnap.data().totalDebt || 0
    await updateDoc(citizenRef, {
      totalDebt: currentDebt - amount,
      updatedAt: new Date(),
      updatedBy: userId
    })

    return {
      success: true,
      paymentId: paymentDoc.id
    }
  } catch (error) {
    //eslint-disable-next-line no-console
    console.error("Error al procesar el pago:", error)
    throw error
  }
}
