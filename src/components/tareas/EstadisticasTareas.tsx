import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckSquare, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import type { EstadisticasTareas } from '@/types'

interface EstadisticasTareasProps {
  estadisticas: EstadisticasTareas
}

export function EstadisticasTareas({ estadisticas }: EstadisticasTareasProps) {
  const stats = [
    {
      titulo: 'Total',
      valor: estadisticas.total,
      icon: CheckSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      titulo: 'Pendientes',
      valor: estadisticas.pendientes,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      titulo: 'En Progreso',
      valor: estadisticas.enProgreso,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      titulo: 'Completadas',
      valor: estadisticas.completadas,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      titulo: 'Vencidas',
      valor: estadisticas.vencidas,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ]

  const prioridades = [
    { label: 'Urgente', valor: estadisticas.porPrioridad.urgente, color: 'bg-red-500' },
    { label: 'Alta', valor: estadisticas.porPrioridad.alta, color: 'bg-orange-500' },
    { label: 'Media', valor: estadisticas.porPrioridad.media, color: 'bg-yellow-500' },
    { label: 'Baja', valor: estadisticas.porPrioridad.baja, color: 'bg-green-500' },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      {/* Estadísticas principales */}
      {stats.map((stat) => (
        <Card key={stat.titulo}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.valor}</p>
                <p className="text-sm text-muted-foreground">{stat.titulo}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Distribución por prioridad */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Por Prioridad</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-2">
            {prioridades.map((prioridad) => (
              <div key={prioridad.label} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${prioridad.color}`} />
                  <span className="text-sm">{prioridad.label}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {prioridad.valor}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 