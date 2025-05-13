import { useGlobalState } from "@/context/global/useGlobalState"

export const CitizenCell = ({ citizenId }: { citizenId: string }) => {
    const { citizens } = useGlobalState()
    const citizen = citizens.find(c => c.id === citizenId)
    return citizen ? `${citizen.firstName} ${citizen.lastName}` : 'N/A'
  }
  