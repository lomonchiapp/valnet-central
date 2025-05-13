import { IconUserPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useAddNewState } from '@/context/global/useAddNewState'

export function CitizensPrimaryButtons() {
  const { setNewCitizen } = useAddNewState()

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setNewCitizen(true)}>
        <span>Agregar Contribuyente</span> <IconUserPlus size={18} />
      </Button>
    </div>
  )
} 