import { useEffect } from 'react'
import { useListarInstalaciones } from '@/api/hooks'
import { useValnetState } from '@/context/global/useValnetState'
import { Main } from '@/components/layout/main'
import { CitizensTable } from './components/citizens-table'
import { instalacionesColumns } from './components/instalaciones-columns'

export default function Instalaciones() {
  const {
    listarInstalaciones,
    instalaciones: apiInstalaciones,
    loading,
    error,
  } = useListarInstalaciones()

  const instalaciones = useValnetState((state) => state.instalaciones)
  const setInstalaciones = useValnetState((state) => state.setInstalaciones)

  useEffect(() => {
    listarInstalaciones()
  }, [listarInstalaciones])

  useEffect(() => {
    if (apiInstalaciones) setInstalaciones(apiInstalaciones)
  }, [apiInstalaciones, setInstalaciones])

  return (
    <>
      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2 flex-wrap'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Instalaciones</h2>
            <p className='text-muted-foreground'>
              Gestiona las instalaciones del servicio aquí.
            </p>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          {loading ? (
            <div className='w-full text-center py-8'>
              Cargando instalaciones...
            </div>
          ) : error ? (
            <div className='w-full text-center text-red-500 py-8'>{error}</div>
          ) : (
            <CitizensTable
              data={instalaciones}
              columns={instalacionesColumns}
            />
          )}
        </div>
      </Main>
    </>
  )
}
