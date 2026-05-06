// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Loader as ImpactLoader } from 'impact-ui/src/components/Loader/index.js'
import type { CSSProperties } from 'react'

type LoaderSize = 'small' | 'medium' | 'large'

interface LoaderProps {
  /**
   * Size of the spinner.
   * small = 16px  (replaces w-4/h-4 Loader2)
   * medium = 24px (replaces w-6/h-6 Loader2)
   * large = 40px  (replaces w-8+ Loader2)
   * Defaults to 'small'.
   */
  size?: LoaderSize
  /**
   * When true (default) renders a compact inline spinner with no surrounding
   * container or text — safe to use inside buttons, list items, etc.
   * When false, delegates to the impact-ui Loader (centred, with optional text).
   */
  inline?: boolean
  /** Only used when inline=false */
  text?: string
  /** Optional colour override via CSS colour string (e.g. "var(--color-agent)") */
  color?: string
  className?: string
  style?: CSSProperties
}

const inlineSizes: Record<LoaderSize, { outer: number; inner: number; border: number }> = {
  small: { outer: 16, inner: 12, border: 2 },
  medium: { outer: 24, inner: 18, border: 3 },
  large: { outer: 40, inner: 30, border: 5 },
}

export function Loader({
  size = 'small',
  inline = true,
  text,
  color = 'var(--color-primary)',
  className = '',
  style,
}: LoaderProps) {
  if (!inline) {
    return <ImpactLoader size={size} text={text} />
  }

  const { outer, inner } = inlineSizes[size]
  const offset = (outer - inner) / 2

  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        flexShrink: 0,
        width: outer,
        height: outer,
        borderRadius: '50%',
        position: 'relative',
        background: `conic-gradient(from 180deg at 50% 50%, rgba(0,0,0,0) 0deg, ${color} 360deg)`,
        animation: 'ia-spin 1s linear infinite',
        ...style,
      }}
    >
      {/* inner white "hole" to create donut effect */}
      <span
        style={{
          position: 'absolute',
          borderRadius: '50%',
          backgroundColor: 'white',
          width: inner,
          height: inner,
          top: offset,
          left: offset,
          animation: 'ia-spin 1s linear infinite',
          animationDirection: 'reverse',
        }}
      />
      <style>{`@keyframes ia-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
    </span>
  )
}
