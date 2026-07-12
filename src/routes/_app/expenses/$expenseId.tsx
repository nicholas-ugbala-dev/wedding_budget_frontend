import { createFileRoute } from '@tanstack/react-router'
import { ExpenseDetailPage } from '@/components/expenses/ExpenseDetailPage'

function ExpenseIdPage() {
  const { expenseId } = Route.useParams()
  return <ExpenseDetailPage expenseId={expenseId} />
}

export const Route = createFileRoute('/_app/expenses/$expenseId')({
  component: ExpenseIdPage,
})
