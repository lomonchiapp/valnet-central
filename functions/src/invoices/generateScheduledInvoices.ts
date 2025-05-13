import { database } from "../firebase"
import { onSchedule } from "firebase-functions/v2/scheduler"
import { RecurringInvoice, ServiceAssignment } from "../types"
import { collection, getDocs, addDoc, query, where } from "firebase/firestore"
import { generateInvoiceNumber } from "../utils"
import { RecurringInvoiceStatus } from "../types/enums"

// Función programada que se ejecuta cada minuto (para pruebas)
// En producción debería ser "0 0 1 * *" (primer día de cada mes)
export const generateScheduledInvoices = onSchedule({
  schedule: "* * * * *", // formato: minuto hora día mes día-semana
  timeZone: "America/Santo_Domingo",
  retryCount: 3, // Intentar 3 veces si falla
  maxRetrySeconds: 60 // Esperar máximo 60 segundos entre reintentos
}, async (event): Promise<void> => {
  try {
    // 1. Obtener todas las facturas recurrentes con estado PENDING
    const recurringInvoicesRef = query(
      collection(database, "recurringInvoices"),
      where("status", "==", RecurringInvoiceStatus.PENDING)
    )
    const recurringInvoicesSnap = await getDocs(recurringInvoicesRef)
    const recurringInvoices = recurringInvoicesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as RecurringInvoice[]

    // 2. Procesar cada factura recurrente
    for (const invoice of recurringInvoices) {

      // 2.2 Crear nueva factura basada en la recurrente
      const newInvoice = {
        invoiceNumber: generateInvoiceNumber(), // Genera número único de factura
        amount: invoice.amount,
        status: RecurringInvoiceStatus.PENDING,
        citizenId: invoice.citizenId,
        serviceAssignmentId: invoice.serviceAssignmentId,
        dueDate: new Date(), // Fecha de vencimiento
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // 2.3 Guardar la nueva factura en Firestore
      await addDoc(collection(database, "recurringInvoices"), newInvoice)
    }

    // 3. Registrar resultado en logs
    console.log(`Generadas ${recurringInvoices.length} facturas recurrentes`)
  } catch (error) {
    // 4. Manejo de errores
    console.error("Error generando facturas:", error)
    throw error // Relanzar error para que Cloud Functions lo maneje
  }
}) 