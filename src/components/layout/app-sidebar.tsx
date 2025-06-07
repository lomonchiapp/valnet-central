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
        className={`flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer hover:bg-slate-100 transition-colors text-xs ${level > 0 ? 'pl-6' : ''}`}
        style={{ marginLeft: level > 0 ? 8 : 0 }}
      >
        {item.icon && <item.icon className='w-4 h-4' />}
        <span className={collapsed ? 'hidden' : 'block'}>{item.title}</span>
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
            className={`flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer hover:bg-slate-100 transition-colors font-semibold`}
          >
            {item.icon && <item.icon className='w-4 h-4' />}
            <span className='hidden'>{item.title}</span>
            {hasChildren && <span className='ml-auto'>▼</span>}
          </div>
          {hasChildren && (
            <div
              className={`absolute left-full top-0 z-20 min-w-[180px] bg-white border rounded shadow-lg ${open ? 'block' : 'hidden'}`}
              style={{ display: open ? 'block' : 'none' }}
            >
              {item.children.map((child: NavItem) => (
                <SidebarItem key={child.title} item={child} collapsed={false} level={level + 1} />
              ))}
            </div>
          )}
        </div>
      )
    }
    // Si no collapsed, acordeón hacia abajo
    return (
      <div>
        <div
          className={`flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer hover:bg-slate-100 transition-colors font-semibold`}
          onClick={() => setOpen((o) => !o)}
        >
          {item.icon && <item.icon className='w-4 h-4' />}
          <span>{item.title}</span>
          {hasChildren && <span className='ml-auto'>{open ? '▲' : '▼'}</span>}
        </div>
        {hasChildren && open && (
          <div className='ml-4 border-l border-slate-200 pl-2 bg-slate-50 rounded-md mt-1'>
            {item.children.map((child: NavItem) => (
              <SidebarItem key={child.title} item={child} collapsed={false} level={level + 1} />
            ))}
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
      <SidebarContent className='mt-4 px-0 overflow-y-auto scrollbar-hide'>
        {sidebarData.navGroups.map((group) => (
          <div key={group.title} className='mb-2'>
            <div className='text-[0.7rem] font-semibold text-slate-500 uppercase px-2 py-1 mb-1'>{group.title}</div>
            {group.items.map((item) => (
              <SidebarItem key={item.title} item={item} collapsed={collapsed} />
            ))}
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
