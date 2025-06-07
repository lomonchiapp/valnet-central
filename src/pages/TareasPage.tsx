import { useState } from 'react'
import { Plus, Filter, Search, BarChart3 } from 'lucide-react'
import { useTareasStore } from '@/stores/tareasStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TareasGrid } from '@/components/tareas/TareasGrid'
import { TareasTable } from '@/components/tareas/TareasTable'
import { NuevaTareaDialog } from '@/components/tareas/NuevaTareaDialog'
import { FiltrosTareas } from '@/components/tareas/FiltrosTareas'
import { EstadisticasTareas } from '@/components/tareas/EstadisticasTareas'

export function TareasPage() {
  const [mostrarNuevaTarea, setMostrarNuevaTarea] = useState(false)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [vistaTipo, setVistaTipo] = useState<'grid' | 'table'>('grid')
  const [busqueda, setBusqueda] = useState('')

  const { 
    filtros, 
    setFiltros, 
    clearFiltros, 
    getTareasFiltradas, 
    getEstadisticas 
  } = useTareasStore()

  const tareasFiltradas = getTareasFiltradas()
  const estadisticas = getEstadisticas()

  const handleBusqueda = (valor: string) => {
    setBusqueda(valor)
    setFiltros({ busqueda: valor })
  }

  const filtrosActivos = Object.values(filtros).some(
    filtro => Array.isArray(filtro) ? filtro.length > 0 : Boolean(filtro)
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Tareas</h1>
          <p className="text-muted-foreground">
            Asigna y administra tareas para tu equipo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={filtrosActivos ? 'border-primary bg-primary/10' : ''}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            {filtrosActivos && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                !
              </Badge>
            )}
          </Button>
          <Button onClick={() => setMostrarNuevaTarea(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tarea
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <EstadisticasTareas estadisticas={estadisticas} />

      {/* Filtros colapsables */}
      {mostrarFiltros && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Filtros
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearFiltros()
                  setBusqueda('')
                }}
                disabled={!filtrosActivos}
              >
                Limpiar filtros
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FiltrosTareas />
          </CardContent>
        </Card>
      )}

      {/* Barra de búsqueda y controles de vista */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar tareas..."
            value={busqueda}
            onChange={(e) => handleBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {tareasFiltradas.length} de {estadisticas.total} tareas
          </span>
          <Tabs value={vistaTipo} onValueChange={(value) => setVistaTipo(value as 'grid' | 'table')}>
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="grid" className="px-3">
                <BarChart3 className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="table" className="px-3">
                <Filter className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Lista de tareas */}
      <div className="min-h-[400px]">
        {tareasFiltradas.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No hay tareas</h3>
              <p className="text-muted-foreground mb-4">
                {filtrosActivos || busqueda
                  ? 'No se encontraron tareas con los filtros aplicados'
                  : 'Comienza creando tu primera tarea'}
              </p>
              {(!filtrosActivos && !busqueda) && (
                <Button onClick={() => setMostrarNuevaTarea(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primera tarea
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <>
            {vistaTipo === 'grid' ? (
              <TareasGrid tareas={tareasFiltradas} />
            ) : (
              <TareasTable tareas={tareasFiltradas} />
            )}
          </>
        )}
      </div>

      {/* Diálogos */}
      <NuevaTareaDialog
        open={mostrarNuevaTarea}
        onOpenChange={setMostrarNuevaTarea}
      />
    </div>
  )
} 