import { Invoice } from "@/types"
import { CompactTable } from "./compact-table"
import { invoiceColumns } from "./columns"

interface InvoicesTabProps {
  data: Invoice[]
}

export function InvoicesTab({ data }: InvoicesTabProps) {
  return (
    <div className="space-y-4">
      <CompactTable 
        data={data} 
        columns={invoiceColumns} 
      />
    </div>
  )
} 