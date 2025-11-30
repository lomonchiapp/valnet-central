import * as React from 'react'
import { ChevronRight, Sparkles } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavUser } from '@/components/layout/nav-user'
import { sidebarData } from './data/sidebar-data'
import type { NavItem, NavLink, NavGroup } from './types'
import { cn } from '@/lib/utils'

function isNavLink(item: NavItem): item is NavLink {
  return (item as NavLink).type === 'link'
}

function isNavGroup(item: NavItem): item is NavGroup {
  return (item as NavGroup).type === 'group'
}

function AppSidebarItem({ item }: { item: NavItem }) {
  const location = useLocation()

  if (isNavLink(item)) {
    const isActive = location.pathname === item.url
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          tooltip={item.title}
          isActive={isActive}
          className={cn(
            'relative group/item transition-all duration-300 ease-out',
            'hover:bg-gradient-to-r hover:from-blue-50 hover:via-sky-50 hover:to-cyan-50',
            'hover:shadow-md hover:shadow-blue-500/10 hover:scale-[1.02]',
            'data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-600 data-[active=true]:via-blue-700 data-[active=true]:to-blue-800',
            'data-[active=true]:text-white data-[active=true]:shadow-xl data-[active=true]:shadow-blue-500/40',
            'data-[active=true]:font-semibold data-[active=true]:scale-[1.02]',
            'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2',
            'before:w-1.5 before:h-0 before:bg-gradient-to-b before:from-blue-500 before:via-blue-600 before:to-blue-700',
            'before:rounded-r-full before:transition-all before:duration-300 before:shadow-[0_0_8px_rgba(37,99,235,0.4)]',
            'data-[active=true]:before:h-10 data-[active=true]:before:shadow-[0_0_12px_rgba(37,99,235,0.8)]',
            'hover:before:h-7 hover:before:bg-gradient-to-b hover:before:from-blue-400 hover:before:via-blue-500 hover:before:to-blue-600',
            'after:absolute after:inset-0 after:rounded-md after:bg-gradient-to-r after:from-white/0 after:via-white/20 after:to-white/0',
            'after:opacity-0 hover:after:opacity-100 data-[active=true]:after:opacity-100',
            'after:transition-opacity after:duration-300'
          )}
        >
          <Link to={item.url} className="flex items-center gap-3 w-full">
            {item.icon && (
              <item.icon className={cn(
                'w-5 h-5 transition-all duration-200 flex-shrink-0',
                'group-data-[active=true]/item:text-white',
                'group-hover/item:scale-110 group-data-[active=true]/item:scale-110'
              )} />
            )}
            <span className="flex-1 text-sm font-medium tracking-wide">
              {item.title}
            </span>
            {isActive && (
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  if (isNavGroup(item)) {
    const isChildActive = item.children.some((child) => {
      if (isNavLink(child)) {
        return location.pathname === child.url
      }
      return false
    })
    const isParentActive = item.url && location.pathname === item.url

    return (
      <Collapsible
        asChild
        defaultOpen={isChildActive}
        className="group/collapsible"
      >
        <SidebarMenuItem>
          <div className="flex items-center gap-1 w-full">
            {item.url && (
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isParentActive}
                className={cn(
                  'relative group/item transition-all duration-300 ease-out flex-1',
                  'hover:bg-gradient-to-r hover:from-blue-50 hover:via-sky-50 hover:to-cyan-50',
                  'hover:shadow-md hover:shadow-blue-500/10 hover:scale-[1.01]',
                  'data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-600 data-[active=true]:via-blue-700 data-[active=true]:to-blue-800',
                  'data-[active=true]:text-white data-[active=true]:shadow-xl data-[active=true]:shadow-blue-500/40',
                  'data-[active=true]:font-semibold',
                  'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2',
                  'before:w-1.5 before:h-0 before:bg-gradient-to-b before:from-blue-500 before:via-blue-600 before:to-blue-700',
                  'before:rounded-r-full before:transition-all before:duration-300',
                  'data-[active=true]:before:h-10 data-[active=true]:before:shadow-[0_0_12px_rgba(37,99,235,0.8)]',
                  'hover:before:h-7 hover:before:bg-gradient-to-b hover:before:from-blue-400 hover:before:via-blue-500 hover:before:to-blue-600'
                )}
              >
                <Link to={item.url} className="flex items-center gap-3 w-full" onClick={(e) => e.stopPropagation()}>
                  {item.icon && (
                    <item.icon className={cn(
                      'w-5 h-5 transition-all duration-200 flex-shrink-0',
                      'text-blue-600 group-hover/item:text-blue-700 group-data-[active=true]/item:text-white',
                      'group-hover/item:scale-110 group-data-[active=true]/item:scale-110'
                    )} />
                  )}
                  <span className="flex-1 text-sm font-semibold tracking-wide text-slate-700 group-data-[active=true]/item:text-white">
                    {item.title}
                  </span>
                  {isParentActive && (
                    <Sparkles className="w-4 h-4 text-white animate-pulse" />
                  )}
                </Link>
              </SidebarMenuButton>
            )}
            {!item.url && (
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={item.title}
                  className={cn(
                    'relative group/item transition-all duration-300 ease-out flex-1',
                    'hover:bg-gradient-to-r hover:from-blue-50 hover:via-sky-50 hover:to-cyan-50',
                    'hover:shadow-md hover:shadow-blue-500/10 hover:scale-[1.01]',
                    'data-[state=open]:bg-gradient-to-r data-[state=open]:from-blue-50 data-[state=open]:via-sky-50 data-[state=open]:to-cyan-50',
                    'data-[state=open]:shadow-md data-[state=open]:shadow-blue-500/10',
                    isChildActive && 'bg-gradient-to-r from-blue-50 via-sky-50 to-cyan-50 shadow-sm',
                    'after:absolute after:inset-0 after:rounded-md after:bg-gradient-to-r after:from-white/0 after:via-white/20 after:to-white/0',
                    'after:opacity-0 hover:after:opacity-100 data-[state=open]:after:opacity-100',
                    'after:transition-opacity after:duration-300'
                  )}
                >
                  <div className="flex items-center gap-3 w-full">
                    {item.icon && (
                      <item.icon className={cn(
                        'w-5 h-5 transition-all duration-200 flex-shrink-0',
                        'text-blue-600 group-hover/item:text-blue-700',
                        'group-data-[state=open]/collapsible:rotate-12'
                      )} />
                    )}
                    <span className="flex-1 text-sm font-semibold tracking-wide text-slate-700">
                      {item.title}
                    </span>
                    <ChevronRight className={cn(
                      'ml-auto w-4 h-4 transition-all duration-300 text-slate-400',
                      'group-data-[state=open]/collapsible:rotate-90 group-data-[state=open]/collapsible:text-blue-600'
                    )} />
                  </div>
                </SidebarMenuButton>
              </CollapsibleTrigger>
            )}
            {item.url && (
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip="Expandir/Colapsar"
                  size="sm"
                  className={cn(
                    'h-8 w-8 p-0 flex-shrink-0',
                    'hover:bg-blue-50 hover:text-blue-600',
                    'data-[state=open]:bg-blue-50 data-[state=open]:text-blue-600'
                  )}
                >
                  <ChevronRight className={cn(
                    'w-4 h-4 transition-all duration-300 text-slate-400',
                    'group-data-[state=open]/collapsible:rotate-90 group-data-[state=open]/collapsible:text-blue-600'
                  )} />
                </SidebarMenuButton>
              </CollapsibleTrigger>
            )}
          </div>
          <CollapsibleContent className="overflow-hidden">
            <SidebarMenuSub className="ml-2 mt-1 space-y-0.5">
              {item.children.map((child) => (
                <SidebarMenuSubItem key={child.title}>
                  {isNavLink(child) ? (
                    <SidebarMenuSubButton
                      asChild
                      isActive={location.pathname === child.url}
                      className={cn(
                        'relative group/sub transition-all duration-300 ease-out',
                        'hover:bg-gradient-to-r hover:from-blue-50 hover:via-sky-50 hover:to-cyan-50',
                        'hover:shadow-md hover:shadow-blue-500/10 hover:translate-x-2 hover:scale-[1.01]',
                        'data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-600 data-[active=true]:via-blue-700 data-[active=true]:to-blue-800',
                        'data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-blue-500/40',
                        'data-[active=true]:font-semibold data-[active=true]:translate-x-2 data-[active=true]:scale-[1.01]',
                        'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2',
                        'before:w-1 before:h-0 before:bg-gradient-to-b before:from-blue-500 before:via-blue-600 before:to-blue-700',
                        'before:rounded-full before:transition-all before:duration-300 before:shadow-[0_0_6px_rgba(37,99,235,0.4)]',
                        'data-[active=true]:before:h-7 data-[active=true]:before:shadow-[0_0_10px_rgba(37,99,235,0.7)]',
                        'hover:before:h-5 hover:before:bg-gradient-to-b hover:before:from-blue-400 hover:before:via-blue-500 hover:before:to-blue-600',
                        'after:absolute after:inset-0 after:rounded-md after:bg-gradient-to-r after:from-white/0 after:via-white/20 after:to-white/0',
                        'after:opacity-0 hover:after:opacity-100 data-[active=true]:after:opacity-100',
                        'after:transition-opacity after:duration-300'
                      )}
                    >
                      <Link to={child.url} className="flex items-center gap-3 w-full">
                        {child.icon && (
                          <child.icon className={cn(
                            'w-4 h-4 transition-all duration-200 flex-shrink-0',
                            'group-data-[active=true]/sub:text-white',
                            'group-hover/sub:scale-110 group-data-[active=true]/sub:scale-110'
                          )} />
                        )}
                        <span className="flex-1 text-sm font-medium">
                          {child.title}
                        </span>
                        {location.pathname === child.url && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        )}
                      </Link>
                    </SidebarMenuSubButton>
                  ) : null}
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }

  return null
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-slate-200/60 bg-gradient-to-b from-white via-slate-50/30 to-white backdrop-blur-sm"
      {...props}
    >
      <SidebarHeader className="border-b border-slate-200/60 bg-gradient-to-r from-blue-50/80 via-sky-50/80 to-cyan-50/80 backdrop-blur-md shadow-sm">
        <div className="flex h-16 items-center px-4 gap-3 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-blue-600/5 to-blue-700/5" />
          <div className="relative z-10 flex items-center gap-3 w-full">
            <div className="relative group/logo">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-lg blur-xl opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300" />
              <img
                src="/valdesk-logo.png"
                alt="Logo"
                className="relative h-9 w-auto object-contain transition-all duration-300 group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:opacity-0 group-hover/logo:scale-105"
              />
              <img
                src="/icon.png"
                alt="Logo"
                className="relative h-9 w-auto object-contain hidden group-data-[collapsible=icon]:block group-data-[collapsible=icon]:animate-in group-data-[collapsible=icon]:fade-in-0 group-data-[collapsible=icon]:zoom-in-95 group-hover/logo:scale-110"
              />
            </div>
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent group-data-[collapsible=icon]:hidden" />
            <div className="flex-1 group-data-[collapsible=icon]:hidden">
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Valnet Central
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Sistema de Gestión
              </div>
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-1 px-2 py-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
        {sidebarData.navGroups.map((group, groupIndex) => (
          <SidebarGroup
            key={group.title}
            className={cn(
              'relative',
              groupIndex > 0 && 'mt-6 pt-6 border-t border-slate-200/60'
            )}
          >
            <SidebarGroupLabel className="px-3 mb-3 text-xs font-bold uppercase tracking-wider text-slate-500/80 flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
              <span className="bg-gradient-to-r from-blue-50 to-sky-50 px-3 py-1 rounded-lg backdrop-blur-sm border border-slate-200/50 shadow-sm">
                {group.title}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1.5">
                {group.items.map((item) => (
                  <AppSidebarItem key={item.title} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-slate-200/60 bg-gradient-to-t from-slate-50/80 via-white/50 to-transparent backdrop-blur-md shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-3">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-blue-600/5 to-blue-700/5 rounded-lg" />
          <div className="relative">
            <NavUser />
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
