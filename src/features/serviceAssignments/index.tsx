import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { useGlobalState } from '@/context/global/useGlobalState'
import { useEffect } from 'react'

export default function ServiceAssignments() {
  const { serviceAssignments, subscribeToServiceAssignments, subscribeToCitizens, subscribeToServices } = useGlobalState()

  useEffect(() => {
    const unsubscribeToServiceAssignments = subscribeToServiceAssignments()
    const unsubscribeToCitizens = subscribeToCitizens()
    const unsubscribeToServices = subscribeToServices()

    return () => {
      unsubscribeToServiceAssignments()
      unsubscribeToCitizens()
      unsubscribeToServices()
    }
  }, [subscribeToServiceAssignments, subscribeToCitizens, subscribeToServices])

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2 flex-wrap'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Servicios Asignados</h2>
            <p className='text-muted-foreground'>
              Gestiona los servicios asignados a los contribuyentes.
            </p>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <DataTable data={serviceAssignments} columns={columns} />
        </div>
      </Main>
    </>
  )
} 