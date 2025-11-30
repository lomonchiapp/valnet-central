import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface EditableNameCellProps {
  nombre: string
  descripcion: string | undefined
  onSaveNombre: (value: string) => void
  onSaveDescripcion: (value: string) => void
  onEditingChange?: (isEditing: boolean) => void
  className?: string
}

export function EditableNameCell({
  nombre,
  descripcion,
  onSaveNombre,
  onSaveDescripcion,
  onEditingChange,
  className
}: EditableNameCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editNombre, setEditNombre] = useState(nombre)
  const [editDescripcion, setEditDescripcion] = useState(descripcion || '')
  const nombreInputRef = useRef<HTMLInputElement>(null)
  const descripcionInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && nombreInputRef.current) {
      nombreInputRef.current.focus()
      nombreInputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    if (!isEditing) {
      setEditNombre(nombre)
      setEditDescripcion(descripcion || '')
    }
  }, [nombre, descripcion, isEditing])

  const handleClick = () => {
    setIsEditing(true)
    setEditNombre(nombre)
    setEditDescripcion(descripcion || '')
    onEditingChange?.(true)
  }

  const handleBlur = (e: React.FocusEvent) => {
    // Usar setTimeout para verificar el nuevo elemento con foco después de que ocurra el blur
    setTimeout(() => {
      const activeElement = document.activeElement
      const container = e.currentTarget as HTMLElement
      
      // Si el nuevo elemento con foco está dentro del contenedor, no cerrar
      if (container && container.contains(activeElement)) {
        return
      }
      
      setIsEditing(false)
      onEditingChange?.(false)
      if (editNombre !== nombre) {
        onSaveNombre(editNombre)
      }
      if (editDescripcion !== (descripcion || '')) {
        onSaveDescripcion(editDescripcion)
      }
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent, field: 'nombre' | 'descripcion') => {
    if (e.key === 'Enter') {
      if (field === 'nombre' && descripcionInputRef.current) {
        descripcionInputRef.current.focus()
      } else {
        handleBlur()
      }
    } else if (e.key === 'Escape') {
      setEditNombre(nombre)
      setEditDescripcion(descripcion || '')
      setIsEditing(false)
      onEditingChange?.(false)
    }
  }

  if (isEditing) {
    return (
      <div 
        className="space-y-1"
        onBlur={handleBlur}
      >
        <Input
          ref={nombreInputRef}
          type="text"
          value={editNombre}
          onChange={(e) => setEditNombre(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, 'nombre')}
          className={cn(
            "h-8 px-2 bg-transparent border border-primary/30 rounded shadow-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 p-0 font-medium",
            className
          )}
          placeholder="Nombre del artículo"
        />
        <Input
          ref={descripcionInputRef}
          type="text"
          value={editDescripcion}
          onChange={(e) => setEditDescripcion(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, 'descripcion')}
          className={cn(
            "h-6 px-2 bg-transparent border border-primary/30 rounded shadow-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 p-0 text-xs text-muted-foreground",
            className
          )}
          placeholder="Descripción (opcional)"
        />
      </div>
    )
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        "space-y-1 cursor-pointer hover:bg-muted/50 rounded px-2 py-1 -mx-2 -my-1 transition-colors",
        className
      )}
      title="Clic para editar nombre y descripción"
    >
      <div className="font-medium">{nombre}</div>
      {descripcion ? (
        <div className="text-xs text-muted-foreground">{descripcion}</div>
      ) : (
        <div className="text-xs text-muted-foreground/50 italic">Sin descripción</div>
      )}
    </div>
  )
}

