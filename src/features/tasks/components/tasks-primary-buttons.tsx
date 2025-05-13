import { IconUserPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useAddNewState } from '@/context/global/useAddNewState'

export function TasksPrimaryButtons() {
  const { setNewTask } = useAddNewState()
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setNewTask(true)}
      >
        <span>Agregar Tarea</span> <IconUserPlus size={18} />
      </Button>
    </div>
  )
}
