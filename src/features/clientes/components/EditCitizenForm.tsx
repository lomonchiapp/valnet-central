import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Citizen } from '@/types/interfaces/valnet/cliente'
import { toast } from '@/hooks/use-toast'
import { Card } from '@/components/ui/card'
import { updateCitizen } from '@/hooks/citizens/updateCitizen'
import { HelpCircle } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EditCitizenFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  citizen: Citizen
}

export function EditCitizenForm({ open, onOpenChange, citizen: initialCitizen }: EditCitizenFormProps) {
  const [citizen, setCitizen] = useState<Citizen>(initialCitizen)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCitizen(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateCitizen(citizen)
      onOpenChange(false)
      toast({
        title: "Éxito",
        description: "Contribuyente actualizado exitosamente"
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error al actualizar:", error)
      toast({
        title: "Error",
        description: "Error al actualizar el contribuyente",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Editar Contribuyente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  Nombre
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 ml-2 inline" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ingrese el nombre del contribuyente</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={citizen?.firstName}
                  onChange={handleInputChange}
                  placeholder="Ej: Juan"
                  required
                  className="transition-all duration-200 focus:scale-[1.01]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={citizen?.lastName}
                  onChange={handleInputChange}
                  placeholder="Ej: Pérez"
                  required
                  className="transition-all duration-200 focus:scale-[1.01]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cedula">
                  Cédula
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 ml-2 inline" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Formato: 000-0000000-0</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  id="cedula"
                  name="cedula"
                  value={citizen?.cedula}
                  onChange={handleInputChange}
                  placeholder="000-0000000-0"
                  maxLength={13}
                  className="transition-all duration-200 focus:scale-[1.01]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={citizen?.email}
                  onChange={handleInputChange}
                  placeholder="ejemplo@correo.com"
                  className="transition-all duration-200 focus:scale-[1.01]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Teléfono Principal
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 ml-2 inline" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Formato: (809) 000-0000</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={citizen?.phone}
                  onChange={handleInputChange}
                  placeholder="(809) 000-0000"
                  maxLength={14}
                  className="transition-all duration-200 focus:scale-[1.01]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone">
                  Teléfono Alternativo
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 ml-2 inline" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Formato: (809) 000-0000</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  id="telephone"
                  name="telephone"
                  value={citizen?.telephone}
                  onChange={handleInputChange}
                  placeholder="(809) 000-0000"
                  maxLength={14}
                  className="transition-all duration-200 focus:scale-[1.01]"
                />
              </div>

              <div className="space-y-2 col-span-full">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  name="address"
                  value={citizen?.address}
                  onChange={handleInputChange}
                  placeholder="Ej: Calle Principal #123"
                  className="transition-all duration-200 focus:scale-[1.01]"
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 