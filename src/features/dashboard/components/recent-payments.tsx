import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Payment } from "@/types"
import { Timestamp } from 'firebase/firestore'
import { useGlobalState } from "@/context/global/useGlobalState"
import { IconEye } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"

export function RecentPayments({ payments }: { payments: Payment[] }) {
  const { citizens, serviceAssignments, recurringInvoices, services } = useGlobalState()
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null)

  const getPaymentDetails = (payment: Payment) => {
    const serviceAssignment = serviceAssignments.find(sa => sa.id === payment.serviceAssignmentId)
    const citizen = citizens.find(c => c.id === serviceAssignment?.citizenId)
    const service = services.find(s => s.id === serviceAssignment?.serviceId)
    const invoice = recurringInvoices.find(i => i.id === payment.invoiceId)
    
    return {
      citizenName: citizen ? `${citizen.firstName} ${citizen.lastName}` : 'N/A',
      serviceName: service?.name || 'N/A',
      invoice
    }
  }

  return (
    <div className="space-y-4">
      {payments
        .filter(payment => payment.status === 'confirmado')
        .sort((a, b) => {
          const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date)
          const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date)
          return dateB.getTime() - dateA.getTime()
        })
        .slice(0, 5)
        .map((payment) => {
          const { citizenName, serviceName } = getPaymentDetails(payment)
          
          return (
            <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <p className="font-medium">{citizenName}</p>
                <p className="text-sm text-muted-foreground">
                  {serviceName} - {formatDate(payment.date instanceof Timestamp ? payment.date.toDate() : new Date(payment.date), 'DD/MM/YYYY')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-sm">
                  {formatCurrency(payment.amount)}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSelectedInvoice(payment.invoiceId)}
                >
                  <IconEye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}

      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la Factura</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              {/* Aquí puedes mostrar los detalles de la factura */}
              {recurringInvoices.find(i => i.id === selectedInvoice)?.description}
              {/* Agregar más detalles según necesites */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 