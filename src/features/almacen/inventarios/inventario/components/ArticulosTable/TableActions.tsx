import { Eye, Pencil, Repeat, Trash2 } from 'lucide-react'
import { Articulo } from 'shared-types'
import { Button } from '@/components/ui/button'

interface TableActionsProps {
  articulo: Articulo
  onVer?: (articulo: Articulo) => void
  onEditar?: (articulo: Articulo) => void
  onTransferir?: (articulo: Articulo) => void
  onEliminar?: (articulo: Articulo) => void
}

export function TableActions({ articulo, onVer, onEditar, onTransferir, onEliminar }: TableActionsProps) {
  return (
    <div className='flex gap-2 justify-center'>
      <Button variant='ghost' size='icon' onClick={() => onVer?.(articulo)}><Eye className='w-4 h-4' /></Button>
      <Button variant='ghost' size='icon' onClick={() => onEditar?.(articulo)}><Pencil className='w-4 h-4' /></Button>
      <Button variant='ghost' size='icon' onClick={() => onTransferir?.(articulo)}><Repeat className='w-4 h-4' /></Button>
      <Button variant='ghost' size='icon' onClick={() => onEliminar?.(articulo)}><Trash2 className='w-4 h-4 text-red-600' /></Button>
    </div>
  )
} 