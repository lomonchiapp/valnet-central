import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { DataTable } from './components/data-table'
import { paymentColumns } from './components/columns'
import { useGlobalState } from '@/context/global/useGlobalState'
import { useEffect } from 'react'
import { Search } from '@/components/search'
import { TopNav } from '@/components/layout/top-nav'

export default function Payments() {
  const { 
    payments, 
    subscribeToPayments, 
  } = useGlobalState()

  useEffect(() => {
    const unsubscribeToPayments = subscribeToPayments()

    return () => {
      unsubscribeToPayments()
    }
  }, [
    subscribeToPayments, 
  ])

  return (
    <>
      <Header fixed>
        <TopNav links={links} />
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2 flex-wrap gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Pagos Realizados</h2>
            <p className='text-muted-foreground'>
              Aquí podrás ver los pagos realizados por los ciudadanos.
            </p>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <DataTable data={payments} columns={paymentColumns} />
        </div>
      </Main>
    </>
  )
}

const links = [
  {
    title: 'Facturas Recurrentes',
    href: '/invoices',
    isActive: true,
  },
  {
    title: 'Pagos Realizados',
    href: '/payments',
    isActive: false,
  },
]