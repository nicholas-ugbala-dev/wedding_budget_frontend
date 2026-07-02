
import { createFileRoute } from '@tanstack/react-router'
import { ResetPasswordPage } from '@/components/auth/ResetPasswordPage'

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) ?? '',
  }),
  component: ResetPasswordPage,
})