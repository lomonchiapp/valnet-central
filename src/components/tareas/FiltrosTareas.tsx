import { useTareasStore } from '@/stores/tareasStore'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { EstadoTarea, PrioridadTarea } from '@/types'

export function FiltrosTareas() {
  const { filtros, setFiltros } = useTareasStore()

  const estados: { value: EstadoTarea; label: string }[] = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_progreso', label: 'En Progreso' },
    { value: 'completada', label: 'Completada' },
    { value: 'cancelada', label: 'Cancelada' },
  ]

  const prioridades: { value: PrioridadTarea; label: string; color: string }[] = [
    { value: 'urgente', label: 'Urgente', color: 'bg-red-100 text-red-800' },
    { value: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
    { value: 'media', label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'baja', label: 'Baja', color: 'bg-green-100 text-green-800' },
  ]

  const handleEstadoChange = (estado: EstadoTarea, checked: boolean) => {
    const estadosActuales = filtros.estado || []
    
    if (checked) {
      setFiltros({ estado: [...estadosActuales, estado] })
    } else {
      setFiltros({ estado: estadosActuales.filter(e => e !== estado) })
    }
  }

  const handlePrioridadChange = (prioridad: PrioridadTarea, checked: boolean) => {
    const prioridadesActuales = filtros.prioridad || []
    
    if (checked) {
      setFiltros({ prioridad: [...prioridadesActuales, prioridad] })
    } else {
      setFiltros({ prioridad: prioridadesActuales.filter(p => p !== prioridad) })
    }
  }

  // Mock users - en una app real vendría de un store de usuarios
  const usuarios = [
    { id: 'admin-001', nombre: 'Administrador' },
    { id: 'coord-001', nombre: 'Coordinador García' },
    { id: 'tech-001', nombre: 'Técnico López' },
    { id: 'tech-002', nombre: 'Técnico Martínez' },
  ]

  const handleUsuarioAsignadoChange = (usuarioId: string, checked: boolean) => {
    const usuariosActuales = filtros.asignadoA || []
    
    if (checked) {
      setFiltros({ asignadoA: [...usuariosActuales, usuarioId] })
    } else {
      setFiltros({ asignadoA: usuariosActuales.filter(u => u !== usuarioId) })
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Filtro por estado */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Estado</h4>
        <div className="space-y-2">
          {estados.map((estado) => (
            <div key={estado.value} className="flex items-center space-x-2">
              <Checkbox
                id={`estado-${estado.value}`}
                checked={filtros.estado?.includes(estado.value) || false}
                onCheckedChange={(checked) => 
                  handleEstadoChange(estado.value, checked as boolean)
                }
              />
              <Label 
                htmlFor={`estado-${estado.value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {estado.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Filtro por prioridad */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Prioridad</h4>
        <div className="space-y-2">
          {prioridades.map((prioridad) => (
            <div key={prioridad.value} className="flex items-center space-x-2">
              <Checkbox
                id={`prioridad-${prioridad.value}`}
                checked={filtros.prioridad?.includes(prioridad.value) || false}
                onCheckedChange={(checked) => 
                  handlePrioridadChange(prioridad.value, checked as boolean)
                }
              />
              <Label 
                htmlFor={`prioridad-${prioridad.value}`}
                className="text-sm font-normal cursor-pointer flex items-center gap-2"
              >
                <Badge className={`${prioridad.color} text-xs`}>
                  {prioridad.label}
                </Badge>
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Filtro por usuario asignado */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Asignado a</h4>
        <div className="space-y-2">
          {usuarios.map((usuario) => (
            <div key={usuario.id} className="flex items-center space-x-2">
              <Checkbox
                id={`usuario-${usuario.id}`}
                checked={filtros.asignadoA?.includes(usuario.id) || false}
                onCheckedChange={(checked) => 
                  handleUsuarioAsignadoChange(usuario.id, checked as boolean)
                }
              />
              <Label 
                htmlFor={`usuario-${usuario.id}`}
                className="text-sm font-normal cursor-pointer"
              >
                {usuario.nombre}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen de filtros activos */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Filtros activos</h4>
        <div className="space-y-2">
          {filtros.estado && filtros.estado.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground">Estados:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {filtros.estado.map((estado) => (
                  <Badge key={estado} variant="secondary" className="text-xs">
                    {estados.find(e => e.value === estado)?.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {filtros.prioridad && filtros.prioridad.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground">Prioridades:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {filtros.prioridad.map((prioridad) => {
                  const prioridadInfo = prioridades.find(p => p.value === prioridad)
                  return (
                    <Badge 
                      key={prioridad} 
                      className={`${prioridadInfo?.color} text-xs`}
                    >
                      {prioridadInfo?.label}
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}
          
          {filtros.asignadoA && filtros.asignadoA.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground">Usuarios:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {filtros.asignadoA.map((usuarioId) => (
                  <Badge key={usuarioId} variant="outline" className="text-xs">
                    {usuarios.find(u => u.id === usuarioId)?.nombre || usuarioId}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {(!filtros.estado?.length && !filtros.prioridad?.length && !filtros.asignadoA?.length) && (
            <p className="text-xs text-muted-foreground">
              No hay filtros activos
            </p>
          )}
        </div>
      </div>
    </div>
  )
} 