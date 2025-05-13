import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { PaymentMethod } from "@/types/enums"
import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface PaymentReceiptProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paymentId: string | null
  invoiceId: string
  amount: number
  paymentMethod: PaymentMethod
}

export function PaymentReceipt({
  open,
  onOpenChange,
  paymentId,
  invoiceId,
  amount,
  paymentMethod
}: PaymentReceiptProps) {
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = () => {
    setIsPrinting(true)
    window.print()
    setIsPrinting(false)
  }

  if (!paymentId) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Comprobante de Pago</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 print:p-4">
          <div className="text-center font-bold text-xl print:text-2xl">
            Comprobante de Pago
          </div>

          <div className="space-y-2">
            <p><strong>Número de Pago:</strong> {paymentId}</p>
            <p><strong>Factura:</strong> {invoiceId}</p>
            <p><strong>Fecha:</strong> {format(new Date(), "PPP", { locale: es })}</p>
            <p><strong>Monto:</strong> {formatCurrency(amount)}</p>
            <p><strong>Método de Pago:</strong> {paymentMethod}</p>
          </div>

          <DialogFooter className="print:hidden">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cerrar
            </Button>
            <Button 
              onClick={handlePrint}
              disabled={isPrinting}
            >
              {isPrinting ? "Imprimiendo..." : "Imprimir"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}