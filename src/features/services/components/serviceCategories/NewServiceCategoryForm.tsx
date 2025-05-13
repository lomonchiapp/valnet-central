import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ServiceCategory } from '@/types'
import { toast } from '@/hooks/use-toast'
import { newServiceCategory } from '@/hooks/services/newServiceCategory'

interface NewServiceCategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const NewServiceCategoryForm = ({ open, onOpenChange }: NewServiceCategoryFormProps) => {
  const [categoryName, setCategoryName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newCategory: Partial<ServiceCategory> = { name: categoryName }
      await newServiceCategory(newCategory as ServiceCategory)
      setCategoryName('')
      onOpenChange(false)
      toast({
        title: "Categoría de servicio agregada",
        description: "La categoría de servicio ha sido agregada exitosamente"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al agregar la categoría de servicio",
        description: error instanceof Error ? error.message : "Error desconocido"
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Nueva Categoría de Servicio</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Agregar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 