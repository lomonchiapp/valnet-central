import { useState, useRef, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditableSelectCellProps {
  value: string
  options: Array<{ id: string; nombre: string }>
  onSave: (value: string) => void
  placeholder?: string
  className?: string
}

export function EditableSelectCell({
  value,
  options,
  onSave,
  placeholder = 'Seleccionar...',
  className
}: EditableSelectCellProps) {
  const [open, setOpen] = useState(false)

  const selectedOption = options.find(opt => opt.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "min-h-[32px] px-2 py-1 rounded cursor-pointer hover:bg-muted transition-colors flex items-center justify-between",
            !value && "text-muted-foreground",
            className
          )}
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

