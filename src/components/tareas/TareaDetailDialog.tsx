import { useState } from 'react'
import { Calendar, Clock, User, MessageSquare, Tag } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useTareasStore } from '@/stores/tareasStore'
import { useAuthStore } from '@/stores/authStore'
import type { Tarea, EstadoTarea } from '@/types'

interface TareaDetailDialogProps {
  tarea: Tarea | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TareaDetailDialog({ tarea, open, onOpenChange }: TareaDetailDialogProps) {
  const [nuevoComentario, setNuevoComentario] = useState('')
  const { addComentario, cambiarEstadoTarea } = useTareasStore()
  const { user } = useAuthStore()

  if (!tarea) return null

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'alta':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'baja':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completada':
        return 'bg-green-100 text-green-800'
      case 'en_progreso':
        return 'bg-blue-100 text-blue-800'
      case 'pendiente':
        return 'bg-gray-100 text-gray-800'
      case 'cancelada':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'completada':
        return 'Completada'
      case 'en_progreso':
        return 'En Progreso'
      case 'pendiente':
        return 'Pendiente'
      case 'cancelada':
        return 'Cancelada'
      default:
        return estado
    }
  }

  const getPrioridadLabel = (prioridad: string) => {
    switch (prioridad) {
      case 'urgente':
        return 'Urgente'
      case 'alta':
        return 'Alta'
      case 'media':
        return 'Media'
      case 'baja':
        return 'Baja'
      default:
        return prioridad
    }
  }

  const formatFecha = (fecha: Date) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleAgregarComentario = () => {
    if (!nuevoComentario.trim() || !user) return

    addComentario(tarea.id, {
      tareaId: tarea.id,
      usuarioId: user.id,
      contenido: nuevoComentario.trim(),
      fecha: new Date(),
    })

    setNuevoComentario('')
  }

  const handleCambiarEstado = (nuevoEstado: string) => {
    cambiarEstadoTarea(tarea.id, nuevoEstado as EstadoTarea)
  }

  const isVencida = () => {
    if (!tarea.fechaVencimiento || tarea.estado === 'completada') return false
    return new Date(tarea.fechaVencimiento) < new Date()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {tarea.titulo}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Estado y prioridad */}
            <div className="flex items-center gap-4">
              <Badge className={getPrioridadColor(tarea.prioridad)}>
                {getPrioridadLabel(tarea.prioridad)}
              </Badge>
              <Badge variant="outline" className={getEstadoColor(tarea.estado)}>
                {getEstadoLabel(tarea.estado)}
              </Badge>
              {isVencida() && (
                <Badge variant="destructive">Vencida</Badge>
              )}
            </div>

            {/* Descripción */}
            <div>
              <h4 className="font-medium mb-2">Descripción</h4>
              <p className="text-sm text-muted-foreground">{tarea.descripcion}</p>
            </div>

            {/* Información de fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Creada: {formatFecha(tarea.fechaCreacion)}</span>
              </div>
              {tarea.fechaVencimiento && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className={isVencida() ? 'text-red-600 font-medium' : ''}>
                    Vence: {formatFecha(tarea.fechaVencimiento)}
                  </span>
                </div>
              )}
              {tarea.fechaCompletado && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span>Completada: {formatFecha(tarea.fechaCompletado)}</span>
                </div>
              )}
            </div>

            {/* Asignación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Asignado por: {tarea.asignadoPor}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Asignado a: {tarea.asignadoA}</span>
              </div>
            </div>

            {/* Referencias */}
            {(tarea.ticketId || tarea.clienteId || tarea.facturaId) && (
              <div>
                <h4 className="font-medium mb-2">Referencias</h4>
                <div className="space-y-1">
                  {tarea.ticketId && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Ticket:</span> {tarea.ticketId}
                    </div>
                  )}
                  {tarea.clienteId && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Cliente:</span> {tarea.clienteId}
                    </div>
                  )}
                  {tarea.facturaId && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Factura:</span> {tarea.facturaId}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Etiquetas */}
            {tarea.etiquetas && tarea.etiquetas.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Etiquetas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {tarea.etiquetas.map((etiqueta) => (
                    <Badge key={etiqueta} variant="secondary">
                      {etiqueta}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Acciones de estado */}
            {tarea.estado !== 'completada' && (
              <div>
                <h4 className="font-medium mb-2">Cambiar estado</h4>
                <div className="flex gap-2">
                  {tarea.estado !== 'en_progreso' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCambiarEstado('en_progreso')}
                    >
                      Marcar en progreso
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCambiarEstado('completada')}
                  >
                    Marcar como completada
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            {/* Comentarios */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Comentarios ({tarea.comentarios.length})
              </h4>
              
              <div className="space-y-3">
                {tarea.comentarios.map((comentario) => (
                  <div key={comentario.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{comentario.usuarioId}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatFecha(comentario.fecha)}
                      </span>
                    </div>
                    <p className="text-sm">{comentario.contenido}</p>
                  </div>
                ))}

                {tarea.comentarios.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay comentarios aún
                  </p>
                )}
              </div>

              {/* Agregar comentario */}
              {user && (
                <div className="mt-4 space-y-2">
                  <Textarea
                    placeholder="Agregar un comentario..."
                    value={nuevoComentario}
                    onChange={(e) => setNuevoComentario(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={handleAgregarComentario}
                    disabled={!nuevoComentario.trim()}
                    size="sm"
                  >
                    Agregar comentario
                  </Button>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 