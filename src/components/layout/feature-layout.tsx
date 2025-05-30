import { ReactNode } from 'react'

interface FeatureLayoutProps {
  children: ReactNode
  title: string
  description?: string
  actions?: ReactNode
}

export function FeatureLayout({ children, title, description, actions }: FeatureLayoutProps) {
  return (
    <div className='container mx-auto py-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>{title}</h1>
          {description && (
            <p className='text-muted-foreground'>{description}</p>
          )}
        </div>
        {actions && (
          <div className='flex gap-2'>
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  )
} 