import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MaterialForm } from './forms/MaterialForm'
import { EquipoForm } from './forms/EquipoForm'
import { Box, Cpu } from 'lucide-react'

interface NuevoArticuloFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inventarioId: string
}

export function NuevoArticuloForm({
  open,
  onOpenChange,
  inventarioId,
}: NuevoArticuloFormProps) {
  const [activeTab, setActiveTab] = useState('material')

  const onSuccess = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Artículo</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="material" className="flex items-center gap-2">
              <Box className="h-4 w-4" />
              Material / Consumible
            </TabsTrigger>
            <TabsTrigger value="equipo" className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Equipo / Activo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="material">
            <div className="p-1">
                <MaterialForm inventarioId={inventarioId} onSuccess={onSuccess} />
            </div>
          </TabsContent>

          <TabsContent value="equipo">
             <div className="p-1">
                <EquipoForm inventarioId={inventarioId} onSuccess={onSuccess} />
             </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
