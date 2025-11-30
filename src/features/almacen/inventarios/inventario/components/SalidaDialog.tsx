import { useState, useEffect, useRef } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
import { Articulo } from 'shared-types'
import { Inventario } from 'shared-types'
import { useAlmacenState } from '@/context/global/useAlmacenState'

interface SalidaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  articulo: Articulo
  onConfirm: (cantidad: number, descripcion: string, inventarioDestinoId?: string) => void
  children: React.ReactNode
}

export function SalidaDialog({
  open,
  onOpenChange,
  articulo,
  onConfirm,
  children
}: SalidaDialogProps) {
  const { inventarios } = useAlmacenState()
  const [cantidad, setCantidad] = useState<string>('')
  const [descripcion, setDescripcion] = useState<string>('')
  const [tipoMovimiento, setTipoMovimiento] = useState<'salida' | 'transferencia'>('salida')
  const [inventarioDestinoId, setInventarioDestinoId] = useState<string>('')
  const [error, setError] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Filtrar inventarios disponibles (excluir el actual)
  const inventariosDisponibles = inventarios.filter(
    (inv: Inventario) => inv.id !== articulo.idinventario
  )

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [open])

  const handleConfirm = () => {
    const cantidadNum = parseFloat(cantidad)
    
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      setError('Debe ser mayor a 0')
      return
    }

    if (cantidadNum > articulo.cantidad) {
      setError(`Máx: ${articulo.cantidad}`)
      return
    }

    if (!Number.isInteger(cantidadNum) && articulo.tipo === 'EQUIPO') {
      setError('Solo enteros')
      return
    }

    if (tipoMovimiento === 'transferencia' && !inventarioDestinoId) {
      setError('Selecciona un inventario destino')
      return
    }

    onConfirm(
      cantidadNum, 
      descripcion.trim(),
      tipoMovimiento === 'transferencia' ? inventarioDestinoId : undefined
    )
    setCantidad('')
    setDescripcion('')
    setTipoMovimiento('salida')
    setInventarioDestinoId('')
    setError('')
    onOpenChange(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setCantidad('')
      setDescripcion('')
      setTipoMovimiento('salida')
      setInventarioDestinoId('')
      setError('')
    }
    onOpenChange(newOpen)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="space-y-2">
          <div className="text-sm font-medium">
            {tipoMovimiento === 'transferencia' ? 'Transferencia' : 'Salida'}: {articulo.nombre}
          </div>
          
          {/* Selector de tipo */}
          <div className="space-y-1">
            <Label className="text-xs">Tipo de movimiento</Label>
            <Select
              value={tipoMovimiento}
              onValueChange={(value: 'salida' | 'transferencia') => {
                setTipoMovimiento(value)
                if (value === 'salida') {
                  setInventarioDestinoId('')
                }
                setError('')
              }}
            >
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="salida">Salida del inventario</SelectItem>
                <SelectItem value="transferencia">Transferencia a otro inventario</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              type="number"
              value={cantidad}
              onChange={(e) => {
                setCantidad(e.target.value)
                setError('')
              }}
              placeholder="0"
              min="0"
              max={articulo.cantidad}
              step={articulo.tipo === 'EQUIPO' ? '1' : '0.01'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleConfirm()
                } else if (e.key === 'Escape') {
                  handleOpenChange(false)
                }
              }}
              className="h-8"
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">{articulo.unidad}</span>
          </div>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Actual: {articulo.cantidad}</span>
            <span>→ {Math.max(0, articulo.cantidad - (parseFloat(cantidad) || 0))}</span>
          </div>

          {/* Selector de inventario destino (solo para transferencias) */}
          {tipoMovimiento === 'transferencia' && (
            <div className="space-y-1">
              <Label className="text-xs">Inventario destino</Label>
              <Select
                value={inventarioDestinoId}
                onValueChange={(value) => {
                  setInventarioDestinoId(value)
                  setError('')
                }}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Selecciona inventario" />
                </SelectTrigger>
                <SelectContent>
                  {inventariosDisponibles.map((inv: Inventario) => (
                    <SelectItem key={inv.id} value={inv.id!}>
                      {inv.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1">
            <Input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder={tipoMovimiento === 'transferencia' ? 'Notas (opcional)' : 'Razón (opcional)'}
              className="h-7 text-xs"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleConfirm()
                }
              }}
            />
          </div>
          <Button 
            onClick={handleConfirm} 
            size="sm" 
            className="w-full h-7"
          >
            {tipoMovimiento === 'transferencia' ? 'Transferir' : 'Confirmar Salida'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

