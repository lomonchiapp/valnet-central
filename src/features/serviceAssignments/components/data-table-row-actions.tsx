import { useState } from 'react'
import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Row } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IconFileInvoice, IconEyePause, IconTrash, IconCheck, IconPlayerPlay } from "@tabler/icons-react"
import { ServiceAssignment } from "@/types"
import { confirmAssignment } from "@/hooks/services/serviceAssignments/confirmAssignment"
import { ServiceAssignmentStatus, UserRole } from "@/types/enums"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { deleteAssignment } from "@/hooks/services/serviceAssignments/deleteAssignment"
import { suspendAssignment } from "@/hooks/services/serviceAssignments/suspendAssignment"
import { useAuthStore } from "@/stores/authStore"
import { reactivateAssignment } from "@/hooks/services/serviceAssignments/reactivateAssignment"

interface DataTableRowActionsProps {
  row: Row<ServiceAssignment>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { user } = useAuthStore()
  const [showConfirmAssignmentDialog, setShowConfirmAssignmentDialog] = useState(false)
  const [showDeleteAssignmentDialog, setShowDeleteAssignmentDialog] = useState(false)
  const [showSuspendDialog, setShowSuspendDialog] = useState(false)
  const [showReactivateDialog, setShowReactivateDialog] = useState(false)
  const assignment = row.original
  const isPending = assignment.status === ServiceAssignmentStatus.PENDING
  const isActive = assignment.status === ServiceAssignmentStatus.ACTIVE
  const isSuspended = assignment.status === ServiceAssignmentStatus.SUSPENDED
  
  const canManageStatus = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPERVISOR

  const handleConfirm = async () => {
    try {
      await confirmAssignment(assignment)
      toast({
        title: "Servicio confirmado",
        description: "El servicio ha sido confirmado y comenzará a generar facturas mensuales."
      })
      setShowConfirmAssignmentDialog(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al confirmar",
        description: error instanceof Error ? error.message : "Error desconocido"
      })
    }
  }

  const handleDelete = async () => {
    try {
      await deleteAssignment(assignment)
      toast({
        title: "Servicio eliminado",
        description: "El servicio ha sido eliminado correctamente."
      })
      setShowDeleteAssignmentDialog(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: error instanceof Error ? error.message : "Error desconocido"
      })
    }
  }

  const handleSuspend = async () => {
    try {
      await suspendAssignment(assignment)
      toast({
        title: "Servicio suspendido",
        description: "El servicio ha sido suspendido correctamente."
      })
      setShowSuspendDialog(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al suspender",
        description: error instanceof Error ? error.message : "Error desconocido"
      })
    }
  }

  const handleReactivate = async () => {
    try {
      await reactivateAssignment(assignment)
      toast({
        title: "Servicio reactivado",
        description: "El servicio ha sido reactivado y volverá a generar facturas mensuales."
      })
      setShowReactivateDialog(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al reactivar",
        description: error instanceof Error ? error.message : "Error desconocido"
      })
    }
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <DotsHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isPending && (
            <DropdownMenuItem onClick={() => setShowConfirmAssignmentDialog(true)}>
              Confirmar Asignación
              <IconCheck className="ml-2 h-4 w-4" />
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => {}}>
            Ver Facturas
            <IconFileInvoice className="ml-2 h-4 w-4" />
          </DropdownMenuItem>
          {canManageStatus && (
            <>
              {isActive && (
                <DropdownMenuItem onClick={() => setShowSuspendDialog(true)}>
                  Suspender
                  <IconEyePause className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
              )}
              {isSuspended && (
                <DropdownMenuItem onClick={() => setShowReactivateDialog(true)}>
                  Reactivar
                  <IconPlayerPlay className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
              )}
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => setShowDeleteAssignmentDialog(true)}
          >
            Eliminar
            <IconTrash className="ml-2 h-4 w-4" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showConfirmAssignmentDialog} onOpenChange={setShowConfirmAssignmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Asignación de Servicio</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas confirmar esta asignación? Al confirmar:
              <ul className="list-disc pl-4 mt-2">
                <li>Se generarán facturas mensuales automáticamente</li>
                <li>El monto mensual será de: {formatCurrency(assignment.monthlyPaymentAmount || 0)}</li>
                <li>El día de pago será el: {assignment.paymentDay} de cada mes</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmAssignmentDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteAssignmentDialog} onOpenChange={setShowDeleteAssignmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Asignación de Servicio</DialogTitle>
            <DialogDescription>
              {isActive ? (
                <div className="text-destructive font-medium">
                  No es posible eliminar un servicio activo.
                  <br />
                  Para eliminar este servicio:
                  <ol className="list-decimal pl-4 mt-2">
                    <li>Primero debes suspenderlo usando la opción "Suspender"</li>
                    <li>Una vez suspendido, podrás eliminarlo</li>
                  </ol>
                </div>
              ) : (
                <>
                  ¿Estás seguro que deseas eliminar esta asignación?
                  <br />
                  Esta acción no se puede deshacer.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteAssignmentDialog(false)}
            >
              {isActive ? "Entendido" : "Cancelar"}
            </Button>
            {!isActive && (
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                Eliminar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspender Servicio</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas suspender este servicio?
              <br />
              Esto detendrá la generación de facturas mensuales.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSuspendDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
            >
              Suspender
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reactivar Servicio</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas reactivar este servicio?
              <br />
              Se volverán a generar facturas mensuales.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReactivateDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleReactivate}
            >
              Reactivar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 