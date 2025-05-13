import { RecurringInvoice } from "@/types"
import { DataTable } from "../recurringInvoices/components/data-table"
import { recurringColumns } from "../recurringInvoices/components/columns"

interface RecurringInvoicesTabProps {
  data: RecurringInvoice[]
}

export function RecurringInvoicesTab({ data }: RecurringInvoicesTabProps) {
  return (
    <div className="-mx-4 flex-1 overflow-auto px-4 py-1">
      <DataTable data={data} columns={recurringColumns} />
    </div>
  )
} 