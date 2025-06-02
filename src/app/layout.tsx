import { Link } from 'react-router-dom'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { NotificacionesDropdown } from '@/features/notificaciones/components/NotificacionesDropdown'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='es'>
      <body>
        <div className='min-h-screen bg-background'>
          <div className='flex'>
            <AppSidebar />
            <div className='flex-1'>
              <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
                <div className='container flex h-14 items-center'>
                  <div className='mr-4 flex'>
                    <Link to='/' className='mr-6 flex items-center space-x-2'>
                      <span className='font-bold'>Valnet Central</span>
                    </Link>
                  </div>
                  <div className='flex flex-1 items-center justify-between space-x-2 md:justify-end'>
                    <div className='w-full flex-1 md:w-auto md:flex-none'>
                      <NotificacionesDropdown />
                    </div>
                  </div>
                </div>
              </header>
              <main className='flex-1 space-y-4 p-8 pt-6'>{children}</main>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
