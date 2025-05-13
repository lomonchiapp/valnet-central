import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { Card } from '@/components/ui/card'
import { IconGift } from '@tabler/icons-react'
import { RaffleItem, RaffleItemCategory, RaffleItemStatus } from '@/types/interfaces/raffleItem'

interface NewRaffleItemFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const NewRaffleItemForm = ({ open, onOpenChange }: NewRaffleItemFormProps) => {
  const [item, setItem] = useState<Partial<RaffleItem>>({
    name: '',
    description: '',
    image: '',
    value: 0,
    quantity: 1,
    category: RaffleItemCategory.OTHERS,
    status: RaffleItemStatus.AVAILABLE
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // TODO: Implementar la lógica para crear nuevo item
      onOpenChange(false)
      toast({
        title: "Artículo agregado",
        description: "El artículo ha sido agregado exitosamente al catálogo"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al agregar el artículo",
        description: error instanceof Error ? error.message : "Error desconocido"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center">
            <IconGift className="h-5 w-5" />
            Agregar Nuevo Artículo
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre del Artículo</Label>
                <Input
                  placeholder="Ej: Smart TV 55 pulgadas"
                  value={item.name}
                  onChange={e => setItem({...item, name: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  placeholder="Describe las características del artículo..."
                  value={item.description}
                  onChange={e => setItem({...item, description: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor Estimado ($)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={item.value}
                    onChange={e => setItem({...item, value: Number(e.target.value)})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={e => setItem({...item, quantity: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select
                  value={item.category}
                  onValueChange={(value: RaffleItemCategory) => 
                    setItem({...item, category: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RaffleItemCategory.ELECTRONICS}>Electrónicos</SelectItem>
                    <SelectItem value={RaffleItemCategory.HOME_APPLIANCES}>Electrodomésticos</SelectItem>
                    <SelectItem value={RaffleItemCategory.FURNITURE}>Muebles</SelectItem>
                    <SelectItem value={RaffleItemCategory.VEHICLES}>Vehículos</SelectItem>
                    <SelectItem value={RaffleItemCategory.OTHERS}>Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>URL de la Imagen</Label>
                <Input
                  type="url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={item.image}
                  onChange={e => setItem({...item, image: e.target.value})}
                  required
                />
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              Agregar Artículo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 