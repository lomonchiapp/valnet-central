export interface Tarea {
  id: string
  titulo: string
  descripcion: string
  estado: EstadoTarea
  prioridad: PrioridadTarea
  fechaCreacion: Date
  fechaVencimiento?: Date
  fechaCompletado?: Date
  asignadoPor: string // ID del usuario que asigna
  asignadoA: string // ID del usuario asignado
  
  // Referencias opcionales
  ticketId?: string
  clienteId?: string
  facturaId?: string
  
  // Comentarios/actualizaciones
  comentarios: ComentarioTarea[]
  
  // Metadatos
  etiquetas?: string[]
  archivosAdjuntos?: ArchivoAdjunto[]
}

export type EstadoTarea = 'pendiente' | 'en_progreso' | 'completada' | 'cancelada'

export type PrioridadTarea = 'baja' | 'media' | 'alta' | 'urgente'

export interface ComentarioTarea {
  id: string
  tareaId: string
  usuarioId: string
  contenido: string
  fecha: Date
}

export interface ArchivoAdjunto {
  id: string
  nombre: string
  url: string
  tipo: string
  tamaño: number
  fecha: Date
}

export interface FiltroTareas {
  estado?: EstadoTarea[]
  prioridad?: PrioridadTarea[]
  asignadoA?: string[]
  asignadoPor?: string[]
  fechaDesde?: Date
  fechaHasta?: Date
  busqueda?: string
}

export interface EstadisticasTareas {
  total: number
  pendientes: number
  enProgreso: number
  completadas: number
  vencidas: number
  porPrioridad: {
    baja: number
    media: number
    alta: number
    urgente: number
  }
} 