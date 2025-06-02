import * as React from 'react'
import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NavItem } from '@/components/layout/nav-item'
import { NavGroup as NavGroupType } from './types'

interface NavGroupProps extends NavGroupType {
  itemClassName?: string
  titleClassName?: string
}

export const NavGroup: React.FC<NavGroupProps> = ({
  title,
  items,
  itemClassName = '',
  titleClassName = '',
}) => {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className='mb-4'>
      <Button
        variant='ghost'
        className={`w-full flex justify-between items-center font-medium ${titleClassName}`}
        onClick={() => setExpanded(!expanded)}
      >
        <span>{title}</span>
        {expanded ? (
          <ChevronDown className='h-4 w-4' />
        ) : (
          <ChevronRight className='h-4 w-4' />
        )}
      </Button>
      {expanded && (
        <div className='mt-2 space-y-1'>
          {items.map((item) => {
            if (!item.url) return null
            return (
              <NavItem
                key={item.url}
                title={item.title}
                url={item.url}
                icon={item.icon as React.ComponentType<{ className?: string }>}
                badge={item.badge}
                className={itemClassName}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

NavGroup.displayName = 'NavGroup'
