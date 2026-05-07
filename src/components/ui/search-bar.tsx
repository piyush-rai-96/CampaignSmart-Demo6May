// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Input } from 'impact-ui/src/components/Input/index.js'
import { Search } from 'lucide-react'
import type { ChangeEvent, FocusEventHandler, KeyboardEventHandler } from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Controls the wrapper div width — e.g. "w-64", "flex-1", "w-full" */
  className?: string
  /** Use production-style search visuals (Impact theme) */
  variant?: 'default' | 'production'
  /** Impact UI size: "small" = 24px, "medium" = 28px, "large" = 32px (default) */
  size?: 'small' | 'medium' | 'large'
  onFocus?: FocusEventHandler<HTMLInputElement>
  onBlur?: FocusEventHandler<HTMLInputElement>
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>
  autoComplete?: string
  autoFocus?: boolean
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  className,
  variant = 'production',
  size = 'large',
  onFocus,
  onBlur,
  onKeyDown,
  autoComplete = 'off',
  autoFocus,
}: SearchBarProps) {
  return (
    <div className={`${variant === 'production' ? 'ia-search' : ''} ${className ?? ''}`}>
      <Input
        leftIcon={<Search />}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        size={size}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
      />
    </div>
  )
}
