import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PaymentMethod } from "@/types/enums"
import { useState } from "react"
import { addPaymentToInvoice } from "@/hooks/payments/addPaymentToInvoice"
import { toast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { useAuthStore } from "@/stores/authStore"
import { PaymentReceipt } from "./PaymentReceipt"

interface AddPaymentToInvoiceProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceId: string
  citizenId: string
  totalAmount: number
}

export function AddPaymentToInvoice({
  open,
  onOpenChange,
  invoiceId,
  citizenId,
  totalAmount
}: AddPaymentToInvoiceProps) {
  const { user } = useAuthStore()
  const [amount, setAmount] = useState(totalAmount)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH)
  const [isLoading, setIsLoading] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [paymentId, setPaymentId] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await addPaymentToInvoice({
        invoiceId,
        amount,
        paymentMethod,
        citizenId,
        userId: user?.id || ""
      })

      setShowReceipt(true)
      setPaymentId(result.paymentId)
      
      toast({
        title: "Pago registrado",
        description: `Se ha registrado el pago de ${formatCurrency(amount)} correctamente.`
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al registrar el pago",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
          <DialogDescription>
            Ingrese los detalles del pago a registrar de la factura recurrente {invoiceId}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                max={totalAmount}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">Método de Pago</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione método de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PaymentMethod.CASH}>Efectivo</SelectItem>
                  <SelectItem value={PaymentMethod.CREDIT_CARD}>Tarjeta de Crédito</SelectItem>
                  <SelectItem value={PaymentMethod.DEBIT_CARD}>Tarjeta de Débito</SelectItem>
                  <SelectItem value={PaymentMethod.TRANSFER}>Transferencia</SelectItem>
                  <SelectItem value={PaymentMethod.CHECK}>Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Procesando..." : "Registrar Pago"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    <PaymentReceipt
        open={showReceipt}
        onOpenChange={setShowReceipt}
        paymentId={paymentId}
        invoiceId={invoiceId}
        amount={amount}
        paymentMethod={paymentMethod}
      />
    </>
  )
}
