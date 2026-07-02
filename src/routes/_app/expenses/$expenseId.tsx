import { createFileRoute } from '@tanstack/react-router'
import { ExpenseDetailPage } from '@/components/expenses/ExpenseDetailPage'

export const Route = createFileRoute('/_app/expenses/$expenseId')({
  component: () => {
    const { expenseId } = Route.useParams()
    return <ExpenseDetailPage expenseId={expenseId} />
  },
})
