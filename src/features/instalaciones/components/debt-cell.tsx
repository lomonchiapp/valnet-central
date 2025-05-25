import { useGlobalState } from "@/context/global/useGlobalState"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Timestamp } from "firebase/firestore"

export function DebtCell({ citizenId }: { citizenId: string }) {
    const { recurringInvoices } = useGlobalState()
    const today = new Date()
    const fifteenDaysAhead = new Date()
    fifteenDaysAhead.setDate(today.getDate() + 15)
  
    const totalDebt = recurringInvoices
      .filter(invoice => {
        if (!invoice.dueDate) return false
  
        try {
          const dueDate = typeof invoice.dueDate === 'string' 
            ? new Date(invoice.dueDate)
            : invoice.dueDate instanceof Date 
              ? invoice.dueDate 
              : (invoice.dueDate as Timestamp).toDate()
  
          const isOverdue = dueDate < today
          const isUpcoming = dueDate <= fifteenDaysAhead && dueDate >= today
  
          return invoice.citizenId === citizenId && (isOverdue || isUpcoming)
        } catch (error) {
            //eslint-disable-next-line
          console.error('Error procesando fecha:', invoice.dueDate, error)
          return false
        }
      })
      .reduce((acc, invoice) => acc + invoice.amount, 0)
  
    return (
      <div>
        <Badge variant={totalDebt > 0 ? 'destructive' : 'default'}>
          {formatCurrency(totalDebt)}
        </Badge>
      </div>
    )
  }