import * as React from 'react'

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, max = 100, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative h-3 w-full rounded-full bg-muted ${className || ''}`}
        {...props}
      >
        <div
          className='absolute left-0 top-0 h-3 rounded-full bg-blue-600 transition-all'
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    )
  }
)

Progress.displayName = 'Progress'

export { Progress }
