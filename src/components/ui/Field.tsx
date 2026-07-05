import { forwardRef, useState, type InputHTMLAttributes } from 'react'
import { IconEye, IconEyeOff } from '@tabler/icons-react'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em]">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            {...props}
            className="h-[38px] border border-border rounded-[7px] px-3 text-[13px] bg-panel text-text-primary w-full placeholder:text-text-faint"
            style={isPassword ? { paddingRight: 36 } : undefined}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              tabIndex={-1}
            >
              {showPassword ? <IconEyeOff size={15} /> : <IconEye size={15} />}
            </button>
          )}
        </div>
        {error && <span className="text-[11px] text-outstanding">{error}</span>}
      </div>
    )
  }
)

Field.displayName = 'Field'

import { AppSelect, type SelectOption } from '@/components/ui/AppSelect'

interface SelectFieldProps {
  label: string
  error?: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
}

export function SelectField({ label, error, value, onChange, options, placeholder, disabled }: SelectFieldProps) {
  return (
    <AppSelect
      label={label}
      error={error}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
    />
  )
}

