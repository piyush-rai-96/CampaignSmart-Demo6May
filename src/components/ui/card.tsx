// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Card as ImpactCard } from 'impact-ui/src/components/Card/index.js'
import type { ReactNode, MouseEventHandler, CSSProperties } from 'react'

interface CardProps {
  hover?: boolean
  selected?: boolean
  /** Maps to impact-ui ia-card-{size} shadow scale */
  size?: 'extraSmall' | 'small' | 'medium' | 'large'
  sx?: Record<string, unknown>
  className?: string
  onClick?: MouseEventHandler<HTMLDivElement>
  children?: ReactNode
  style?: CSSProperties
  [key: string]: unknown
}

export function Card({
  hover,
  selected,
  size = 'small',
  sx: extSx,
  ...props
}: CardProps) {
  return (
    <ImpactCard
      size={size}
      sx={{
        maxWidth: 'none',
        minHeight: 'unset',
        padding: '20px',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        transition: 'all 0.2s',
        ...(hover && {
          cursor: 'pointer',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            borderColor: 'var(--color-primary)',
          },
        }),
        ...(selected && {
          outline: '2px solid var(--color-primary)',
          borderColor: 'var(--color-primary)',
          backgroundColor: 'var(--color-primary-subtle)',
        }),
        ...extSx,
      }}
      {...props}
    />
  )
}
