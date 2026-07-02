interface Props {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export function SlidePanel({ open, onClose, children }: Props) {
  if (!open) return null

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'stretch' }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.18)' }} />
      {/* Panel — stops click propagation so clicks inside don't close */}
      <div onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
