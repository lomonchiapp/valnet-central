import { RecurringInvoice } from "@/types"
import { CompactTable } from "./compact-table"
import { recurringInvoiceColumns } from "./columns"

interface RecurringInvoicesTabProps {
  data: RecurringInvoice[]
}

export function RecurringInvoicesTab({ data }: RecurringInvoicesTabProps) {
  return (
    <div className="space-y-4">
      <CompactTable 
        data={data} 
        columns={recurringInvoiceColumns} 
      />
    </div>
  )
} 