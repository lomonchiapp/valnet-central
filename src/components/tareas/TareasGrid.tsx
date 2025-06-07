import { useState } from 'react'
import { Calendar, User, MessageSquare, MoreVertical, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTareasStore } from '@/stores/tareasStore'
import { TareaDetailDialog } from '@/components/tareas/TareaDetailDialog'
import type { Tarea } from '@/types'

interface TareasGridProps {
  tareas: Tarea[]
}

export function TareasGrid({ tareas }: TareasGridProps) {
  const [tareaSeleccionada, setTareaSeleccionada] = useState<Tarea | null>(null)
  const { cambiarEstadoTarea, deleteTarea } = useTareasStore()

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

  const isVencida = (tarea: Tarea) => {
    if (!tarea.fechaVencimiento || tarea.estado === 'completada') return false
    return new Date(tarea.fechaVencimiento) < new Date()
  }

  const formatFecha = (fecha: Date) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tareas.map((tarea) => (
          <Card 
            key={tarea.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              isVencida(tarea) ? 'ring-2 ring-red-200 bg-red-50/50' : ''
            }`}
            onClick={() => setTareaSeleccionada(tarea)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getPrioridadColor(tarea.prioridad)}>
                      {getPrioridadLabel(tarea.prioridad)}
                    </Badge>
                    {isVencida(tarea) && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                    {tarea.titulo}
                  </h3>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        setTareaSeleccionada(tarea)
                      }}
                    >
                      Ver detalles
                    </DropdownMenuItem>
                    {tarea.estado !== 'completada' && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          cambiarEstadoTarea(tarea.id, 'completada')
                        }}
                      >
                        Marcar como completada
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteTarea(tarea.id)
                      }}
                      className="text-red-600"
                    >
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {tarea.descripcion}
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={getEstadoColor(tarea.estado)}>
                    {getEstadoLabel(tarea.estado)}
                  </Badge>
                  {tarea.comentarios.length > 0 && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      {tarea.comentarios.length}
                    </div>
                  )}
                </div>

                {tarea.fechaVencimiento && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span className={isVencida(tarea) ? 'text-red-600 font-medium' : ''}>
                      {formatFecha(tarea.fechaVencimiento)}
                    </span>
                  </div>
                )}

                <div className="flex items-center text-xs text-muted-foreground">
                  <User className="h-3 w-3 mr-1" />
                  <span>Asignado a: {tarea.asignadoA}</span>
                </div>

                {tarea.etiquetas && tarea.etiquetas.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tarea.etiquetas.slice(0, 2).map((etiqueta) => (
                      <Badge key={etiqueta} variant="secondary" className="text-xs">
                        {etiqueta}
                      </Badge>
                    ))}
                    {tarea.etiquetas.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{tarea.etiquetas.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <TareaDetailDialog
        tarea={tareaSeleccionada}
        open={!!tareaSeleccionada}
        onOpenChange={(open: boolean) => !open && setTareaSeleccionada(null)}
      />
    </>
  )
} 