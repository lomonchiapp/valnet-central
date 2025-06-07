import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTareasStore } from '@/stores/tareasStore'
import { useAuthStore } from '@/stores/authStore'
import type { PrioridadTarea, EstadoTarea } from '@/types'

interface NuevaTareaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NuevaTareaDialog({ open, onOpenChange }: NuevaTareaDialogProps) {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'media' as PrioridadTarea,
    asignadoA: '',
    fechaVencimiento: '',
    ticketId: '',
    clienteId: '',
    facturaId: '',
    etiquetas: [] as string[],
  })
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState('')

  const { addTarea } = useTareasStore()
  const { user } = useAuthStore()

  // Mock users - en una app real vendría de un store de usuarios
  const usuarios = [
    { id: 'admin-001', nombre: 'Administrador' },
    { id: 'coord-001', nombre: 'Coordinador García' },
    { id: 'tech-001', nombre: 'Técnico López' },
    { id: 'tech-002', nombre: 'Técnico Martínez' },
  ]

  const prioridades = [
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
    { value: 'urgente', label: 'Urgente' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.titulo.trim() || !formData.descripcion.trim() || !formData.asignadoA || !user) {
      return
    }

    const nuevaTarea = {
      id: `tarea-${Date.now()}`,
      titulo: formData.titulo.trim(),
      descripcion: formData.descripcion.trim(),
      estado: 'pendiente' as EstadoTarea,
      prioridad: formData.prioridad,
      fechaCreacion: new Date(),
      fechaVencimiento: formData.fechaVencimiento ? new Date(formData.fechaVencimiento) : undefined,
      asignadoPor: user.id,
      asignadoA: formData.asignadoA,
      ticketId: formData.ticketId || undefined,
      clienteId: formData.clienteId || undefined,
      facturaId: formData.facturaId || undefined,
      comentarios: [],
      etiquetas: formData.etiquetas,
    }

    addTarea(nuevaTarea)
    handleReset()
    onOpenChange(false)
  }

  const handleReset = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      prioridad: 'media',
      asignadoA: '',
      fechaVencimiento: '',
      ticketId: '',
      clienteId: '',
      facturaId: '',
      etiquetas: [],
    })
    setNuevaEtiqueta('')
  }

  const handleAgregarEtiqueta = () => {
    if (nuevaEtiqueta.trim() && !formData.etiquetas.includes(nuevaEtiqueta.trim())) {
      setFormData(prev => ({
        ...prev,
        etiquetas: [...prev.etiquetas, nuevaEtiqueta.trim()]
      }))
      setNuevaEtiqueta('')
    }
  }

  const handleEliminarEtiqueta = (etiqueta: string) => {
    setFormData(prev => ({
      ...prev,
      etiquetas: prev.etiquetas.filter(e => e !== etiqueta)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target === e.currentTarget) {
      e.preventDefault()
      handleAgregarEtiqueta()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Nueva Tarea
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Título de la tarea"
                  required
                />
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Describe la tarea en detalle"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prioridad">Prioridad</Label>
                  <Select
                    value={formData.prioridad}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, prioridad: value as PrioridadTarea }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {prioridades.map((prioridad) => (
                        <SelectItem key={prioridad.value} value={prioridad.value}>
                          {prioridad.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="asignadoA">Asignar a *</Label>
                  <Select
                    value={formData.asignadoA}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, asignadoA: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      {usuarios.map((usuario) => (
                        <SelectItem key={usuario.id} value={usuario.id}>
                          {usuario.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="fechaVencimiento">Fecha de vencimiento</Label>
                <Input
                  id="fechaVencimiento"
                  type="datetime-local"
                  value={formData.fechaVencimiento}
                  onChange={(e) => setFormData(prev => ({ ...prev, fechaVencimiento: e.target.value }))}
                />
              </div>
            </div>

            {/* Referencias opcionales */}
            <div className="space-y-4">
              <h4 className="font-medium">Referencias (opcional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="ticketId">ID Ticket</Label>
                  <Input
                    id="ticketId"
                    value={formData.ticketId}
                    onChange={(e) => setFormData(prev => ({ ...prev, ticketId: e.target.value }))}
                    placeholder="ticket-123"
                  />
                </div>
                <div>
                  <Label htmlFor="clienteId">ID Cliente</Label>
                  <Input
                    id="clienteId"
                    value={formData.clienteId}
                    onChange={(e) => setFormData(prev => ({ ...prev, clienteId: e.target.value }))}
                    placeholder="cliente-456"
                  />
                </div>
                <div>
                  <Label htmlFor="facturaId">ID Factura</Label>
                  <Input
                    id="facturaId"
                    value={formData.facturaId}
                    onChange={(e) => setFormData(prev => ({ ...prev, facturaId: e.target.value }))}
                    placeholder="factura-789"
                  />
                </div>
              </div>
            </div>

            {/* Etiquetas */}
            <div className="space-y-4">
              <h4 className="font-medium">Etiquetas</h4>
              <div className="flex gap-2">
                <Input
                  value={nuevaEtiqueta}
                  onChange={(e) => setNuevaEtiqueta(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Agregar etiqueta"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAgregarEtiqueta}
                  disabled={!nuevaEtiqueta.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.etiquetas.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.etiquetas.map((etiqueta) => (
                    <Badge
                      key={etiqueta}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleEliminarEtiqueta(etiqueta)}
                    >
                      {etiqueta} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!formData.titulo.trim() || !formData.descripcion.trim() || !formData.asignadoA}
              >
                Crear Tarea
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 