import React from 'react'
import { Input } from './input'

interface NumericInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number
  onChange: (value: number) => void
  prefix?: string
}

export function NumericInput({
  value,
  onChange,
  prefix = '',
  ...props
}: NumericInputProps) {
  const formatValue = (val: number) => {
    return new Intl.NumberFormat('es-DO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '')
    const numberValue = parseFloat(value) || 0
    onChange(numberValue)
  }

  return (
    <div className='relative'>
      <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
        {prefix}
      </span>
      <Input
        {...props}
        type='text'
        value={formatValue(value)}
        onChange={handleChange}
        className={`pl-12 text-right ${props.className}`}
      />
    </div>
  )
}
