import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Articulo } from 'shared-types'
import { EntradaDialog } from './EntradaDialog'
import { SalidaDialog } from './SalidaDialog'

interface EditableCellProps {
  value: string | number
  onSave: (value: string | number) => void
  type?: 'text' | 'number' | 'currency'
  className?: string
  placeholder?: string
}

export function EditableCell({ 
  value, 
  onSave, 
  type = 'text',
  className,
  placeholder 
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(String(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleClick = () => {
    setIsEditing(true)
    setEditValue(String(value))
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (type === 'number') {
      const numValue = parseFloat(editValue)
      if (!isNaN(numValue) && numValue !== value) {
        onSave(numValue)
      }
    } else if (editValue !== String(value)) {
      onSave(editValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur()
    } else if (e.key === 'Escape') {
      setEditValue(String(value))
      setIsEditing(false)
    }
  }

  const formatDisplay = (val: string | number) => {
    if (type === 'currency') {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
      }).format(Number(val))
    }
    const strVal = String(val)
    if (!strVal && placeholder) {
      return placeholder
    }
    return strVal
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type={type === 'currency' ? 'number' : type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn("h-8 px-2", className)}
        step={type === 'number' || type === 'currency' ? '0.01' : undefined}
        min={type === 'number' || type === 'currency' ? 0 : undefined}
      />
    )
  }

  const displayValue = formatDisplay(value)
  const isEmpty = !String(value) && placeholder

  return (
    <div
      onClick={handleClick}
      className={cn(
        "min-h-[32px] px-2 py-1 rounded cursor-pointer hover:bg-muted transition-colors flex items-center",
        isEmpty && "text-muted-foreground/50 italic",
        className
      )}
      title="Clic para editar"
    >
      {displayValue}
    </div>
  )
}

interface QuantityCellProps {
  articulo: Articulo
  onEntrada: (cantidad: number) => void
  onSalida: (cantidad: number, descripcion: string, inventarioDestinoId?: string) => void
  onDirectEdit?: (value: number) => void
  isMaterial: boolean
}

export function QuantityCell({ 
  articulo,
  onEntrada,
  onSalida,
  onDirectEdit,
  isMaterial 
}: QuantityCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isEntradaDialogOpen, setIsEntradaDialogOpen] = useState(false)
  const [isSalidaDialogOpen, setIsSalidaDialogOpen] = useState(false)
  const [editValue, setEditValue] = useState(String(articulo.cantidad))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleClick = () => {
    if (isMaterial && onDirectEdit) {
      setIsEditing(true)
      setEditValue(String(articulo.cantidad))
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (onDirectEdit) {
      const numValue = parseFloat(editValue)
      if (!isNaN(numValue) && numValue !== articulo.cantidad && numValue >= 0) {
        onDirectEdit(numValue)
      } else {
        setEditValue(String(articulo.cantidad))
      }
    }
  }

  const handleEntradaConfirm = (cantidad: number) => {
    onEntrada(cantidad)
  }

  const handleSalidaConfirm = (cantidad: number, descripcion: string, inventarioDestinoId?: string) => {
    onSalida(cantidad, descripcion, inventarioDestinoId)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur()
    } else if (e.key === 'Escape') {
      setEditValue(String(value))
      setIsEditing(false)
    }
  }

  if (!isMaterial) {
    return <span className="px-2">{value}</span>
  }

  if (isEditing && onDirectEdit) {
    return (
      <div className="flex items-center gap-0.5">
        <Input
          ref={inputRef}
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="h-8 w-20 px-2 text-center"
          min={0}
        />
        <span className="text-[10px] text-muted-foreground">{articulo.unidad}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-0.5">
      <SalidaDialog
        open={isSalidaDialogOpen}
        onOpenChange={setIsSalidaDialogOpen}
        articulo={articulo}
        onConfirm={handleSalidaConfirm}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation()
            setIsSalidaDialogOpen(true)
          }}
          disabled={articulo.cantidad <= 0}
          title="Dar salida del inventario"
        >
          <Minus className="h-3 w-3" />
        </Button>
      </SalidaDialog>
      
      <div
        onClick={handleClick}
        className={cn(
          "px-1.5 py-0.5 rounded cursor-pointer hover:bg-muted transition-colors text-center flex flex-col items-center justify-center min-w-[40px]",
          articulo.cantidad <= 0 && "text-muted-foreground"
        )}
        title="Clic para editar directamente"
      >
        <span className="font-medium text-sm leading-none">{articulo.cantidad}</span>
        <span className="text-[10px] text-muted-foreground font-normal leading-none mt-0.5">{articulo.unidad}</span>
      </div>
      
      <EntradaDialog
        open={isEntradaDialogOpen}
        onOpenChange={setIsEntradaDialogOpen}
        articulo={articulo}
        onConfirm={handleEntradaConfirm}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation()
            setIsEntradaDialogOpen(true)
          }}
          title="Agregar entrada al inventario"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </EntradaDialog>
    </div>
  )
}

