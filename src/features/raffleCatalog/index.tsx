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
import { useGlobalState } from '@/context/global/useGlobalState'
import { NewRaffleItemForm } from './components/NewRaffleItemForm'
import { RaffleItemCard } from './components/RaffleItemCard'

export default function RaffleCatalog() {
  const {newRaffleItem, setNewRaffleItem} = useAddNewState()
  const {raffleItems, subscribeToRaffleItems} = useGlobalState()
  const [sort, setSort] = useState('ascending')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const unsubscribe = subscribeToRaffleItems()
    return () => unsubscribe()
  }, [subscribeToRaffleItems])

  const filteredItems = raffleItems
    .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))


  return (
    <>
      <Header>
        <div className='ml-auto flex items-center gap-4'>
          <ThemeSwitch />
          <Button variant="default" className="bg-primary text-white font-bold">
            Catálogo de Premios para Contribuyentes
          </Button>
        </div>
      </Header>

      <Main fixed>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            Catálogo de Premios
          </h1>
          <p className='text-muted-foreground'>
            Gestiona los artículos disponibles para la rifa de contribuyentes
          </p>
        </div>

        <div className='my-4 flex items-end justify-between sm:my-0 sm:items-center'>
          <div className='flex flex-col gap-4 sm:my-4 sm:flex-row'>
            <div className='flex items-center justify-between gap-2'>
              <Input
                placeholder="Buscar artículo..."
                className='h-9 w-40 lg:w-[250px]'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button 
                onClick={() => setNewRaffleItem(true)}
              >
                <IconPlus size={18} className="mr-2" />
                Agregar artículo
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

        {filteredItems.length > 0 ? (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {filteredItems.map((item) => (
              <RaffleItemCard
                key={item.id}
                item={item}
                onEdit={() => {/* TODO: Implementar edición */}}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <IconPlus className="h-10 w-10 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">No hay artículos</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                Aún no has agregado ningún artículo al catálogo. ¡Comienza agregando el primer premio!
              </p>
              <Button onClick={() => setNewRaffleItem(true)}>
                <IconPlus size={18} className="mr-2" />
                Agregar primer artículo
              </Button>
            </div>
          </div>
        )}
      </Main>

      <NewRaffleItemForm open={newRaffleItem} onOpenChange={setNewRaffleItem} />
    </>
  )
}
