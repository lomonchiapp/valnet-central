import { Outlet } from 'react-router-dom'
import { SearchProvider } from '@/context/search-context'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import SkipToMain from '@/components/skip-to-main'
import { cn } from '@/lib/utils'
import Cookies from 'js-cookie'
import { GlobalTopBar } from './GlobalTopBar'

export default function AuthenticatedLayout() {
  const defaultOpen = Cookies.get('sidebar:state') !== 'false'
  
  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <SkipToMain />
        <AppSidebar />
        <div
          id='content'
          className={cn(
            'max-w-full w-full ml-auto',
            'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
            'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
            'transition-[width] ease-linear duration-200',
            'h-svh flex flex-col',
            'group-data-[scroll-locked=1]/body:h-full',
            'group-data-[scroll-locked=1]/body:has-[main.fixed-main]:h-svh'
          )}
        >
          <div className="p-4">
            <GlobalTopBar />
          </div>
          
          <Outlet />
        </div>
      </SidebarProvider>
    </SearchProvider>
  )
} 