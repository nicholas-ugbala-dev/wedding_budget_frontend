import { forwardRef, type InputHTMLAttributes } from 'react'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em]">
          {label}
        </label>
        <input
          ref={ref}
          {...props}
          className="h-[38px] border border-border rounded-[7px] px-3 text-[13px] bg-panel text-text-primary w-full placeholder:text-text-faint"
        />
        {error && <span className="text-[11px] text-outstanding">{error}</span>}
      </div>
    )
  }
)

Field.displayName = 'Field'

import { type SelectHTMLAttributes } from 'react'

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  children: React.ReactNode
}

export function SelectField({ label, error, children, ...props }: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.05em]">
        {label}
      </label>
      <select
        {...props}
        className="h-[38px] border border-border rounded-[7px] px-3 text-[13px] bg-panel text-text-primary w-full"
      >
        {children}
      </select>
      {error && <span className="text-[11px] text-outstanding">{error}</span>}
    </div>
  )
}

