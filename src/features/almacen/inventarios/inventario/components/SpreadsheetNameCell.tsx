import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SpreadsheetNameCellProps {
  nombre: string
  descripcion: string | undefined
  onSaveNombre: (value: string) => void
  onSaveDescripcion: (value: string) => void
  isEditingMode: boolean
}

export function SpreadsheetNameCell({
  nombre,
  descripcion,
  onSaveNombre,
  onSaveDescripcion,
  isEditingMode
}: SpreadsheetNameCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editNombre, setEditNombre] = useState(nombre)
  const [editDescripcion, setEditDescripcion] = useState(descripcion || '')
  const nombreInputRef = useRef<HTMLInputElement>(null)
  const descripcionInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditNombre(nombre)
    setEditDescripcion(descripcion || '')
  }, [nombre, descripcion])

  useEffect(() => {
    if (isEditing && nombreInputRef.current) {
      // Pequeño delay para asegurar que el input esté renderizado
      setTimeout(() => {
        nombreInputRef.current?.focus()
        // Si el nombre está vacío, no seleccionar texto
        if (nombre && nombre.trim() !== '') {
          nombreInputRef.current?.select()
        }
      }, 0)
    }
  }, [isEditing, nombre])

  const handleClick = () => {
    if (!isEditingMode) return
    setIsEditing(true)
    // Si el nombre está vacío, inicializar con string vacío para permitir escribir
    setEditNombre(nombre || '')
    setEditDescripcion(descripcion || '')
  }

  const handleBlur = () => {
    setTimeout(() => {
      const activeElement = document.activeElement
      const container = nombreInputRef.current?.closest('div')
      
      if (container && container.contains(activeElement)) {
        return
      }
      
      setIsEditing(false)
      // Guardar nombre incluso si estaba vacío antes
      const nombreAnterior = nombre || ''
      const nombreNuevo = editNombre.trim()
      if (nombreNuevo !== nombreAnterior) {
        onSaveNombre(nombreNuevo)
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
    } else if (e.key === 'Tab') {
      handleBlur()
    }
  }

  // Si no está en modo edición, mostrar solo texto
  if (!isEditingMode) {
    const nombreVacio = !nombre || nombre.trim() === ''
    return (
      <div className="space-y-1">
        {nombreVacio ? (
          <div className="font-medium px-2 text-muted-foreground/50 italic">Sin nombre</div>
        ) : (
          <div className="font-medium px-2">{nombre}</div>
        )}
        {descripcion ? (
          <div className="text-xs text-muted-foreground px-2">{descripcion}</div>
        ) : (
          <div className="text-xs text-muted-foreground/50 italic px-2">Sin descripción</div>
        )}
      </div>
    )
  }

  // Si está en modo edición pero no editando esta celda específica
  if (!isEditing) {
    const nombreVacio = !nombre || nombre.trim() === ''
    return (
      <div
        onClick={handleClick}
        className={cn(
          "space-y-1 cursor-pointer hover:bg-muted/70 rounded px-2 py-1 -mx-2 -my-1 transition-colors border border-transparent hover:border-primary/30",
          nombreVacio && "border-dashed border-primary/30 bg-muted/30"
        )}
        title="Clic para editar nombre y descripción"
      >
        {nombreVacio ? (
          <div className="font-medium text-muted-foreground/50 italic">Clic para agregar nombre</div>
        ) : (
          <div className="font-medium">{nombre}</div>
        )}
        {descripcion ? (
          <div className="text-xs text-muted-foreground">{descripcion}</div>
        ) : (
          <div className="text-xs text-muted-foreground/50 italic">Sin descripción</div>
        )}
      </div>
    )
  }

  // Modo edición activo
  return (
    <div className="space-y-1" onBlur={handleBlur}>
      <Input
        ref={nombreInputRef}
        type="text"
        value={editNombre}
        onChange={(e) => setEditNombre(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e, 'nombre')}
        className="h-8 px-2 border-primary/50 focus-visible:ring-1 focus-visible:ring-primary font-medium"
        placeholder="Nombre del artículo"
      />
      <Input
        ref={descripcionInputRef}
        type="text"
        value={editDescripcion}
        onChange={(e) => setEditDescripcion(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e, 'descripcion')}
        className="h-6 px-2 border-primary/50 focus-visible:ring-1 focus-visible:ring-primary text-xs text-muted-foreground"
        placeholder="Descripción (opcional)"
      />
    </div>
  )
}

