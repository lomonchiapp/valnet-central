import { IconMailPlus, IconUserPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useAddNewState } from '@/context/global/useAddNewState'

export function UsersPrimaryButtons() {
  const { setNewUser } = useAddNewState()
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setNewUser(true)}
      >
        <span>Invitar Usuario</span> <IconMailPlus size={18} />
      </Button>
      <Button className='space-x-1' onClick={() => setNewUser(true)}>
        <span>Agregar Usuario</span> <IconUserPlus size={18} />
      </Button>
    </div>
  )
}
