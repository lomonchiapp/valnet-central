import { Table } from '@tanstack/react-table'
import { Edit, X, Keyboard, ChevronDown, Box, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Articulo, TipoArticulo } from 'shared-types'
import { toast } from 'sonner'

interface ArticulosTableToolbarProps {
  table: Table<Articulo>
  articulos: Articulo[]
  viewMode: 'materiales' | 'equipos'
  setViewMode: (mode: 'materiales' | 'equipos') => void
  isSpreadsheetMode: boolean
  setIsSpreadsheetMode: (mode: boolean) => void
}

export function ArticulosTableToolbar({
  table,
  articulos,
  viewMode,
  setViewMode,
  isSpreadsheetMode,
  setIsSpreadsheetMode
}: ArticulosTableToolbarProps) {
  return (
    <div className="w-full space-y-4">
      {/* Toggle para cambiar entre Materiales y Equipos */}
      <div className="flex items-center justify-between gap-4">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'materiales' | 'equipos')} className="w-auto">
          <TabsList>
            <TabsTrigger value="materiales" className="flex items-center gap-2">
              <Box className="h-4 w-4" />
              Materiales ({articulos.filter(a => a.tipo === TipoArticulo.MATERIAL).length})
            </TabsTrigger>
            <TabsTrigger value="equipos" className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              Equipos ({articulos.filter(a => a.tipo === TipoArticulo.EQUIPO).length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder={`Filtrar por nombre${viewMode === 'equipos' ? ', serial o MAC' : ''}...`}
            value={(table.getColumn('nombre')?.getFilterValue() as string) ?? ''}
            onChange={(event) => {
              const value = event.target.value
              table.getColumn('nombre')?.setFilterValue(value)
            }}
            className="max-w-sm"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={isSpreadsheetMode ? "default" : "outline"}
            onClick={() => {
              setIsSpreadsheetMode(!isSpreadsheetMode)
              if (!isSpreadsheetMode) {
                toast.info('Modo edición activado. Haz clic en cualquier celda para editar.', {
                  duration: 3000,
                })
              } else {
                toast.info('Modo edición desactivado.')
              }
            }}
            className="flex items-center gap-2"
          >
            {isSpreadsheetMode ? (
              <>
                <X className="h-4 w-4" />
                Salir de Edición
              </>
            ) : (
              <>
                <Edit className="h-4 w-4" />
                Modo Edición
              </>
            )}
          </Button>
          {!isSpreadsheetMode && (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Keyboard className="h-3 w-3" />
              Ctrl+E
            </Badge>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columnas <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
