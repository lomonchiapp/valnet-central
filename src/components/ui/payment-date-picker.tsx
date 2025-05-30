import { cn } from '@/lib/utils'
import { Button } from './button'
import { Label } from './label'

interface PaymentDatePickerProps {
  selectedDay: number
  onChange: (day: number) => void
  className?: string
}

export function PaymentDatePicker({
  selectedDay,
  onChange,
  className,
}: PaymentDatePickerProps) {
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  return (
    <div className={cn('space-y-2', className)}>
      <Label>Día de pago mensual</Label>
      <div className='flex flex-wrap gap-0.5'>
        {days.map((day) => (
          <Button
            key={day}
            type='button'
            variant='outline'
            className={cn(
              'h-7 w-7 p-0 text-xs font-normal',
              selectedDay === day &&
                'bg-primary text-primary-foreground hover:bg-primary/90',
              day > 28 && 'text-muted-foreground'
            )}
            onClick={() => onChange(day)}
          >
            {day}
          </Button>
        ))}
      </div>
      {selectedDay > 28 && (
        <p className='text-xs text-muted-foreground'>
          Para meses con menos días, el pago se procesará el último día.
        </p>
      )}
    </div>
  )
}
