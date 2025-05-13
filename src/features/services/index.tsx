import { useState, useEffect } from 'react'
import {
  IconAdjustmentsHorizontal,
  IconPlus,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { useAddNewState } from '@/context/global/useAddNewState'
import { NewServiceForm } from './components/NewServiceForm'
import { ServiceItem } from './components/ServiceItem'
import { useSelectedState } from '@/context/global/useSelectedState'
import { NoServices } from './components/NoServices'
import { useGlobalState } from '@/context/global/useGlobalState'
import { Search } from '@/components/search'

export default function Services() {
  const {newService, setNewService} = useAddNewState()
  const {services,  subscribeToServices} = useGlobalState()
  const {selectedService} = useSelectedState()
  const [sort, setSort] = useState('ascending')
  const [searchTerm, setSearchTerm] = useState('')
  const [itemSearchTerm, setItemSearchTerm] = useState('')

  useEffect(() => {
    const unsubscribe = subscribeToServices()
    return () => unsubscribe()
  }, [subscribeToServices])


  const filteredServices = services
    .sort((a, b) =>
      sort === 'ascending'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    )
    .filter((service) => service.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header fixed>
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header> 

      {/* ===== Content ===== */}
      <Main fixed>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            {selectedService ? selectedService.name : 'Servicios'}
          </h1>
          <p className='text-muted-foreground'>
            Servicios facturados a los contribuyentes
          </p>
        </div>
        <div className='my-4 flex items-end justify-between sm:my-0 sm:items-center'>
          <div className='flex flex-col gap-4 sm:my-4 sm:flex-row'>
            <div className='flex items-center justify-between gap-2'>
              <Input
                placeholder={selectedService ? 'Buscar servicio...' : 'Buscar servicio...'}
                className='h-9 w-40 lg:w-[250px]'
                value={selectedService ? itemSearchTerm : searchTerm}
                onChange={(e) => selectedService 
                  ? setItemSearchTerm(e.target.value)
                  : setSearchTerm(e.target.value)
                }
              />
              <Button 
                onClick={() => setNewService(true)}
              >
                <IconPlus size={18} className="mr-2" />
                {selectedService ? 'Agregar servicio' : 'Agregar servicio'}
              </Button>
            </div>
          </div>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className='w-16'>
              <SelectValue>
                <IconAdjustmentsHorizontal size={18} />
              </SelectValue>
            </SelectTrigger>
            <SelectContent align='end'>
              <SelectItem value='ascending'>
                <div className='flex items-center gap-4'>
                  <IconSortAscendingLetters size={16} />
                  <span>Ascendente</span>
                </div>
              </SelectItem>
              <SelectItem value='descending'>
                <div className='flex items-center gap-4'>
                  <IconSortDescendingLetters size={16} />
                  <span>Descendente</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Separator className='shadow mb-6' />
        {filteredServices.length > 0 ? (
              <ul className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {filteredServices.map((service) => (
                  <ServiceItem
                    key={service.id}
                    service={service}
                  />
                ))}
              </ul>
            ) : (
              <div className="col-span-full">
                <NoServices />
              </div>
            )}
      </Main>
      <NewServiceForm open={newService} onOpenChange={setNewService} />
      
    </>
  )
}
