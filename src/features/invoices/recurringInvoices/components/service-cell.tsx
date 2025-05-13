import { useGlobalState } from "@/context/global/useGlobalState"

export const ServiceCell = ({ serviceAssignmentId }: { serviceAssignmentId: string }) => {
  const { serviceAssignments, services } = useGlobalState()
  const assignment = serviceAssignments.find(a => a.id === serviceAssignmentId)
  const service = services.find(s => s.id === assignment?.serviceId)
  return service?.name || 'N/A'
} 