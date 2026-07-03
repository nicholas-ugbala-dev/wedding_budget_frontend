import { useState, useRef, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import {
  IconLayoutDashboard,
  IconList,
  IconReceipt,
  IconCalendarEvent,
  IconUsers,
  IconPlus,
  IconSettings,
  IconLogout,
} from '@tabler/icons-react'
import { useGetMe } from '@/store/queries/useAuth'

// Portal tooltip that appears to the right of the hovered element
function Tip({ label, children, show }: { label: string; children: ReactNode; show: boolean }) {
  const [top, setTop] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  if (!show) return <>{children}</>

  return (
    <div
      ref={ref}
      onMouseEnter={() => {
        if (ref.current) {
          const r = ref.current.getBoundingClientRect()
          setTop(r.top + r.height / 2)
        }
      }}
      onMouseLeave={() => setTop(null)}
    >
      {children}
      {top !== null && createPortal(
        <div
          style={{
            position: 'fixed',
            top,
            left: 64,
            transform: 'translateY(-50%)',
            background: '#1C1B18',
            color: 'white',
            padding: '4px 10px',
            borderRadius: 5,
            fontSize: 12,
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 9999,
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          }}
        >
          {label}
        </div>,
        document.body,
      )}
    </div>
  )
}

const NAV_PERSONAL = [
  { to: '/overview',  icon: IconLayoutDashboard, label: 'Overview' },
  { to: '/expenses',  icon: IconList,             label: 'All expenses' },
  { to: '/payments',  icon: IconReceipt,          label: 'Payments' },
  { to: '/events',    icon: IconCalendarEvent,    label: 'Events' },
] as const

const NAV_PLANNER = [
  { to: '/clients',   icon: IconUsers,            label: 'Clients' },
  { to: '/overview',  icon: IconLayoutDashboard,  label: 'Overview' },
  { to: '/expenses',  icon: IconList,             label: 'All expenses' },
  { to: '/payments',  icon: IconReceipt,          label: 'Payments' },
  { to: '/events',    icon: IconCalendarEvent,    label: 'Events' },
] as const

interface SidebarProps {
  onAddExpense: () => void
}

export function Sidebar({ onAddExpense }: SidebarProps) {
  const [expanded, setExpanded] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)
  const navigate = useNavigate()
  const { location } = useRouterState()
  const { data: user } = useGetMe()

  const isPlanner = user?.account_type === 'planner'
  const NAV = isPlanner ? NAV_PLANNER : NAV_PERSONAL

  const initials = user
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : '?'

  const isActive = (path: string) => location.pathname.startsWith(path)

  const logout = () => {
    localStorage.removeItem('auth_token')
    navigate({ to: '/login' })
  }

  useEffect(() => {
    if (!expanded) return
    function onMouseDown(e: MouseEvent) {
      if (!sidebarRef.current?.contains(e.target as Node)) {
        setExpanded(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [expanded])

  const collapsed = !expanded

  return (
    <aside
      ref={sidebarRef}
      className="h-full flex flex-col py-2.5 shrink-0 overflow-hidden"
      style={{
        background: '#EDECEA',
        borderRight: '1px solid #E0DDD6',
        width: expanded ? 200 : 56,
        transition: 'width 0.22s ease',
      }}
    >
      {/* Logo — toggles sidebar */}
      <div
        className="flex items-center gap-2.5 shrink-0 cursor-pointer"
        style={{ padding: '0 9px', marginBottom: 16 }}
        onClick={() => setExpanded(v => !v)}
      >
        <div className="w-9 h-9 rounded-[8px] bg-brand flex items-center justify-center shrink-0">
          <span className="text-white text-[15px] font-semibold tracking-[-0.5px]">M</span>
        </div>
        {expanded && (
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1C1B18', whiteSpace: 'nowrap' }}>
            Munachi
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1" style={{ padding: '0 9px' }}>
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = isActive(to)
          return (
            <Tip key={to} label={label} show={collapsed}>
              <Link
                to={to}
                className="h-9 rounded-lg flex items-center transition-colors shrink-0"
                style={{
                  gap: 10,
                  padding: expanded ? '0 10px' : '0',
                  justifyContent: expanded ? 'flex-start' : 'center',
                  background: active ? '#FFFFFF' : 'transparent',
                  color: active ? '#3A7A5A' : '#9B9890',
                  minWidth: 0,
                }}
              >
                <Icon size={20} />
                {expanded && (
                  <span style={{ fontSize: 13, fontWeight: active ? 500 : 400, whiteSpace: 'nowrap' }}>
                    {label}
                  </span>
                )}
              </Link>
            </Tip>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="flex flex-col items-center gap-2" style={{ padding: '0 9px' }}>
        {/* Add expense */}
        <Tip label="Add expense" show={collapsed}>
          <button
            type="button"
            onClick={onAddExpense}
            className="h-9 rounded-full bg-brand flex items-center border-none cursor-pointer shrink-0"
            style={{
              gap: 8,
              padding: expanded ? '0 16px' : '0',
              width: expanded ? 'fit-content' : 36,
              justifyContent: 'center',
            }}
          >
            <IconPlus size={18} color="white" />
            {expanded && (
              <span style={{ fontSize: 13, fontWeight: 500, color: 'white', whiteSpace: 'nowrap' }}>
                Add expense
              </span>
            )}
          </button>
        </Tip>

        {/* Settings */}
        <Tip label="Settings" show={collapsed}>
          <Link
            to="/settings"
            className="h-9 rounded-lg flex items-center shrink-0"
            style={{
              gap: 10,
              padding: expanded ? '0 10px' : '0',
              width: expanded ? '100%' : 36,
              justifyContent: expanded ? 'flex-start' : 'center',
              color: isActive('/settings') ? '#3A7A5A' : '#9B9890',
            }}
          >
            <IconSettings size={20} />
            {expanded && (
              <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>Settings</span>
            )}
          </Link>
        </Tip>

        {/* User section */}
        {expanded ? (
          <div
            className="flex flex-col w-full"
            style={{ borderTop: '1px solid #DDD9D3', paddingTop: 10, marginTop: 2, gap: 8 }}
          >
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="flex items-center gap-2.5 cursor-pointer border-none shrink-0"
              style={{ background: 'transparent', padding: 0, fontFamily: 'inherit' }}
            >
              <div
                className="w-9 h-9 rounded-full bg-brand-light border border-[#C8DDD4] flex items-center justify-center shrink-0"
                style={{ fontSize: 11, fontWeight: 600, color: '#3A7A5A' }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <span style={{ fontSize: 13, fontWeight: 500, color: '#1C1B18', whiteSpace: 'nowrap' }}>
                  {user?.first_name ?? ''}
                </span>
                {isPlanner && (
                  <div style={{ fontSize: 10, color: '#9B9890', whiteSpace: 'nowrap' }}>Planner</div>
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={logout}
              className="h-9 rounded-lg flex items-center cursor-pointer border-none shrink-0"
              style={{
                gap: 8,
                padding: '0 10px',
                background: 'transparent',
                color: '#C43C3C',
                fontFamily: 'inherit',
              }}
            >
              <IconLogout size={16} />
              <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>Sign out</span>
            </button>
          </div>
        ) : (
          <Tip label={user ? `${user.first_name} ${user.last_name}` : 'Account'} show>
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="w-9 h-9 rounded-full bg-brand-light border border-[#C8DDD4] flex items-center justify-center border-none cursor-pointer"
              style={{ fontSize: 11, fontWeight: 600, color: '#3A7A5A' }}
            >
              {initials}
            </button>
          </Tip>
        )}
      </div>
    </aside>
  )
}
