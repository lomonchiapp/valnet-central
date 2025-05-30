import { useEffect } from 'react'
import { useListarInstalaciones } from '@/api/hooks'
import { Main } from '@/components/layout/main'

export default function Instalaciones() {
  const { listarInstalaciones, loading, error } = useListarInstalaciones()

  useEffect(() => {
    listarInstalaciones()
  }, [listarInstalaciones])

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
            <div>
              <h2>Instalaciones</h2>
            </div>
          )}
        </div>
      </Main>
    </>
  )
}
