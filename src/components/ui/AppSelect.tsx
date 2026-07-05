import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { IconChevronDown } from '@tabler/icons-react'

export interface SelectOption {
  value: string
  label: string
}

interface Props {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  style?: React.CSSProperties
  containerStyle?: React.CSSProperties
  variant?: 'default' | 'inline'
}

export function AppSelect({
  value, onChange, options, placeholder = 'Select…',
  label, error, disabled, style, containerStyle, variant = 'default',
}: Props) {
  const [open, setOpen] = useState(false)
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      const target = e.target as Node
      if (!triggerRef.current?.contains(target) && !dropdownRef.current?.contains(target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  function handleToggle() {
    if (disabled) return
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect()
      setDropPos({ top: r.bottom + 4, left: r.left, width: r.width })
    }
    setOpen(o => !o)
  }

  const selected = options.find(o => o.value === value)
  const isInline  = variant === 'inline'

  const triggerStyle: React.CSSProperties = isInline
    ? {
        border: 'none', background: 'transparent',
        padding: '0 1px', fontSize: 'inherit', color: 'inherit',
        fontFamily: 'inherit', cursor: disabled ? 'default' : 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 2,
        outline: 'none', opacity: disabled ? 0.6 : 1,
        ...style,
      }
    : {
        height: 38,
        border: `1px solid ${open ? '#3A7A5A' : '#E8E6E0'}`,
        borderRadius: 7, padding: '0 10px 0 12px', fontSize: 13,
        background: disabled ? '#F4F3EF' : '#FAFAF8',
        color: selected ? '#1C1B18' : '#9B9890',
        width: '100%', fontFamily: 'inherit',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4,
        boxSizing: 'border-box' as const,
        outline: open ? '2px solid #3A7A5A' : 'none', outlineOffset: 0,
        textAlign: 'left' as const, opacity: disabled ? 0.7 : 1,
        ...style,
      }

  const wrapperStyle: React.CSSProperties = isInline
    ? { position: 'relative', display: 'inline-flex', ...containerStyle }
    : { position: 'relative', width: '100%', ...containerStyle }

  const control = (
    <div style={wrapperStyle}>
      <button ref={triggerRef} type="button" onClick={handleToggle} style={triggerStyle}>
        <span style={isInline ? {} : { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {selected ? selected.label : placeholder}
        </span>
        {!disabled && (
          <IconChevronDown
            size={isInline ? 10 : 14}
            color={isInline ? 'currentColor' : '#9B9890'}
            style={{ flexShrink: 0, transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none', opacity: 0.6 }}
          />
        )}
      </button>

      {open && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed', top: dropPos.top, left: dropPos.left,
            width: isInline ? Math.max(dropPos.width, 140) : dropPos.width,
            background: 'white', border: '1px solid #E8E6E0', borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)', zIndex: 9999,
            maxHeight: 220, overflowY: 'auto',
          }}
        >
          {options.map(opt => {
            const isSelected = opt.value === value
            return (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                style={{
                  padding: '8px 12px', fontSize: 13,
                  color: isSelected ? '#3A7A5A' : '#1C1B18',
                  background: isSelected ? '#F0F8F4' : 'transparent',
                  fontWeight: isSelected ? 500 : 400, cursor: 'pointer',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#F7F6F2' }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
              >
                {opt.label}
              </div>
            )
          })}
        </div>,
        document.body,
      )}
    </div>
  )

  if (isInline) return control

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 11, fontWeight: 600, color: '#9B9890', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          {label}
        </label>
      )}
      {control}
      {error && <span style={{ fontSize: 11, color: '#C43C3C' }}>{error}</span>}
    </div>
  )
}
