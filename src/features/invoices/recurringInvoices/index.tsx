import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { DataTable } from './components/data-table'
import { recurringColumns } from './components/columns'
import { TopNav } from '@/components/layout/top-nav'
import { RecurringInvoice } from '@/types'
import { useGlobalState } from '@/context/global/useGlobalState'
import { Timestamp } from 'firebase/firestore'
import { useMemo } from 'react'
import { Search } from '@/components/search'

export default function RecurringInvoices() {
  const { recurringInvoices } = useGlobalState()
  
  const filteredInvoices = useMemo(() => {
    const today = new Date()
    const oneMonthAndHalfAhead = new Date()
    oneMonthAndHalfAhead.setDate(today.getDate() + 45)

    // Agrupar facturas por ciudadano
    const invoicesByUser = new Map<string, RecurringInvoice[]>()

    recurringInvoices.forEach(invoice => {
      if (!invoice.dueDate) return

      try {
        const dueDate = typeof invoice.dueDate === 'string'
          ? new Date(invoice.dueDate)
          : invoice.dueDate instanceof Date
            ? invoice.dueDate
            : new Date((invoice.dueDate as Timestamp).seconds * 1000)

        const isOverdue = dueDate < today
        const isUpcoming = dueDate <= oneMonthAndHalfAhead && dueDate >= today

        if (isOverdue || isUpcoming) {
          const userInvoices = invoicesByUser.get(invoice.citizenId) || []
          userInvoices.push(invoice)
          invoicesByUser.set(invoice.citizenId, userInvoices)
        }
      } catch (error) {
        //eslint-disable-next-line no-console
        console.error('Error procesando fecha:', invoice.dueDate, error)
      }
    })

    // Para cada ciudadano, mantener todas las facturas vencidas y la próxima más cercana
    const result: RecurringInvoice[] = []
    invoicesByUser.forEach(userInvoices => {
      const sortedInvoices = userInvoices.sort((a, b) => {
        const dateA = a.dueDate instanceof Date ? a.dueDate : (a.dueDate as Timestamp).toDate()
        const dateB = b.dueDate instanceof Date ? b.dueDate : (b.dueDate as Timestamp).toDate()
        return dateA.getTime() - dateB.getTime()
      })

      // Separar facturas vencidas y próximas
      const overdue = sortedInvoices.filter(inv => {
        const dueDate = inv.dueDate instanceof Date ? inv.dueDate : (inv.dueDate as Timestamp).toDate()
        return dueDate < today
      })
      const upcoming = sortedInvoices.filter(inv => {
        const dueDate = inv.dueDate instanceof Date ? inv.dueDate : (inv.dueDate as Timestamp).toDate()
        return dueDate >= today
      })

      // Agregar todas las vencidas y la próxima más cercana
      result.push(...overdue)
      if (upcoming.length > 0) {
        result.push(upcoming[0]) // La primera será la más cercana por el ordenamiento
      }
    })
    // Ordenar por fecha de vencimiento
    return result.sort((a, b) => {
      const dateA = a.dueDate instanceof Date ? a.dueDate : (a.dueDate as Timestamp).toDate()
      const dateB = b.dueDate instanceof Date ? b.dueDate : (b.dueDate as Timestamp).toDate()
      return dateA.getTime() - dateB.getTime()
    })
  }, [recurringInvoices])

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
            <h2 className='text-2xl font-bold tracking-tight'>Facturas Recurrentes</h2>
            <p className='text-muted-foreground'>
              Mostrando facturas vencidas y próximas a vencer (15 días)
            </p>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <DataTable data={filteredInvoices} columns={recurringColumns} />
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