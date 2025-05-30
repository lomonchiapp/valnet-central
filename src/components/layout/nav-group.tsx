import * as React from 'react'
import { Link } from 'react-router-dom'
import { NavGroup as NavGroupType } from './types'

export const NavGroup: React.FC<NavGroupType> = ({ title, items }) => {
  return (
    <div className='mb-4'>
      <div className='px-4 py-2 text-xs font-bold uppercase text-muted-foreground tracking-wider'>
        {title}
      </div>
      <ul className='space-y-1'>
        {items.map((item) => (
          <li key={item.title}>
            {'url' in item && item.url ? (
              <Link
                to={item.url}
                className='flex items-center gap-2 px-4 py-2 rounded hover:bg-accent transition-colors'
              >
                {item.icon &&
                  React.createElement(item.icon, { className: 'w-4 h-4' })}
                <span>{item.title}</span>
                {item.badge && (
                  <span className='ml-auto bg-primary text-xs px-2 py-0.5 rounded-full'>
                    {item.badge}
                  </span>
                )}
              </Link>
            ) : (
              <div className='px-4 py-2 text-muted-foreground flex items-center gap-2'>
                {item.icon &&
                  React.createElement(item.icon, { className: 'w-4 h-4' })}
                <span>{item.title}</span>
                {item.badge && (
                  <span className='ml-auto bg-primary text-xs px-2 py-0.5 rounded-full'>
                    {item.badge}
                  </span>
                )}
              </div>
            )}
            {/* Si el item es colapsable y tiene subitems */}
            {'items' in item &&
              Array.isArray(item.items) &&
              item.items.length > 0 && (
                <ul className='ml-4 border-l border-muted-foreground/20 pl-2 mt-1 space-y-1'>
                  {item.items.map((subitem) => (
                    <li key={subitem.title}>
                      <Link
                        to={subitem.url}
                        className='flex items-center gap-2 px-2 py-1 rounded hover:bg-accent transition-colors text-sm'
                      >
                        {subitem.icon &&
                          React.createElement(subitem.icon, {
                            className: 'w-3 h-3',
                          })}
                        <span>{subitem.title}</span>
                        {subitem.badge && (
                          <span className='ml-auto bg-primary text-xs px-2 py-0.5 rounded-full'>
                            {subitem.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
          </li>
        ))}
      </ul>
    </div>
  )
}

NavGroup.displayName = 'NavGroup'
