import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { IconPrinter, IconDownload } from '@tabler/icons-react'
import { RecurringInvoice } from '@/types'
import { PrintView } from './PrintView'

interface InvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: RecurringInvoice
  onPrint: () => void
  onDownload: () => void
}

export function InvoiceDialog({ open, onOpenChange, invoice, onPrint, onDownload }: InvoiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        {/* Contenido de la factura */}
        <div className="space-y-4">
          <PrintView invoice={invoice} />
          
          {/* Botones de acciones */}
          <div className="flex gap-2 justify-end">
            <Button onClick={onPrint} className="gap-2">
              <IconPrinter size={18} />
              Imprimir
            </Button>
            <Button onClick={onDownload} className="gap-2">
              <IconDownload size={18} />
              Descargar PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 