import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Invoice, RecurringInvoice } from '@/types'
import { IconReceipt, IconPrinter, IconCreditCard } from '@tabler/icons-react'
import { useState } from 'react'
import { AddPaymentToInvoice } from '@/features/payments/components/AddPaymentToInvoice'
import { toast } from '@/hooks/use-toast'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData extends Invoice | RecurringInvoice>({ 
  row 
}: DataTableRowActionsProps<TData>) {
  const invoice = row.original
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  const handlePrint = () => {
    toast({
      title: "Imprimiendo factura",
      description: `Imprimiendo factura #${invoice.invoiceNumber}`
    })
  }

  const handleDownloadReceipt = () => {
    toast({
      title: "Descargando comprobante",
      description: `Descargando comprobante de la factura #${invoice.invoiceNumber}`
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-7 w-7 p-0"
          >
            <DotsHorizontalIcon className="h-3.5 w-3.5" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[150px]">
          <DropdownMenuItem onClick={() => setShowPaymentDialog(true)}>
            <IconCreditCard className="mr-2 h-3.5 w-3.5" />
            <span>Agregar Pago</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePrint}>
            <IconPrinter className="mr-2 h-3.5 w-3.5" />
            <span>Imprimir</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadReceipt}>
            <IconReceipt className="mr-2 h-3.5 w-3.5" />
            <span>Descargar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddPaymentToInvoice
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        invoiceId={invoice.id}
        citizenId={invoice.citizenId}
        totalAmount={invoice.amount}
      />
    </>
  )
} 