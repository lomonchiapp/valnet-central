import { useGlobalState } from "@/context/global/useGlobalState"

export const InvoiceNumberCell = ({ invoiceId }: { invoiceId: string }) => {
  const { recurringInvoices } = useGlobalState()
  const invoice = recurringInvoices.find(i => i.id === invoiceId)
  return invoice?.invoiceNumber || 'N/A'
} 