import { useState, useEffect, type ReactNode } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { Sidebar } from './Sidebar'
import { CenteredModal } from './CenteredModal'
import { ExpensePanel } from '@/components/expenses/ExpensePanel'
import { useGetMe } from '@/store/queries/useAuth'
import { useClientStore } from '@/store/useClientStore'

interface AppShellProps {
  children: ReactNode
}

// Only redirect when a planner is on a page that explicitly requires client context.
// Using an allowlist (not blocklist) so logout/external navigations never trigger the loop.
const CLIENT_REQUIRED_PATHS = ['/overview', '/events', '/expenses', '/payments']

export function AppShell({ children }: AppShellProps) {
  const [addExpenseOpen, setAddExpenseOpen] = useState(false)
  const { data: user } = useGetMe()
  const { activeClient } = useClientStore()
  const navigate = useNavigate()
  const { location } = useRouterState()

  useEffect(() => {
    if (!localStorage.getItem('auth_token')) return  // During/after logout — skip
    if (!user) return
    if (user.account_type !== 'planner') return
    if (activeClient) return
    const path = location.pathname
    if (CLIENT_REQUIRED_PATHS.some(p => path.startsWith(p))) {
      navigate({ to: '/clients' })
    }
  }, [user, activeClient, location.pathname, navigate])

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar onAddExpense={() => setAddExpenseOpen(true)} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      <CenteredModal open={addExpenseOpen} onClose={() => setAddExpenseOpen(false)}>
        <ExpensePanel onClose={() => setAddExpenseOpen(false)} />
      </CenteredModal>
    </div>
  )
}
