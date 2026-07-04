interface Props {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export function CenteredModal({ open, onClose, children }: Props) {
  if (!open) return null

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }} />
      <div style={{ position: 'relative', zIndex: 1 }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
