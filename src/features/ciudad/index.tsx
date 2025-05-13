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
import { ThemeSwitch } from '@/components/theme-switch'
import { useAddNewState } from '@/context/global/useAddNewState'
import { NewSectorForm } from './components/NewSectorForm'
import { SectorItem } from './components/SectorItem'
import { useSelectedState } from '@/context/global/useSelectedState'
import { NoSectors } from './components/NoSectors'
import { TopNav } from '@/components/layout/top-nav'
import { useGlobalState } from '@/context/global/useGlobalState'

export default function Ciudad() {
  const {newSector, setNewSector} = useAddNewState()
  const {sectors, subscribeToSectors} = useGlobalState()
  const {selectedSector} = useSelectedState()
  const [sort, setSort] = useState('ascending')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const unsubscribe = subscribeToSectors()
    return () => unsubscribe()
  }, [subscribeToSectors])

  const filteredSectors = sectors
    .sort((a, b) =>
      sort === 'ascending'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    )
    .filter((sector) => sector.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <>
      <Header>
        <TopNav links={topNav} />
        <div className='ml-auto flex items-center gap-4'>
          <ThemeSwitch />
          <Button variant="default" className="bg-primary text-white font-bold">
            Manejar más ciudades? Los programadores son tus amigos
          </Button>
        </div>
      </Header>

      <Main fixed>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            {selectedSector ? selectedSector.name : 'Sectores'}
          </h1>
          <p className='text-muted-foreground'>
            {selectedSector 
              ? `Gestión del sector ${selectedSector.name}`
              : 'Administra los sectores que componen la ciudad'}
          </p>
        </div>

        <div className='my-4 flex items-end justify-between sm:my-0 sm:items-center'>
          <div className='flex flex-col gap-4 sm:my-4 sm:flex-row'>
            <div className='flex items-center justify-between gap-2'>
              <Input
                placeholder="Buscar sector..."
                className='h-9 w-40 lg:w-[250px]'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button 
                onClick={() => setNewSector(true)}
              >
                <IconPlus size={18} className="mr-2" />
                Agregar sector
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
                  <span>A-Z</span>
                </div>
              </SelectItem>
              <SelectItem value='descending'>
                <div className='flex items-center gap-4'>
                  <IconSortDescendingLetters size={16} />
                  <span>Z-A</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator className='shadow' />

        {filteredSectors.length > 0 ? (
          <ul className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {filteredSectors.map((sector) => (
              <SectorItem
                key={sector.id}
                sector={sector}
              />
            ))}
          </ul>
        ) : (
          <div className="col-span-full">
            <NoSectors />
          </div>
        )}
      </Main>

      <NewSectorForm open={newSector} onOpenChange={setNewSector} />
    </>
  )
}

const topNav = [
  {
    title: 'Sectores',
    href: '/ciudad',
    isActive: true,
  },
  {
    title: 'Mapa',
    href: '/ciudad/mapa',
    isActive: false,
  },
]
