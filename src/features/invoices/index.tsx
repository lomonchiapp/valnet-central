import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { useGlobalState } from '@/context/global/useGlobalState'
import { useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecurringInvoicesTab } from './tabs/recurring-invoices-tab'
import { Search } from 'lucide-react'

export default function Invoices() {
  const { 
    recurringInvoices, 
    subscribeToRecurringInvoices,
    subscribeToInvoices,
    subscribeToCitizens,
    subscribeToServices,
    subscribeToServiceAssignments
  } = useGlobalState()

  useEffect(() => {
    const unsubscribeRecurring = subscribeToRecurringInvoices()
    const unsubscribeInvoices = subscribeToInvoices()
    const unsubscribeCitizens = subscribeToCitizens()
    const unsubscribeServices = subscribeToServices()
    const unsubscribeAssignments = subscribeToServiceAssignments()
    
    return () => {
      unsubscribeRecurring()
      unsubscribeInvoices()
      unsubscribeCitizens()
      unsubscribeServices()
      unsubscribeAssignments()
    }
  }, [
    subscribeToRecurringInvoices, 
    subscribeToInvoices, 
    subscribeToCitizens,
    subscribeToServices,
    subscribeToServiceAssignments
  ])

  return (
    <>
      <Header fixed>
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2'>
          <h2 className='text-2xl font-bold tracking-tight'>Facturas</h2>
          <p className='text-muted-foreground'>
            Gestiona las facturas recurrentes y únicas del sistema.
          </p>
        </div>

        <Tabs defaultValue="recurring" className="w-full">
          <TabsList>
            <TabsTrigger value="recurring">Facturas Recurrentes</TabsTrigger>
            <TabsTrigger value="single">Facturas Únicas</TabsTrigger>
          </TabsList>
          <TabsContent value="recurring">
            <RecurringInvoicesTab data={recurringInvoices} />
          </TabsContent>
          <TabsContent value="single">
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}