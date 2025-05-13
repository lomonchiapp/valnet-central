import { Badge } from "@/components/ui/badge"
import { Timestamp } from "firebase/firestore"

export function StatusCell({ dueDate }: { dueDate: Timestamp }) {
    try {
      // Convertir Timestamp a Date si es necesario
      const date = dueDate instanceof Timestamp 
        ? dueDate.toDate() 
        : new Date(dueDate)
  
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      date.setHours(0, 0, 0, 0)
  
      return date < today ? (
        <Badge variant="destructive">Vencido</Badge>
      ) : (
        <Badge variant="default">Pendiente</Badge>
      )
    } catch (error) {
      //eslint-disable-next-line  
      console.error('Error procesando fecha:', dueDate, error)
      return <Badge variant="default">Error</Badge>
    }
  }