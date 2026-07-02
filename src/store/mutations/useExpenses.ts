import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExpense, updateExpense, deleteExpense } from "../requests/expenses";
import { toast } from 'sonner';
import {
    EXPENSES_KEY,
    EXPENSE_DETAIL_KEY,
    DASHBOARD_KEY
} from '@/store/queryKeys';
import type { ApiError } from "@/types/api";



export const useCreateExpense = () => {
    const qc = useQueryClient();
    
    return useMutation({
        mutationFn: createExpense,
        onSuccess: () => {
            qc.invalidateQueries({queryKey: [EXPENSES_KEY]});
            qc.invalidateQueries({queryKey: [DASHBOARD_KEY]});
            toast.success('Expense created');
        },
        onError: (err: ApiError) =>
            toast.error(err.response?.data?.message ?? 'Failed to create expense'),
    });
}

export const useUpdateExpense = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateExpense,
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: [EXPENSES_KEY]});
            qc.invalidateQueries({ queryKey: [EXPENSE_DETAIL_KEY(variables.id)]});
            toast.success('Expense updated');
        },
        onError: (err: ApiError) =>
            toast.error(err.response?.data?.message ?? 'Failed to update expense'),
    })
}

export const useDeleteExpense = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteExpense,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [EXPENSES_KEY]});
            qc.invalidateQueries({ queryKey: [DASHBOARD_KEY]});
            toast.success('Expense deleted');
        },
        onError: (err: ApiError) =>
            toast.error(err.response?.data?.message ?? 'Failed to delete expense'),
    })

}