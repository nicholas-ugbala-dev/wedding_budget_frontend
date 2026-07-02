import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { AppShell } from '@/components/layout/AppShell'

export const Route = createFileRoute('/_app')({
  beforeLoad: () => {
    const token = localStorage.getItem('auth_token')
    if (!token) throw redirect({ to: '/login' })
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
})