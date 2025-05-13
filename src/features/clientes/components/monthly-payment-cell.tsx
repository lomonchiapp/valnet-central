import { useGlobalState } from "@/context/global/useGlobalState"
import { formatCurrency } from "@/lib/utils"

export function MonthlyPaymentCell({ citizenId }: { citizenId: string }) {
    const { serviceAssignments } = useGlobalState()
    
    const activeAssignment = serviceAssignments.find(
      assignment => assignment.citizenId === citizenId
    )
  
    if (!activeAssignment?.monthlyPaymentAmount) {
      return <span className="text-muted-foreground">Sin servicio</span>
    }
  
    return <span>{formatCurrency(activeAssignment.monthlyPaymentAmount)}</span>
  }