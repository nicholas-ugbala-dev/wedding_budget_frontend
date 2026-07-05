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
import { useGetMe } from '@/store/queries/useAuth';
import { useClientStore } from '@/store/useClientStore';

export const useGetPayments = (params: Record<string, unknown>) => {
    const { data: user } = useGetMe();
    const { activeClient } = useClientStore();
    const isPlanner = user?.account_type === 'planner';
    const clientId = isPlanner ? activeClient?.id : undefined;
    const scopedParams = clientId ? { ...params, client_id: clientId } : params;

    return useQuery<PaginatedResult<PaymentListItem>>({
        queryKey: [PAYMENTS_KEY, scopedParams],
        queryFn: () => fetchPayments(scopedParams),
    });
};

export const useGetPaymentSummary = (eventId?: string) => {
    const { data: user } = useGetMe();
    const { activeClient } = useClientStore();
    const isPlanner = user?.account_type === 'planner';
    const clientId = isPlanner ? activeClient?.id : undefined;

    const params: Record<string, string> = {};
    if (eventId) params.event_id = eventId;
    if (clientId) params.client_id = clientId;

    return useQuery<PaymentSummary>({
        queryKey: [PAYMENT_SUMMARY_KEY, eventId, clientId],
        queryFn: () => fetchPaymentSummary(Object.keys(params).length ? params : undefined),
    });
};

export const useGetPaymentTypes = () =>
    useQuery({
        queryKey: [PAYMENT_TYPES_KEY],
        queryFn: fetchPaymentTypes,
    });