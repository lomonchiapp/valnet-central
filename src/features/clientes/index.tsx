import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/columns'
import { CitizensPrimaryButtons } from './components/citizens-primary-buttons'
import { CitizensTable } from './components/citizens-table'
import { useGlobalState } from '@/context/global/useGlobalState'
import { useAddNewState } from '@/context/global/useAddNewState'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { NewCitizenForm } from './components/NewCitizenForm'
import { NewPartialCitizenForm } from './components/NewPartialCitizenForm'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEffect, useState } from 'react'
import { CompCitizenForm } from './components/CompCitizenForm'
import { useSelectedState } from '@/context/global/useSelectedState'
import { Citizen } from '@/types/interfaces/valnet/cliente'
import { EditCitizenForm } from './components/EditCitizenForm'

export default function Citizens() {
  const { citizens, subscribeToCitizens, subscribeToServices, subscribeToInvoices, subscribeToRecurringInvoices } = useGlobalState()
  const { setNewCitizen, newCitizen } = useAddNewState()
  const [formType, setFormType] = useState<'full' | 'partial'>('full')
  const { newCitizenComp, setNewCitizenComp } = useAddNewState()
  const { selectedCitizen, editMode, setEditMode } = useSelectedState()

  useEffect(() => {
    const unsubscribe = subscribeToCitizens()
    const unsubscribeServices = subscribeToServices()
    const unsubscribeInvoices = subscribeToInvoices()
    const unsubscribeRecurringInvoices = subscribeToRecurringInvoices()
    return () => {
      unsubscribe()
      unsubscribeServices()
      unsubscribeInvoices()
      unsubscribeRecurringInvoices()
    }
  }, [subscribeToCitizens, subscribeToServices, subscribeToInvoices, subscribeToRecurringInvoices])

  return (
    <>
      <Header fixed>
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2 flex-wrap'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Contribuyentes</h2>
            <p className='text-muted-foreground'>
              Gestiona los contribuyentes del servicio de recolección de basura aquí.
            </p>
          </div>
          <CitizensPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <CitizensTable 
            data={citizens} 
            columns={columns} 
          />
        </div>
        <Dialog open={newCitizen} onOpenChange={setNewCitizen}>
          <DialogContent className="max-w-4xl">
            <Tabs
              value={formType}
              onValueChange={(value) => setFormType(value as 'full' | 'partial')}
              className="w-full mb-4"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="full">Registro Completo</TabsTrigger>
                <TabsTrigger value="partial">Registro Parcial</TabsTrigger>
              </TabsList>
            </Tabs>

            {formType === 'full' ? (
              <NewCitizenForm />
            ) : (
              <NewPartialCitizenForm />
            )}
          </DialogContent>
        </Dialog>
      </Main>
      <CompCitizenForm 
        open={newCitizenComp} 
        onOpenChange={setNewCitizenComp} 
        citizen={selectedCitizen as Citizen} 
      />

      <EditCitizenForm
        open={editMode}
        onOpenChange={setEditMode}
        citizen={selectedCitizen as Citizen}
      />
    </>
  )
}
