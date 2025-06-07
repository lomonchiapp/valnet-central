import { create } from 'zustand'
import type { 
  Tarea, 
  EstadoTarea, 
  FiltroTareas,
  EstadisticasTareas,
  ComentarioTarea 
} from '@/types'

interface TareasState {
  tareas: Tarea[]
  tareaSeleccionada: Tarea | null
  filtros: FiltroTareas
  isLoading: boolean
  error: string | null
  
  // Acciones
  setTareas: (tareas: Tarea[]) => void
  addTarea: (tarea: Tarea) => void
  updateTarea: (id: string, actualizaciones: Partial<Tarea>) => void
  deleteTarea: (id: string) => void
  setTareaSeleccionada: (tarea: Tarea | null) => void
  
  // Filtros
  setFiltros: (filtros: Partial<FiltroTareas>) => void
  clearFiltros: () => void
  
  // Estados
  cambiarEstadoTarea: (id: string, estado: EstadoTarea) => void
  asignarTarea: (id: string, usuarioId: string) => void
  
  // Comentarios
  addComentario: (tareaId: string, comentario: Omit<ComentarioTarea, 'id'>) => void
  
  // Utilidades
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Estadísticas computadas
  getEstadisticas: () => EstadisticasTareas
  getTareasFiltradas: () => Tarea[]
  getTareasPorUsuario: (usuarioId: string) => Tarea[]
  getTareasVencidas: () => Tarea[]
}

// Datos mock iniciales
const mockTareas: Tarea[] = [
  {
    id: '1',
    titulo: 'Revisar inventario de routers',
    descripcion: 'Verificar stock disponible para instalaciones de la próxima semana',
    estado: 'pendiente',
    prioridad: 'alta',
    fechaCreacion: new Date('2024-12-16T08:00:00Z'),
    fechaVencimiento: new Date('2024-12-20T18:00:00Z'),
    asignadoPor: 'admin-001',
    asignadoA: 'coord-001',
    comentarios: [],
    etiquetas: ['inventario', 'urgente'],
  },
  {
    id: '2',
    titulo: 'Actualizar documentación técnica',
    descripcion: 'Documentar nuevos procedimientos de instalación para fibra óptica',
    estado: 'en_progreso',
    prioridad: 'media',
    fechaCreacion: new Date('2024-12-15T10:00:00Z'),
    fechaVencimiento: new Date('2024-12-22T17:00:00Z'),
    asignadoPor: 'coord-001',
    asignadoA: 'tech-001',
    comentarios: [
      {
        id: 'com-1',
        tareaId: '2',
        usuarioId: 'tech-001',
        contenido: 'He comenzado con la documentación del procedimiento básico',
        fecha: new Date('2024-12-16T09:30:00Z')
      }
    ],
    etiquetas: ['documentación', 'técnico'],
  },
  {
    id: '3',
    titulo: 'Planificar rutas de brigadas',
    descripcion: 'Organizar rutas de trabajo para la semana del 23 al 27 de diciembre',
    estado: 'completada',
    prioridad: 'alta',
    fechaCreacion: new Date('2024-12-14T14:00:00Z'),
    fechaVencimiento: new Date('2024-12-18T16:00:00Z'),
    fechaCompletado: new Date('2024-12-17T15:30:00Z'),
    asignadoPor: 'admin-001',
    asignadoA: 'coord-001',
    comentarios: [],
    etiquetas: ['brigadas', 'planificación'],
  },
  {
    id: '4',
    titulo: 'Resolver ticket #1234',
    descripcion: 'Cliente reporta problemas de conectividad intermitente',
    estado: 'en_progreso',
    prioridad: 'urgente',
    fechaCreacion: new Date('2024-12-16T11:00:00Z'),
    fechaVencimiento: new Date('2024-12-16T18:00:00Z'),
    asignadoPor: 'coord-001',
    asignadoA: 'tech-002',
    ticketId: 'ticket-1234',
    clienteId: 'cliente-567',
    comentarios: [],
    etiquetas: ['soporte', 'cliente'],
  },
]

export const useTareasStore = create<TareasState>((set, get) => ({
  tareas: mockTareas,
  tareaSeleccionada: null,
  filtros: {},
  isLoading: false,
  error: null,

  setTareas: (tareas) => set({ tareas }),
  
  addTarea: (tarea) => set((state) => ({ 
    tareas: [...state.tareas, tarea] 
  })),
  
  updateTarea: (id, actualizaciones) => set((state) => ({
    tareas: state.tareas.map(tarea => 
      tarea.id === id ? { ...tarea, ...actualizaciones } : tarea
    )
  })),
  
  deleteTarea: (id) => set((state) => ({
    tareas: state.tareas.filter(tarea => tarea.id !== id)
  })),
  
  setTareaSeleccionada: (tarea) => set({ tareaSeleccionada: tarea }),
  
  setFiltros: (filtros) => set((state) => ({
    filtros: { ...state.filtros, ...filtros }
  })),
  
  clearFiltros: () => set({ filtros: {} }),
  
  cambiarEstadoTarea: (id, estado) => {
    const actualizaciones: Partial<Tarea> = { 
      estado,
      fechaCompletado: estado === 'completada' ? new Date() : undefined
    }
    get().updateTarea(id, actualizaciones)
  },
  
  asignarTarea: (id, usuarioId) => {
    get().updateTarea(id, { asignadoA: usuarioId })
  },
  
  addComentario: (tareaId, comentario) => {
    const nuevoComentario: ComentarioTarea = {
      ...comentario,
      id: `com-${Date.now()}`,
    }
    
    set((state) => ({
      tareas: state.tareas.map(tarea => 
        tarea.id === tareaId 
          ? { ...tarea, comentarios: [...tarea.comentarios, nuevoComentario] }
          : tarea
      )
    }))
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  getEstadisticas: () => {
    const { tareas } = get()
    const ahora = new Date()
    
    return {
      total: tareas.length,
      pendientes: tareas.filter(t => t.estado === 'pendiente').length,
      enProgreso: tareas.filter(t => t.estado === 'en_progreso').length,
      completadas: tareas.filter(t => t.estado === 'completada').length,
      vencidas: tareas.filter(t => 
        t.fechaVencimiento && 
        new Date(t.fechaVencimiento) < ahora && 
        t.estado !== 'completada'
      ).length,
      porPrioridad: {
        baja: tareas.filter(t => t.prioridad === 'baja').length,
        media: tareas.filter(t => t.prioridad === 'media').length,
        alta: tareas.filter(t => t.prioridad === 'alta').length,
        urgente: tareas.filter(t => t.prioridad === 'urgente').length,
      }
    }
  },
  
  getTareasFiltradas: () => {
    const { tareas, filtros } = get()
    
    return tareas.filter(tarea => {
      if (filtros.estado?.length && !filtros.estado.includes(tarea.estado)) {
        return false
      }
      
      if (filtros.prioridad?.length && !filtros.prioridad.includes(tarea.prioridad)) {
        return false
      }
      
      if (filtros.asignadoA?.length && !filtros.asignadoA.includes(tarea.asignadoA)) {
        return false
      }
      
      if (filtros.asignadoPor?.length && !filtros.asignadoPor.includes(tarea.asignadoPor)) {
        return false
      }
      
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase()
        return (
          tarea.titulo.toLowerCase().includes(busqueda) ||
          tarea.descripcion.toLowerCase().includes(busqueda) ||
          tarea.etiquetas?.some(tag => tag.toLowerCase().includes(busqueda))
        )
      }
      
      return true
    })
  },
  
  getTareasPorUsuario: (usuarioId) => {
    const { tareas } = get()
    return tareas.filter(tarea => tarea.asignadoA === usuarioId)
  },
  
  getTareasVencidas: () => {
    const { tareas } = get()
    const ahora = new Date()
    
    return tareas.filter(tarea => 
      tarea.fechaVencimiento && 
      new Date(tarea.fechaVencimiento) < ahora && 
      tarea.estado !== 'completada'
    )
  },
}))

// Helper para acceder al estado desde fuera de componentes React
export const getTareasState = () => useTareasStore.getState() 