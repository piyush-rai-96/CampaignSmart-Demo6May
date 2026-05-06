// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Select as ImpactSelect } from 'impact-ui/src/components/Select/index.js'
import { useState, useEffect } from 'react'

interface SelectOption {
  label: string
  value: string
}

interface SelectProps {
  /** Controlled string value */
  value: string
  onChange: (value: string) => void
  /** Options as strings or {label, value} objects */
  options: string[] | SelectOption[]
  placeholder?: string
  label?: string
  disabled?: boolean
  className?: string
}

function toOption(v: string | SelectOption): SelectOption {
  return typeof v === 'string' ? { label: v, value: v } : v
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  label,
  disabled,
}: SelectProps) {
  const normalised = options.map(toOption)
  const selected = value ? [normalised.find(o => o.value === value) ?? { label: value, value }] : []
  const [current, setCurrent] = useState<SelectOption[]>(normalised)

  // Keep current in sync if options change
  useEffect(() => {
    setCurrent(normalised)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.length])

  return (
    <ImpactSelect
      label={label}
      placeholder={placeholder}
      isDisabled={disabled}
      initialOptions={normalised}
      currentOptions={current}
      setCurrentOptions={setCurrent}
      selectedOptions={selected}
      setSelectedOptions={(opts: SelectOption[]) => {
        const first = opts?.[0]
        onChange(first?.value ?? '')
      }}
      handleChange={(opts: SelectOption[]) => {
        const first = opts?.[0]
        onChange(first?.value ?? '')
      }}
      isMulti={false}
      isClearable
      isWithSearch
    />
  )
}
