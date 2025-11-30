import { useState, useEffect, useRef } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Articulo } from 'shared-types'

interface EntradaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  articulo: Articulo
  onConfirm: (cantidad: number) => void
  children: React.ReactNode
}

export function EntradaDialog({
  open,
  onOpenChange,
  articulo,
  onConfirm,
  children
}: EntradaDialogProps) {
  const [cantidad, setCantidad] = useState<string>('')
  const [error, setError] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

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

    if (!Number.isInteger(cantidadNum) && articulo.tipo === 'EQUIPO') {
      setError('Solo enteros')
      return
    }

    onConfirm(cantidadNum)
    setCantidad('')
    setError('')
    onOpenChange(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setCantidad('')
      setError('')
    }
    onOpenChange(newOpen)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-2">
          <div className="text-sm font-medium">Entrada: {articulo.nombre}</div>
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
              step={articulo.tipo === 'EQUIPO' ? '1' : '0.01'}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
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
            <span>→ {articulo.cantidad + (parseFloat(cantidad) || 0)}</span>
          </div>
          <Button 
            onClick={handleConfirm} 
            size="sm" 
            className="w-full h-7"
          >
            Confirmar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

