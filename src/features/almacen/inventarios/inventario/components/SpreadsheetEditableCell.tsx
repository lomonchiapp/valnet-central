import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SpreadsheetEditableCellProps {
  value: string | number
  onSave: (value: string | number) => void
  type?: 'text' | 'number' | 'currency'
  className?: string
  placeholder?: string
  isEditingMode: boolean
  disabled?: boolean
}

export function SpreadsheetEditableCell({
  value,
  onSave,
  type = 'text',
  className,
  placeholder,
  isEditingMode,
  disabled = false
}: SpreadsheetEditableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(String(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditValue(String(value))
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleClick = () => {
    if (!isEditingMode || disabled) return
    setIsEditing(true)
    // Inicializar con el valor actual o string vacío si es undefined/null
    setEditValue(String(value || ''))
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (type === 'number' || type === 'currency') {
      const numValue = parseFloat(editValue)
      if (!isNaN(numValue) && numValue !== Number(value)) {
        onSave(numValue)
      } else {
        setEditValue(String(value))
      }
    } else {
      // Para campos de texto, guardar incluso si está vacío (permite borrar valores)
      const valorAnterior = String(value || '')
      const valorNuevo = editValue
      if (valorNuevo !== valorAnterior) {
        onSave(valorNuevo)
      } else {
        setEditValue(valorAnterior)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur()
    } else if (e.key === 'Escape') {
      setEditValue(String(value))
      setIsEditing(false)
    } else if (e.key === 'Tab') {
      handleBlur()
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

  // Si no está en modo edición, mostrar solo texto
  if (!isEditingMode) {
    const displayValue = formatDisplay(value)
    const isEmpty = !String(value) && placeholder
    return (
      <div className={cn("px-2 py-1", isEmpty && "text-muted-foreground/50 italic", className)}>
        {displayValue}
      </div>
    )
  }

  // Si está en modo edición pero no editando esta celda específica
  if (!isEditing) {
    const displayValue = formatDisplay(value)
    const isEmpty = !String(value) && placeholder
    return (
      <div
        onClick={handleClick}
        className={cn(
          "min-h-[32px] px-2 py-1 rounded cursor-pointer hover:bg-muted/70 transition-colors flex items-center border border-transparent hover:border-primary/30",
          isEmpty && "text-muted-foreground/50 italic",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        title={disabled ? undefined : "Clic para editar"}
      >
        {displayValue}
      </div>
    )
  }

  // Modo edición activo
  return (
    <Input
      ref={inputRef}
      type={type === 'currency' ? 'number' : type}
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={cn(
        "h-8 px-2 border-primary/50 focus-visible:ring-1 focus-visible:ring-primary",
        className
      )}
      step={type === 'number' || type === 'currency' ? '0.01' : undefined}
      min={type === 'number' || type === 'currency' ? 0 : undefined}
      placeholder={placeholder}
      disabled={disabled}
    />
  )
}

