// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Select as ImpactSelect } from 'impact-ui/src/components/Select/index.js'
import { useState, useEffect, useCallback } from 'react'

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
  /** Render menu in a portal so it is not clipped by overflow:hidden parents */
  withPortal?: boolean
  /** Show search inside dropdown (default true) */
  searchable?: boolean
  /** Show clear (×) control when a value is selected (default true) */
  clearable?: boolean
}

function toOption(v: string | SelectOption): SelectOption {
  return typeof v === 'string' ? { label: v, value: v } : v
}

/** impact-ui single-select passes one option object; multi/clear pass an array */
function pickSelectedValue(
  payload: SelectOption | SelectOption[] | null | undefined,
  eventLike?: { action?: string }
): string {
  if (eventLike?.action === 'clear') return ''
  if (payload == null) return ''
  if (Array.isArray(payload)) return payload[0]?.value ?? ''
  if (typeof payload === 'object' && 'value' in payload) {
    return String((payload as SelectOption).value ?? '')
  }
  return ''
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  label,
  disabled,
  withPortal = false,
  searchable = true,
  clearable = true,
}: SelectProps) {
  const normalised = options.map(toOption)
  /** impact-ui uses an object for isMulti=false (see getPlaceholder in impact-ui utils) */
  const selectedForImpact =
    value != null && value !== ''
      ? normalised.find((o) => o.value === value) ?? { label: value, value }
      : {}

  const [current, setCurrent] = useState<SelectOption[]>(normalised)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setCurrent(normalised)
  }, [options])

  const applySelection = useCallback(
    (
      payload: SelectOption | SelectOption[] | null | undefined,
      event?: unknown
    ) => {
      const evt = event as { action?: string } | undefined
      onChange(pickSelectedValue(payload, evt))
      setIsOpen(false)
    },
    [onChange]
  )

  return (
    <ImpactSelect
      label={label}
      placeholder={placeholder}
      isDisabled={disabled}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      withPortal={withPortal}
      dropDownPortalClassName={withPortal ? 'ia-select-portal-menu' : ''}
      initialOptions={normalised}
      currentOptions={current}
      setCurrentOptions={setCurrent}
      selectedOptions={selectedForImpact}
      setSelectedOptions={applySelection}
      handleChange={applySelection}
      isMulti={false}
      isClearable={clearable}
      isWithSearch={searchable}
    />
  )
}
