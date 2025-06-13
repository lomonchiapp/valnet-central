import { useEffect, useState } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavUser } from '@/components/layout/nav-user'
import { sidebarData } from './data/sidebar-data'
import type { NavItem, NavLink, NavGroup } from './types'
import { Link } from 'react-router-dom'

function isNavLink(item: NavItem): item is NavLink {
  return (item as NavLink).type === 'link'
}

function isNavGroup(item: NavItem): item is NavGroup {
  return (item as NavGroup).type === 'group'
}

function SidebarItem({ item, collapsed, level = 0 }: { item: NavItem; collapsed: boolean; level?: number }) {
  const [open, setOpen] = useState<boolean>(false)

  if (isNavLink(item)) {
    return (
      <Link
        to={item.url}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-slate-100 transition-all duration-200 text-sm text-slate-700 hover:text-slate-900 group ${
          level > 0 ? 'ml-6 pl-4 bg-slate-50/50 border-l-2 border-slate-200' : ''
        }`}
      >
        {item.icon && <item.icon className='w-4 h-4 flex-shrink-0 group-hover:text-blue-600 transition-colors' />}
        <span className={collapsed ? 'hidden' : 'block font-medium'}>{item.title}</span>
      </Link>
    )
  }

  if (isNavGroup(item)) {
    const hasChildren = Array.isArray(item.children) && item.children.length > 0
    
    // Si collapsed, usar flyout (como antes)
    if (collapsed) {
      return (
        <div
          className='relative'
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <div
            className='flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-slate-100 transition-all duration-200 font-semibold text-slate-700'
          >
            {item.icon && <item.icon className='w-4 h-4' />}
            <span className='hidden'>{item.title}</span>
            {hasChildren && <span className='ml-auto text-xs'>▼</span>}
          </div>
          {hasChildren && (
            <div
              className={`absolute left-full top-0 z-30 min-w-[200px] bg-white border border-slate-200 rounded-lg shadow-lg ml-2 ${
                open ? 'block' : 'hidden'
              }`}
            >
              <div className='p-2'>
                {item.children.map((child: NavItem) => (
                  <SidebarItem key={child.title} item={child} collapsed={false} level={level + 1} />
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }
    
    // Si no collapsed, acordeón hacia abajo
    return (
      <div className='mb-1'>
        <div
          className='flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-slate-100 transition-all duration-200 font-semibold text-slate-700 hover:text-slate-900 group'
          onClick={() => setOpen((o) => !o)}
        >
          {item.icon && <item.icon className='w-4 h-4 group-hover:text-blue-600 transition-colors' />}
          <span className='flex-1'>{item.title}</span>
          {hasChildren && (
            <span className={`text-xs transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
              ▼
            </span>
          )}
        </div>
        {hasChildren && (
          <div className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className='ml-3 mt-1 space-y-1 border-l border-slate-200 pl-4'>
              {item.children.map((child: NavItem) => (
                <SidebarItem key={child.title} item={child} collapsed={false} level={level + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // fallback
  return null
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Track sidebar collapse state (mantener si se usa en otro lado)
  useEffect(() => {
    const handleSidebarChange = () => {
      // No se usa collapsed, solo mantener si es necesario
    }
    handleSidebarChange()
    const observer = new MutationObserver(handleSidebarChange)
    const element = document.querySelector('[data-collapsed]')
    if (element) {
      observer.observe(element, {
        attributes: true,
        attributeFilter: ['data-collapsed'],
      })
    }
    return () => observer.disconnect()
  }, [])

  // Detectar si está colapsado
  const collapsed = false // Aquí deberías obtener el estado real de colapso si lo tienes

  return (
    <Sidebar
      collapsible='icon'
      className='fixed z-0 left-0 bg-white border-r border-slate-200 mt-20 shadow-sm'
      variant='floating'
      {...props}
    >
      <SidebarContent className='mt-6 px-4 overflow-y-auto scrollbar-hide'>
        {sidebarData.navGroups.map((group) => (
          <div key={group.title} className='mb-6'>
            <div className='text-xs font-bold text-slate-500 uppercase tracking-wider px-1 py-2 mb-3 border-b border-slate-100'>
              {group.title}
            </div>
            <div className='space-y-1'>
              {group.items.map((item) => (
                <SidebarItem key={item.title} item={item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </SidebarContent>
      <SidebarFooter className='px-2 py-2'>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
