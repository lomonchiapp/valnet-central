import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sector } from '@/types/interfaces/sector'
import { toast } from '@/hooks/use-toast'
import { updateSector } from '@/hooks/sectors/updateSector'
import { Card } from '@/components/ui/card'
import { IconMapPin } from '@tabler/icons-react'

interface EditSectorFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sector: Sector
}

export const EditSectorForm = ({ open, onOpenChange, sector: initialSector }: EditSectorFormProps) => {
  const [sector, setSector] = useState<Sector>({
    ...initialSector,
    perimeter: initialSector.perimeter || []
  })

  useEffect(() => {
    setSector(initialSector)
  }, [initialSector])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateSector(sector)
      onOpenChange(false)
      toast({
        title: "Sector actualizado",
        description: "Los cambios han sido guardados exitosamente"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al actualizar el sector",
        description: error instanceof Error ? error.message : "Error desconocido"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center">
            <IconMapPin className="h-5 w-5" />
            Editar Sector
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre del Sector</Label>
                <Input
                  value={sector.name}
                  onChange={(e) => setSector({...sector, name: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitud</Label>
                  <Input
                    type="number"
                    step="any"
                    value={sector.perimeter?.[0].lat}
                    onChange={(e) => setSector({
                      ...sector, 
                      perimeter: [{
                        ...(sector.perimeter?.[0] || { lat: 0, lng: 0 }), 
                        lat: Number(e.target.value)
                      }]
                    })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Longitud</Label>
                  <Input
                    type="number"
                    step="any"
                    value={sector.perimeter?.[0].lng}
                    onChange={(e) => setSector({
                      ...sector, 
                      perimeter: [{
                        ...(sector.perimeter?.[0] || { lat: 0, lng: 0 }), 
                        lng: Number(e.target.value)
                      }]
                    })}
                    required
                  />
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 