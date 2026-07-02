import { useQuery } from '@tanstack/react-query';
import type { PaginatedResult } from '@/types/pagination';
import type { PaymentListItem, PaymentSummary } from '@/types/payment';
import {
    fetchPayments,
    fetchPaymentSummary,
    fetchPaymentTypes,
} from '@/store/requests/payments';
import {
    PAYMENTS_KEY,
    PAYMENT_SUMMARY_KEY,
    PAYMENT_TYPES_KEY,
} from '@/store/queryKeys';



export const useGetPayments = (params: Record<string, unknown>) =>
    useQuery<PaginatedResult<PaymentListItem>>({
        queryKey: [PAYMENTS_KEY],
        queryFn: () => fetchPayments(params),
    });

export const useGetPaymentSummary = (ceremonyId?: string) =>
    useQuery<PaymentSummary>({
        queryKey: [PAYMENT_SUMMARY_KEY, ceremonyId],
        queryFn: () => fetchPaymentSummary(ceremonyId ? { ceremony_id: ceremonyId } : undefined),
    });

export const useGetPaymentTypes = () =>
    useQuery({
        queryKey: [PAYMENT_TYPES_KEY],
        queryFn: fetchPaymentTypes,
    });