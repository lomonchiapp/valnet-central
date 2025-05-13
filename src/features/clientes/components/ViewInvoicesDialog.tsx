import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGlobalState } from "@/context/global/useGlobalState"
import { RecurringInvoicesTab } from "./tabs/recurring-invoices-tab"
import { InvoicesTab } from "./tabs/invoices-tab"
import { useMemo } from "react"
import { Timestamp } from "firebase/firestore"

interface ViewInvoicesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  citizenId: string
}

export function ViewInvoicesDialog({
  open,
  onOpenChange,
  citizenId
}: ViewInvoicesDialogProps) {
  const { recurringInvoices, invoices, citizens } = useGlobalState()

  const citizen = citizens.find(c => c.id === citizenId)
  
  // Filtrar facturas usando la misma lógica de DebtCell
  const filteredRecurringInvoices = useMemo(() => {
    const today = new Date()
    const fifteenDaysAhead = new Date()
    fifteenDaysAhead.setDate(today.getDate() + 15)

    return recurringInvoices.filter(invoice => {
      if (!invoice.dueDate || invoice.citizenId !== citizenId) return false

      try {
        const dueDate = typeof invoice.dueDate === 'string'
          ? new Date(invoice.dueDate)
          : invoice.dueDate instanceof Date
            ? invoice.dueDate
            : (invoice.dueDate as Timestamp).toDate()

        const isOverdue = dueDate < today
        const isUpcoming = dueDate <= fifteenDaysAhead && dueDate >= today

        return isOverdue || isUpcoming
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error procesando fecha:', invoice.dueDate, error)
        return false
      }
    }).sort((a, b) => {
      const dateA = a.dueDate instanceof Date ? a.dueDate : (a.dueDate as Timestamp).toDate()
      const dateB = b.dueDate instanceof Date ? b.dueDate : (b.dueDate as Timestamp).toDate()
      return dateA.getTime() - dateB.getTime()
    })
  }, [recurringInvoices, citizenId])

  const citizenInvoices = invoices.filter(
    invoice => invoice.citizenId === citizenId
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Facturas de {citizen?.firstName} {citizen?.lastName}</DialogTitle>
          <DialogDescription>
            Mostrando facturas vencidas y próximas a vencer (15 días)
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="recurring" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="recurring" className="flex-1">
              Facturas Recurrentes ({filteredRecurringInvoices.length})
            </TabsTrigger>
            <TabsTrigger value="regular" className="flex-1">
              Facturas ({citizenInvoices.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="recurring" className="mt-4">
            <RecurringInvoicesTab data={filteredRecurringInvoices} />
          </TabsContent>
          <TabsContent value="regular" className="mt-4">
            <InvoicesTab data={citizenInvoices} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 