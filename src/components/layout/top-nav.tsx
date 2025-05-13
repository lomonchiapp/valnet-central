import { Link, useLocation } from 'react-router-dom'
import { IconMenu } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TopNavProps extends React.HTMLAttributes<HTMLElement> {
  links: {
    title: string
    href: string
    isActive: boolean
    disabled?: boolean
  }[]
}

export function TopNav({ className, links, ...props }: TopNavProps) {
  const location = useLocation()

  // Función para verificar si un link está activo
  const isActiveLink = (href: string) => {
    return location.pathname === href
  }

  return (
    <>
      <div className='md:hidden'>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size='icon' variant='outline'>
              <IconMenu />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side='bottom' align='start'>
            {links.map(({ title, href, disabled }) => (
              <DropdownMenuItem key={`${title}-${href}`} asChild>
                <Link
                  to={href}
                  className={cn(
                    !isActiveLink(href) && 'text-muted-foreground',
                    disabled && 'pointer-events-none opacity-50'
                  )}
                >
                  {title}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav
        className={cn(
          'hidden items-center space-x-4 md:flex lg:space-x-6',
          className
        )}
        {...props}
      >
        {links.map(({ title, href, disabled }) => (
          <Link
            key={`${title}-${href}`}
            to={href}
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              !isActiveLink(href) && 'text-muted-foreground',
              disabled && 'pointer-events-none opacity-50'
            )}
          >
            {title}
          </Link>
        ))}
      </nav>
    </>
  )
}
