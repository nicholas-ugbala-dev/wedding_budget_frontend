import { createFileRoute } from '@tanstack/react-router'
import { PaymentsPage } from '@/components/payments/PaymentsPage'

export const Route = createFileRoute('/_app/payments')({
  component: PaymentsPage,
})