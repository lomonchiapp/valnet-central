import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAddNewState } from '@/context/global/useAddNewState'
import { useSelectedState } from '@/context/global/useSelectedState'
import { Citizen } from "@/types/interfaces/valnet/cliente"

interface PendingInfoCellProps {
  citizen: Citizen
  pendingInfo: boolean
}

export function PendingInfoCell({ citizen, pendingInfo }: PendingInfoCellProps) {
  const { setNewCitizenComp } = useAddNewState()
  const { setSelectedCitizen } = useSelectedState()

  const handleClick = () => {
    if (pendingInfo) {
      setSelectedCitizen(citizen)
      setNewCitizenComp(true)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge 
            onClick={handleClick}
            variant={pendingInfo ? "destructive" : "default"}
            className={pendingInfo ? "cursor-pointer hover:bg-destructive/80" : ""}
          >
            <Info className="h-4 w-4 mr-1" />
            {pendingInfo ? "Incompleta" : "Completa"}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {pendingInfo 
            ? "Falta información del contribuyente" 
            : "Información completa"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 