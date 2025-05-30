import * as React from 'react'

export const BronzeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox='0 0 32 32' fill='none' {...props}>
    <circle
      cx='16'
      cy='16'
      r='14'
      fill='#CD7F32'
      stroke='#A97142'
      strokeWidth='2'
    />
    <path
      d='M16 8v8l6 3'
      stroke='#A97142'
      strokeWidth='2'
      strokeLinecap='round'
    />
  </svg>
)

export const SilverIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox='0 0 32 32' fill='none' {...props}>
    <circle
      cx='16'
      cy='16'
      r='14'
      fill='#C0C0C0'
      stroke='#A0A0A0'
      strokeWidth='2'
    />
    <path
      d='M16 8v8l6 3'
      stroke='#A0A0A0'
      strokeWidth='2'
      strokeLinecap='round'
    />
  </svg>
)

export const GoldIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox='0 0 32 32' fill='none' {...props}>
    <circle
      cx='16'
      cy='16'
      r='14'
      fill='#FFD700'
      stroke='#BFA100'
      strokeWidth='2'
    />
    <path
      d='M16 8v8l6 3'
      stroke='#BFA100'
      strokeWidth='2'
      strokeLinecap='round'
    />
  </svg>
)

export const DiamondIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox='0 0 32 32' fill='none' {...props}>
    <rect
      x='4'
      y='8'
      width='24'
      height='16'
      rx='8'
      fill='#B9F2FF'
      stroke='#5BC0EB'
      strokeWidth='2'
    />
    <path
      d='M8 16l8 8 8-8-8-8-8 8z'
      fill='#E0FFFF'
      stroke='#5BC0EB'
      strokeWidth='1.5'
    />
  </svg>
)
