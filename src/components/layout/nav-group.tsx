import * as React from 'react'
import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NavItem } from '@/components/layout/nav-item'
import { NavGroup as NavGroupType } from './types'

interface NavGroupProps extends Omit<NavGroupType, 'type'> {
  itemClassName?: string
  titleClassName?: string
}

export const NavGroup: React.FC<NavGroupProps> = ({
  title,
  children,
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
          {children.map((item) => {
            if ('url' in item && item.url) {
              return (
                <NavItem
                  key={item.url}
                  title={item.title}
                  url={item.url}
                  icon={item.icon as React.ComponentType<{ className?: string }>}
                  badge={undefined}
                  className={itemClassName}
                />
              )
            }
            return null
          })}
        </div>
      )}
    </div>
  )
}

NavGroup.displayName = 'NavGroup'
