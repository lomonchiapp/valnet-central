import { useGlobalState } from "@/context/global/useGlobalState"

export const ServiceCell = ({ serviceId }: { serviceId: string }) => {
  const { services } = useGlobalState()
  const service = services.find(s => s.id === serviceId)
  return service?.name || 'N/A'
}