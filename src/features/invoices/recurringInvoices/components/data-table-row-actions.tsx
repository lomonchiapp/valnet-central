import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { RecurringInvoice } from '@/types'
import { IconReceipt, IconPrinter, IconCreditCard } from '@tabler/icons-react'
import { useState } from 'react'
import { AddPaymentToInvoice } from '@/features/payments/components/AddPaymentToInvoice'
import { InvoiceDialog } from './InvoiceDialog'

interface DataTableRowActionsProps {
  row: Row<RecurringInvoice>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const invoice = row.original
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)

  const handlePrint = () => {
    // Lógica para imprimir directamente
    window.print()
  }

  const handleDownload = () => {
    // Lógica para generar y descargar el PDF
    // Puedes usar una librería como jsPDF o pdfmake
    // Ejemplo básico:
    const pdfContent = `Factura #${invoice.id}\nMonto: ${invoice.amount}`
    const blob = new Blob([pdfContent], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `factura_${invoice.id}.pdf`
    link.click()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => setShowPaymentDialog(true)}>
            <IconCreditCard className="mr-2 h-4 w-4" />
            <span>Agregar Pago</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowInvoiceDialog(true)}>
            <IconCreditCard className="mr-2 h-4 w-4" />
            <span>Ver Factura</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePrint}>
            <IconPrinter className="mr-2 h-4 w-4" />
            <span>Imprimir</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownload}>
            <IconReceipt className="mr-2 h-4 w-4" />
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

      <InvoiceDialog
        open={showInvoiceDialog}
        onOpenChange={setShowInvoiceDialog}
        invoice={invoice}
        onPrint={handlePrint}
        onDownload={handleDownload}
      />
    </>
  )
}
