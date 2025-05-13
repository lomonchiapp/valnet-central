import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { recurringColumns } from './components/columns'
import { DataTable } from './components/data-table'
import { TasksDialogs } from './components/tasks-dialogs'
import { TasksPrimaryButtons } from './components/tasks-primary-buttons'
import TasksProvider from './context/tasks-context'
import { useGlobalState } from '@/context/global/useGlobalState'
import { useEffect } from 'react'
import { TopNav } from '@/components/layout/top-nav'

export default function Invoices() {
  const { recurringInvoices, subscribeToRecurringInvoices } = useGlobalState()

  useEffect(() => {
    const unsubscribe = subscribeToRecurringInvoices()
    return () => unsubscribe()
  }, [subscribeToRecurringInvoices])

  return (
    <TasksProvider>
      <Header fixed>
        <TopNav links={links} />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2 flex-wrap gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Tareas</h2>
            <p className='text-muted-foreground'>
              Aquí podrás ver las tareas que se tienen pendientes para la clínica.
            </p>
          </div>
          <TasksPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <DataTable data={recurringInvoices} columns={recurringColumns} />
        </div>
      </Main>

      <TasksDialogs />
    </TasksProvider>
  )
}

const links = [
  {
    title: 'Facturas Recurrentes',
    href: '/invoices',
    isActive: true,
  },
  {
    title: 'Facturas',
    href: '/invoices',
    isActive: false,
  },
  
]