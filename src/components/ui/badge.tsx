// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Badge as ImpactBadge } from 'impact-ui/src/components/Badge/index.js'
import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'agent'

interface BadgeProps {
  variant?: BadgeVariant
  className?: string
  children?: ReactNode
  [key: string]: unknown
}

const variantToImpact = (
  variant: BadgeVariant,
): { impactVariant: string; color?: string } => {
  switch (variant) {
    case 'success':
      return { impactVariant: 'subtle', color: 'success' }
    case 'warning':
      return { impactVariant: 'subtle', color: 'warning' }
    case 'danger':
      return { impactVariant: 'subtle', color: 'error' }
    case 'info':
      return { impactVariant: 'subtle', color: 'info' }
    case 'agent':
      return { impactVariant: 'subtle', color: 'primary' }
    default:
      return { impactVariant: 'subtle' }
  }
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  const { impactVariant, color } = variantToImpact(variant)

  return (
    <ImpactBadge
      variant={impactVariant}
      color={color}
      label={children}
      size="small"
      className={className}
      {...props}
    />
  )
}
