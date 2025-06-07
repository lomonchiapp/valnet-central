import type { ComponentType } from 'react'

interface BaseNavItem {
  title: string
  badge?: string
  icon?: React.ElementType
}

export type NavLink = {
  type: 'link'
  title: string
  url: string
  icon?: ComponentType<any>
}

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: string })[]
  url?: never
}

export type NavItem = NavLink | NavCollapsible | NavGroup

export type NavGroup = {
  type: 'group'
  title: string
  icon?: ComponentType<any>
  children: NavItem[]
}

export type SidebarData = {
  navGroups: {
    title: string
    items: NavItem[]
  }[]
}
