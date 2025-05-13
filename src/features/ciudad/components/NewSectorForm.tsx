import { useState, lazy, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from '@/hooks/use-toast'
import { Label } from '@/components/ui/label'
import { IconMapPin, IconPencil } from '@tabler/icons-react'
import { LatLng, Sector } from '@/types/interfaces/sector'
import { newSector } from '@/hooks/sectors/newSector'

// Lazy load del mapa
const PerimeterMap = lazy(() => import('./PerimeterMap'))

interface NewSectorFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const NewSectorForm = ({ open, onOpenChange }: NewSectorFormProps) => {
  const [sector, setSector] = useState<Partial<Sector>>({
    name: '',
    perimeter: []
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!sector.name) {
      toast({
        title: "Error",
        description: "El nombre del sector es obligatorio",
        variant: "destructive"
      })
      return
    }

    try {
      await newSector(sector as Sector)
      setSector({ name: '', perimeter: [] })
      onOpenChange(false)
      toast({
        title: "Sector creado",
        description: "El sector se ha creado correctamente"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al crear el sector",
        description: error instanceof Error ? error.message : "Error desconocido"
      })
    }
  }
  
  const handlePerimeterChange = (perimeter: LatLng[]) => {
    setSector(prev => ({ ...prev, perimeter }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center">
            <IconMapPin className="h-5 w-5" />
            Crear Nuevo Sector
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del Sector</Label>
              <Input
                placeholder="Ej: Centro de la Ciudad"
                value={sector.name}
                onChange={e => setSector({...sector, name: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Perímetro del Sector</Label>
              <div className="h-[300px] rounded-md border relative">
                <Suspense fallback={<div>Cargando mapa...</div>}>
                  <PerimeterMap
                    perimeter={sector.perimeter}
                    onChange={handlePerimeterChange}
                  />
                </Suspense>
                <div className="absolute bottom-0 z-[60] left-0 right-0 bg-primary/100 text-white py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium">
        <IconPencil className="h-4 w-4" />
        Dibuja el perímetro del sector en el mapa
      </div>
              </div>
              
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              Crear Sector
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
