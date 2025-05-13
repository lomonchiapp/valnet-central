import { Service } from "@/types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useSelectedState } from "@/context/global/useSelectedState"
import { IconBox, IconChevronRight, IconEdit } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button'
import { Badge } from "@/components/ui/badge"
import { ServicePricingType } from '@/types/enums'

interface ServiceItemProps {
    service: Service
}

export const ServiceItem = ({ service }: ServiceItemProps) => {
    const { selectedService, setSelectedService } = useSelectedState()
    const isSelected = selectedService?.id === service.id

    return (
        <>
            <Card 
                onClick={() => setSelectedService(service)}
                className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] relative overflow-hidden group",
                    isSelected && "ring-2 ring-primary"
                )}
            >
                <Badge 
                    variant="secondary" 
                    className="absolute bottom-2 right-5 group-hover:opacity-100 transition-opacity"
                >
                    {service.pricingType === ServicePricingType.FIXED ? 'Precio Fijo' : 'Por Medidas'}
                </Badge>

                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                >
                    <IconEdit className="h-4 w-4" />
                </Button>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="flex items-center gap-2">
                        <IconBox className="h-5 w-5 text-muted-foreground" />
                        {service.name}
                    </CardTitle>
                    <IconChevronRight 
                        className={cn(
                            "h-5 w-5 text-muted-foreground transition-transform",
                            isSelected && "rotate-90"
                        )} 
                    />
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                </CardContent>
            </Card>

        </>
    )
}