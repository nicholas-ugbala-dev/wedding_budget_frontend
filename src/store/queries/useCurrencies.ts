import { useQuery } from '@tanstack/react-query';
import { fetchCurrencies } from '@/store/requests/currencies';
import { CURRENCIES_KEY } from '@/store/queryKeys';
import { useGetMe } from './useAuth';
import { useClientStore } from '@/store/useClientStore';

export const useGetCurrencies = () => {
    const { data: user } = useGetMe();
    const { activeClient } = useClientStore();
    const isPlanner = user?.account_type === 'planner';
    const clientId = isPlanner ? activeClient?.id : undefined;

    return useQuery({
        queryKey: [CURRENCIES_KEY, clientId],
        queryFn: () => fetchCurrencies(clientId ? { client_id: clientId } : undefined),
        enabled: isPlanner ? !!clientId : true,
    });
};
