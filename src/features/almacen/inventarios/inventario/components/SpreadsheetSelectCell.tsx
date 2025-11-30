import { useState, useRef, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SpreadsheetSelectCellProps {
  value: string
  options: Array<{ id: string; nombre: string }>
  onSave: (value: string) => void
  placeholder?: string
  className?: string
  isEditingMode: boolean
}

export function SpreadsheetSelectCell({
  value,
  options,
  onSave,
  placeholder = 'Seleccionar...',
  className,
  isEditingMode
}: SpreadsheetSelectCellProps) {
  const [open, setOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const selectedOption = options.find(opt => opt.id === value)

  // Si no está en modo edición, mostrar solo texto
  if (!isEditingMode) {
    return (
      <div className={cn("px-2", className)}>
        <span>{selectedOption?.nombre || placeholder}</span>
      </div>
    )
  }

  // Si está en modo edición pero no editando esta celda específica
  if (!isEditing && !open) {
    return (
      <div
        onClick={() => setIsEditing(true)}
        className={cn(
          "min-h-[32px] px-2 py-1 rounded cursor-pointer hover:bg-muted/70 transition-colors flex items-center justify-between border border-transparent hover:border-primary/30",
          !value && "text-muted-foreground",
          className
        )}
        title="Clic para cambiar"
      >
        <span>{selectedOption?.nombre || placeholder}</span>
        <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
      </div>
    )
  }

  // Modo edición activo - mostrar popover
  return (
    <Popover open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen)
      if (!newOpen) {
        setIsEditing(false)
      }
    }}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "min-h-[32px] px-2 py-1 rounded cursor-pointer hover:bg-muted transition-colors flex items-center justify-between border border-primary/50",
            !value && "text-muted-foreground",
            className
          )}
          onClick={() => setOpen(true)}
          title="Clic para cambiar"
        >
          <span>{selectedOption?.nombre || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar..." />
          <CommandList>
            <CommandEmpty>No encontrado.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.nombre}
                  onSelect={() => {
                    onSave(option.id)
                    setOpen(false)
                    setIsEditing(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      option.id === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.nombre}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

