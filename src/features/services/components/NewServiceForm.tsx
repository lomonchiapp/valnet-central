import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Service } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { newService } from '@/hooks/services/newService'
import { toast } from '@/hooks/use-toast'
import { ServicePricingType } from '@/types/enums'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { IconRulerMeasure, IconCash } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

interface NewServiceFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const NewServiceForm = ({ open, onOpenChange }: NewServiceFormProps) => {
  const [service, setService] = useState<Partial<Service>>({
    name: '',
    description: '',
    basePrice: 0,
    pricingType: ServicePricingType.FIXED,
  })

  const [hasBasePrice, setHasBasePrice] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const ServiceToBeAdded: Service = {
      ...service,
      basePrice: hasBasePrice ? service.basePrice : 0,
      id: '',

    } as Service

    try {
      await newService(ServiceToBeAdded)
      setService({ name: '', description: '', basePrice: 0, pricingType: ServicePricingType.FIXED })
      setHasBasePrice(false)
      onOpenChange(false)
      toast({
        title: "Servicio creado",
        description: "El servicio se ha creado correctamente"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al crear el servicio",
        description: error instanceof Error ? error.message : "Error desconocido"
      })
    }
  }

  const PricingTypeButton = ({ type, icon: Icon, label }: { 
    type: ServicePricingType, 
    icon: typeof IconCash, 
    label: string 
  }) => (
    <Button
      type="button"
      variant={service.pricingType === type ? "default" : "outline"}
      className={cn(
        "flex-1 space-x-2",
        service.pricingType === type && "border-2 border-primary"
      )}
      onClick={() => setService({ ...service, pricingType: type })}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Button>
  )
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Crear Nuevo Servicio</DialogTitle>
          <DialogDescription className="text-base">
            Configura los detalles de tu nuevo servicio
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nombre del Servicio
              </label>
              <Input
                id="name"
                placeholder="Ej: Farmacia Principal"
                className="h-11"
                value={service.name}
                onChange={e => setService({...service, name: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descripción
              </label>
              <Textarea
                id="description"
                placeholder="Describe el propósito de este servicio..."
                className="min-h-[100px] resize-none"
                value={service.description}
                onChange={e => setService({...service, description: e.target.value})}
                required
              />
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-medium">Tipo de Precio</Label>
              <div className="flex gap-4">
                <PricingTypeButton 
                  type={ServicePricingType.FIXED} 
                  icon={IconCash} 
                  label="Precio Fijo" 
                />
                <PricingTypeButton 
                  type={ServicePricingType.CALCULATED} 
                  icon={IconRulerMeasure} 
                  label="Por Medidas" 
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="has-base-price"
                checked={hasBasePrice}
                onCheckedChange={setHasBasePrice}
              />
              <Label htmlFor="has-base-price">Incluir precio base</Label>
            </div>

            {hasBasePrice && (
              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium">
                  Precio Base
                </label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Ej: 100"
                  className="h-11"
                  value={service.basePrice}
                  onChange={e => setService({...service, basePrice: Number(e.target.value)})}
                  required={hasBasePrice}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="px-8"
            >
              Crear
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
