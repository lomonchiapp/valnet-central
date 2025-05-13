import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Invoice } from '@/types'
import { IconReceipt, IconPrinter, IconCreditCard } from '@tabler/icons-react'
import { toast } from '@/hooks/use-toast'
import { InvoiceStatus } from '@/types/enums'

interface DataTableRowActionsProps {
  row: Row<Invoice>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const invoice = row.original

  const handlePrint = () => {
    toast({
      title: "Imprimiendo factura",
      description: `Imprimiendo factura #${invoice.id}`
    })
  }

  const handleDownloadReceipt = () => {
    toast({
      title: "Descargando comprobante",
      description: `Descargando comprobante de la factura #${invoice.id}`
    })
  }

  const handlePayment = () => {
    if (invoice.status === InvoiceStatus.PAID) {
      toast({
        variant: "destructive",
        title: "Factura ya pagada",
        description: "Esta factura ya ha sido pagada"
      })
      return
    }

    toast({
      title: "Procesando pago",
      description: `Procesando pago de la factura #${invoice.id}`
    })
  }

  return (
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
        {invoice.status !== InvoiceStatus.PAID && (
          <DropdownMenuItem onClick={handlePayment}>
            <IconCreditCard className="mr-2 h-4 w-4" />
            <span>Pagar</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handlePrint}>
          <IconPrinter className="mr-2 h-4 w-4" />
          <span>Imprimir</span>
        </DropdownMenuItem>
        {invoice.status === InvoiceStatus.PAID && (
          <DropdownMenuItem onClick={handleDownloadReceipt}>
            <IconReceipt className="mr-2 h-4 w-4" />
            <span>Descargar Comprobante</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
