import { useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { SlidePanel } from './SlidePanel'
import { ExpensePanel } from '@/components/expenses/ExpensePanel'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [addExpenseOpen, setAddExpenseOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar onAddExpense={() => setAddExpenseOpen(true)} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      <SlidePanel open={addExpenseOpen} onClose={() => setAddExpenseOpen(false)}>
        <ExpensePanel onClose={() => setAddExpenseOpen(false)} />
      </SlidePanel>
    </div>
  )
}
