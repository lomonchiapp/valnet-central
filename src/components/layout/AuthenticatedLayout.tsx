import Cookies from 'js-cookie'
import { Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { SearchProvider } from '@/context/search-context'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import SkipToMain from '@/components/skip-to-main'
import { GlobalTopBar } from './GlobalTopBar'
import { Toaster } from '@/components/ui/toaster'

export default function AuthenticatedLayout() {
  const defaultOpen = Cookies.get('sidebar:state') !== 'false'

  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <SkipToMain />
        <div className="fixed top-0 left-0 w-full z-50 h-20">
          <GlobalTopBar />
        </div>
        <AppSidebar />
        <div
          id='content'
          className={cn(
            'max-w-full w-full border-transparent ml-auto',
            'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
            'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
            'transition-[width] ease-linear duration-200',
            'h-svh flex flex-col',
            'group-data-[scroll-locked=1]/body:h-full',
            'group-data-[scroll-locked=1]/body:has-[main.fixed-main]:h-svh',
            'mt-20'
          )}
        >
          <div className="fixed inset-0 bg-muted -z-10" />
          <div className="flex-1 min-h-full">
            <div className="p-12">
              <Outlet />
            </div>
          </div>
        </div>
        <Toaster />
      </SidebarProvider>
    </SearchProvider>
  )
}
