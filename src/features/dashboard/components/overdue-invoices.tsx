import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { RecurringInvoice } from "@/types"
import { Timestamp } from 'firebase/firestore'

export function OverdueInvoices({ invoices }: { invoices: RecurringInvoice[] }) {
  const today = new Date()
  
  return (
    <div className="space-y-4">
      {invoices
        .filter(invoice => {
          const dueDate = invoice.dueDate instanceof Date ? invoice.dueDate 
          : (invoice.dueDate as Timestamp).toDate()
          return dueDate < today
        })
        .map((invoice) => (
          <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">{invoice.description}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(invoice.dueDate, 'DD/MM/YYYY')}
              </p>
            </div>
            <Badge variant="destructive" className="text-sm">
              {formatCurrency(invoice.amount)}
            </Badge>
          </div>
        ))}
    </div>
  )
} 