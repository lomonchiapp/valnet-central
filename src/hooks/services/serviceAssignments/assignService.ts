import { addDoc, collection, doc, updateDoc } from 'firebase/firestore'
import { database } from '@/firebase'
import { ServiceAssignment } from '@/types/interfaces/serviceAssignment'
import { updateCitizenDebt } from '../../citizens/updateCitizenDebt'
import { toast } from '@/hooks/use-toast'
import { calculateNextPaymentDate, generateInvoiceNumber } from '@/lib/utils'
import { InvoiceStatus } from '@/types/enums'

export const assignService = async (assignment: ServiceAssignment) => {
  try {
    // 1. Crear el ServiceAssignment
    const assignmentRef = await addDoc(collection(database, 'serviceAssignments'), {
      ...assignment,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await updateDoc(doc(database, 'serviceAssignments', assignmentRef.id), {
      id: assignmentRef.id
    })

    // 2. Crear facturas para cada mes
    if (assignment.monthlyPaymentAmount && assignment.paymentDay && assignment.paymentNumbers) {
      let currentStartDate = new Date(assignment.startDate)
      
      for (let i = 0; i < assignment.paymentNumbers; i++) {
        const dueDate = calculateNextPaymentDate(currentStartDate, assignment.paymentDay)
        
        const recurringInvoiceRef = await addDoc(collection(database, 'recurringInvoices'), {
          invoiceNumber: generateInvoiceNumber(
            assignment.paymentDay, 
            dueDate, 
            assignment.citizenId
          ),
          serviceAssignmentId: assignmentRef.id,
          citizenId: assignment.citizenId,
          citizenCode: assignment.citizenCode,
          amount: assignment.monthlyPaymentAmount,
          description: `Pago mensual - ${assignment.description}`,
          startDate: currentStartDate,
          dueDate,
          status: InvoiceStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
          isOverdue: false,
          daysOverdue: 0,
          paymentNumbers: i + 1
        })

        await updateDoc(doc(database, 'recurringInvoices', recurringInvoiceRef.id), {
          id: recurringInvoiceRef.id
        })

        // Actualizar la fecha de inicio para la próxima factura
        currentStartDate = new Date(dueDate)
        currentStartDate.setDate(currentStartDate.getDate() + 1) // Comenzar el día siguiente
      }
    }

    // 3. Si hay precio calculado o personalizado, actualizar deuda
    if (assignment.calculatedPrice || assignment.customPrice) {
      const debtAmount = assignment.calculatedPrice || assignment.customPrice || 0
      await updateCitizenDebt(assignment.citizenId, debtAmount)
    }

    toast({
      title: "Servicio asignado",
      description: "El servicio se ha asignado correctamente"
    })

    return assignmentRef.id
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Error al asignar servicio",
      description: error instanceof Error ? error.message : "Error desconocido"
    })
    throw error
  }
} 