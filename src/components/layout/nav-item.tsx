import React from 'react'
import { Link } from 'react-router-dom'

interface NavItemProps {
  title: string
  url: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string
  className?: string
}

export function NavItem({ title, url, icon, badge, className = '' }: NavItemProps) {
  return (
    <Link
      to={url}
      className={`flex items-center gap-2 px-4 py-2 rounded hover:bg-accent transition-colors ${className}`}
    >
      {icon && React.createElement(icon, { className: 'w-4 h-4' })}
      <span>{title}</span>
      {badge && (
        <span className='ml-auto bg-primary text-xs px-2 py-0.5 rounded-full'>
          {badge}
        </span>
      )}
    </Link>
  )
} 