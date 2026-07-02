import { useQuery } from '@tanstack/react-query';
import { fetchExpenses, fetchExpenseById } from '@/store/requests/expenses';
import { EXPENSES_KEY, EXPENSE_DETAIL_KEY } from '@/store/queryKeys';
import type { Expense, ExpenseDetail } from '@/types/expense';
import type { PaginatedResult } from '@/types/pagination';

export const useGetExpenses = (params: Record<string, unknown>) =>
    useQuery<PaginatedResult<Expense>>({
        queryKey: [EXPENSES_KEY, params],
        queryFn: () => fetchExpenses(params),
    });

export const useGetExpenseById = (id: string) =>
    useQuery<ExpenseDetail>({
        queryKey: [EXPENSE_DETAIL_KEY(id)],
        queryFn: () => fetchExpenseById(id),
        enabled: !!id, // Only run the query if id is truthy
    });