import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { IconPlus } from '@tabler/icons-react'

export interface ComboOption {
  id: string
  label: string
}

export interface ComboValue {
  id?: string
  label: string
}

interface Props {
  value: ComboValue
  onChange: (v: ComboValue) => void
  options: ComboOption[]
  allowCreate?: boolean
  placeholder?: string
}

const inputStyle: React.CSSProperties = {
  height: 38,
  border: '1px solid #E8E6E0',
  borderRadius: 7,
  padding: '0 12px',
  fontSize: 13,
  background: '#FAFAF8',
  color: '#1C1B18',
  width: '100%',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
}

export function AppCombobox({ value, onChange, options, allowCreate = true, placeholder = 'Search…' }: Props) {
  const [open, setOpen]     = useState(false)
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 })
  const wrapperRef  = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Mouse click outside — covers clicks on page but not keyboard Tab
  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      const t = e.target as Node
      if (!wrapperRef.current?.contains(t) && !dropdownRef.current?.contains(t)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  function handleFocus() {
    if (inputRef.current) {
      const r = inputRef.current.getBoundingClientRect()
      setDropPos({ top: r.bottom + 4, left: r.left, width: r.width })
    }
    setOpen(true)
  }

  // Keyboard Tab away — setTimeout lets a click on a dropdown item fire first
  function handleBlur() {
    setTimeout(() => setOpen(false), 150)
  }

  const q          = value.label.toLowerCase().trim()
  const filtered   = q ? options.filter(o => o.label.toLowerCase().includes(q)) : options
  const exactMatch = options.some(o => o.label.toLowerCase() === q)
  const showCreate = allowCreate && value.label.trim().length > 0 && !exactMatch
  const showDrop   = open && (filtered.length > 0 || showCreate)

  function select(opt: ComboOption) {
    onChange({ id: opt.id, label: opt.label })
    setOpen(false)
  }

  function create() {
    onChange({ label: value.label.trim() })
    setOpen(false)
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        value={value.label}
        onChange={e => onChange({ label: e.target.value })}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={inputStyle}
      />

      {showDrop && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: dropPos.top,
            left: dropPos.left,
            width: dropPos.width,
            background: 'white',
            border: '1px solid #E8E6E0',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            zIndex: 9999,
            maxHeight: 220,
            overflowY: 'auto',
          }}
        >
          {filtered.map(opt => (
            <div
              key={opt.id}
              onClick={() => select(opt)}
              style={{ padding: '8px 12px', fontSize: 13, color: '#1C1B18', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F7F6F2' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              {opt.label}
            </div>
          ))}

          {showCreate && (
            <>
              {filtered.length > 0 && (
                <div style={{ height: 1, background: '#F0EDE6', margin: '2px 0' }} />
              )}
              <div
                onClick={create}
                style={{
                  padding: '8px 12px',
                  fontSize: 13,
                  color: '#3A7A5A',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 500,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F7F6F2' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <IconPlus size={13} />
                Create "{value.label.trim()}"
              </div>
            </>
          )}
        </div>,
        document.body,
      )}
    </div>
  )
}
