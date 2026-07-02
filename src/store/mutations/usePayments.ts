import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPayment, updatePayment, deletePayment } from '@/store/requests/payments';
import { toast } from 'sonner';
import type { ApiError } from '@/types/api';
import { PAYMENTS_KEY,
    PAYMENT_SUMMARY_KEY,
    EXPENSES_KEY,
    EXPENSE_DETAIL_KEY,
    DASHBOARD_KEY
} from '@/store/queryKeys';


export const useCreatePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPayment,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: [EXPENSE_DETAIL_KEY(variables.expenseId)] });
      qc.invalidateQueries({ queryKey: [EXPENSES_KEY] });
      qc.invalidateQueries({ queryKey: [PAYMENTS_KEY] });
      qc.invalidateQueries({ queryKey: [PAYMENT_SUMMARY_KEY] });
      qc.invalidateQueries({ queryKey: [DASHBOARD_KEY] });
      toast.success('Payment recorded');
    },
    onError: (err: ApiError) =>
        toast.error(err.response?.data?.message ?? 'Failed to record payment'),
  })
}

export const useUpdatePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updatePayment,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: [EXPENSE_DETAIL_KEY(variables.expenseId)] });
      qc.invalidateQueries({ queryKey: [EXPENSES_KEY] });
      qc.invalidateQueries({ queryKey: [PAYMENTS_KEY] });
      qc.invalidateQueries({ queryKey: [PAYMENT_SUMMARY_KEY] });
      qc.invalidateQueries({ queryKey: [DASHBOARD_KEY] });
      toast.success('Payment updated');
    },
    onError: (err: ApiError) =>
        toast.error(err.response?.data?.message ?? 'Failed to update payment'),
  })
}

export const useDeletePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePayment,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: [EXPENSE_DETAIL_KEY(variables.expenseId)] });
      qc.invalidateQueries({ queryKey: [EXPENSES_KEY] });
      qc.invalidateQueries({ queryKey: [PAYMENTS_KEY] });
      qc.invalidateQueries({ queryKey: [PAYMENT_SUMMARY_KEY] });
      qc.invalidateQueries({ queryKey: [DASHBOARD_KEY] });
      toast.success('Payment deleted');
    },
    onError: (err: ApiError) =>
        toast.error(err.response?.data?.message ?? 'Failed to delete payment'),
  })
}