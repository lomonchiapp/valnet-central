import { RecurringInvoice } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useGlobalState } from '@/context/global/useGlobalState'
import { InvoiceStatus } from '@/types/enums'
import { Timestamp } from 'firebase/firestore'

export function PrintView({ invoice }: { invoice: RecurringInvoice }) {
  const { citizens, services } = useGlobalState()
  const citizen = citizens.find(c => c.id === invoice.citizenId)
  const service = services.find(s => s.id === invoice.serviceAssignmentId)

  // Estilos para el sello según el estado
  const statusStyles = {
    [InvoiceStatus.PENDING]: 'border-gray-500 text-gray-500',
    [InvoiceStatus.PAID]: 'border-green-500 text-green-900',
    [InvoiceStatus.OVERDUE]: 'border-orange-500 text-orange-500',
  }

  // Función para obtener el período pagado
  const getBillingPeriod = () => {
    const startDate = invoice.startDate instanceof Timestamp 
      ? invoice.startDate.toDate() 
      : new Date(invoice.startDate)
    
    const dueDate = invoice.dueDate instanceof Timestamp 
      ? invoice.dueDate.toDate() 
      : new Date(invoice.dueDate)
    
    // Verificar si las fechas son válidas
    if (isNaN(startDate.getTime()) || isNaN(dueDate.getTime())) {
      return 'Período no disponible'
    }
    
    const startMonth = startDate.toLocaleString('es', { month: 'long' })
    const startYear = startDate.getFullYear()
    const dueMonth = dueDate.toLocaleString('es', { month: 'long' })
    const dueYear = dueDate.getFullYear()
    
    // Si los años son diferentes, incluirlos en el formato
    if (startYear !== dueYear) {
      return `${(startMonth).toUpperCase()} ${startYear} - ${dueMonth.toUpperCase()} ${dueYear}`
    }
    
    // Si es el mismo año, solo mostrar los meses
    return `${(startMonth).toUpperCase()} - ${dueMonth.toUpperCase()} ${startYear}`
  }

  return (
    <div className="print-view p-8 relative">
      {/* Sello de estado */}
      <div className={`absolute bottom-10 right-10 transform border-4 ${statusStyles[invoice.status]} p-4 rounded-full text-xl font-bold uppercase`}>
        {invoice.status}
      </div>

      {/* Fecha de emisión */}
      <div className="text-right mb-4">
        <p>id: {invoice.id}</p>
        <p className="text-sm text-gray-600">
          Fecha de Emisión: {formatDate(invoice.startDate)}
        </p>
      </div>

      {/* Encabezado */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <img 
            src="/images/logo.png" 
            alt="Logo de la institución" 
            className="h-20"
          />
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-bold">Factura</h1>
          <p className="text-gray-600">#{invoice.invoiceNumber}</p>
        </div>
      </div>

      {/* Información de la institución y contribuyente */}
      <div className="grid grid-cols-2 gap-16 mb-8">
        <div>
          <p>Ayuntamiento de San Pedro de Macorís</p>
          <p>Anacaona Moscoso #1</p>
          <p>Teléfono: (809) 529-7815</p>
          <p>Email: info@ayuntamientospm.com</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Contribuyente</h2>
          {citizen ? (
            <>
              <p>Titular: {citizen.firstName} {citizen.lastName}</p>
              <p>Cédula: {citizen.cedula}</p>
              <p>Teléfono: {citizen.phone}</p>
              <p>Email: {citizen.email}</p>
            </>
          ) : (
            <p>Contribuyente no encontrado</p>
          )}
        </div>
      </div>

      {/* Detalles de la factura */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Detalles de la Factura</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Fecha de Vencimiento:</p>
            <p>{formatDate(invoice.dueDate, 'DD/MM/YYYY')}</p>
            <p className="font-medium">Período relacionado:</p>
            <p>{getBillingPeriod()}</p>
          </div>

        </div>
      </div>

      {/* Tabla de conceptos */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Conceptos</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Descripción</th>
              <th className="p-2 text-right"></th>
              <th className="p-2 text-right">Monto</th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2">
                {service?.name || invoice.description} {getBillingPeriod()}
              </td>
              <td className="p-2 text-right">{invoice.paymentNumbers}</td>
              <td className="p-2 text-right">{formatCurrency(invoice.amount)}</td>
              <td className="p-2 text-right">{formatCurrency(invoice.amount)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Totales */}
      <div className="text-right">
        <p className="text-lg">
          <span className="font-lg font-bold bg-gray-100 p-4 rounded-md">Total: RD$ {invoice.amount}</span> 
        </p>
      </div>

      {/* Notas */}
      <div className="mt-8 border-t pt-4">
        <h3 className="font-medium mb-2">Notas:</h3>
        <p className="text-sm text-gray-600">
          - Pago debe realizarse antes de la fecha de vencimiento
          <br />
          - Recargos por mora aplican después de la fecha de vencimiento
          <br />
          - Para consultas, contactar al departamento de finanzas
        </p>
      </div>
    </div>
  )
} 