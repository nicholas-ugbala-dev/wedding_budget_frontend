import { useQuery } from '@tanstack/react-query';
import { fetchExpenses, fetchExpenseById } from '@/store/requests/expenses';
import { EXPENSES_KEY, EXPENSE_DETAIL_KEY } from '@/store/queryKeys';
import { useGetMe } from '@/store/queries/useAuth';
import { useClientStore } from '@/store/useClientStore';
import type { Expense, ExpenseDetail } from '@/types/expense';
import type { PaginatedResult } from '@/types/pagination';

export const useGetExpenses = (params: Record<string, unknown>) => {
    const { data: user } = useGetMe();
    const { activeClient } = useClientStore();
    const isPlanner = user?.account_type === 'planner';
    const clientId = isPlanner ? activeClient?.id : undefined;
    const scopedParams = clientId ? { ...params, client_id: clientId } : params;

    return useQuery<PaginatedResult<Expense>>({
        queryKey: [EXPENSES_KEY, scopedParams],
        queryFn: () => fetchExpenses(scopedParams),
    });
};

export const useGetExpenseById = (id: string) =>
    useQuery<ExpenseDetail>({
        queryKey: [EXPENSE_DETAIL_KEY(id)],
        queryFn: () => fetchExpenseById(id),
        enabled: !!id, // Only run the query if id is truthy
    });