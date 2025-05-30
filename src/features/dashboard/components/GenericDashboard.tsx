import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QuickActionsMenu } from '@/features/dashboard/components/quick-actions-menu'

interface GenericDashboardProps {
  inventarios: unknown[]
  preRegistros: unknown[]
}

// Export the component with a default export as well to ensure compatibility
function GenericDashboard({
  inventarios,
  preRegistros,
}: GenericDashboardProps) {
  return (
    <>
      <div className='flex items-center justify-end space-x-2 mb-4'>
        <QuickActionsMenu />
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Ciudadanos Registrados
            </CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              className='h-4 w-4 text-muted-foreground'
            >
              <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
              <circle cx='9' cy='7' r='4' />
              <path d='M22 21v-2a4 4 0 0 0-3-3.87' />
              <path d='M16 3.13a4 4 0 0 1 0 7.75' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{inventarios?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Servicios Activos
            </CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              className='h-4 w-4 text-muted-foreground'
            >
              <path d='M5 22h14' />
              <path d='M5 2h14' />
              <path d='M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22' />
              <path d='M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2' />
            </svg>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Facturas Pendientes
            </CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              className='h-4 w-4 text-muted-foreground'
            >
              <path d='M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z' />
              <path d='M17 21v-8H7v8' />
              <path d='M7 3v5h8' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {preRegistros?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Deuda Total</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              className='h-4 w-4 text-muted-foreground'
            >
              <path d='M6 9H4.5a2.5 2.5 0 0 1 0-5H6' />
              <path d='M18 9h1.5a2.5 2.5 0 0 0 0-5H18' />
              <path d='M4 22h16' />
              <path d='M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22' />
              <path d='M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22' />
              <path d='M18 2H6v7a6 6 0 0 0 12 0V2Z' />
            </svg>
          </CardHeader>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-4'>
        <Card className='col-span-1 lg:col-span-4'>
          <CardHeader>
            <h3 className='text-lg font-semibold'>Ingresos Mensuales</h3>
          </CardHeader>
        </Card>

        <Card className='col-span-1 lg:col-span-3'>
          <CardHeader>
            <h3 className='text-lg font-semibold'>Facturas Recientes</h3>
          </CardHeader>
        </Card>
      </div>
    </>
  )
}

// Export as both named and default export
export { GenericDashboard }
export default GenericDashboard
