import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Payment } from '@/types'
import { IconReceipt, IconCreditCard } from '@tabler/icons-react'
import { toast } from '@/hooks/use-toast'

interface DataTableRowActionsProps {
  row: Row<Payment>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const invoice = row.original


  const handleDownloadReceipt = () => {
    toast({
      title: "Descargando comprobante",
      description: `Descargando comprobante de la factura recurrente #${invoice.id}`
    })
  }

  const handleGenerateInvoice = () => {
    toast({
      title: "Generando factura",
      description: `Generando factura para el servicio ${invoice.serviceAssignmentId}`
    })
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
          <DropdownMenuItem onClick={handleGenerateInvoice}>
            <IconCreditCard className="mr-2 h-4 w-4" />
            <span>Ver Recibo</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadReceipt}>
            <IconReceipt className="mr-2 h-4 w-4" />
            <span>Descargar Recibo</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
